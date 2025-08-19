'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Viewer, Entity, Camera, CesiumComponentRef } from 'resium';
import * as Cesium from 'cesium';
import { useMapDataWorker } from '@/hooks/useMapDataWorker';
import { useUIStore } from '@/store/useUIStore';
import { useMapStore } from '@/store/useMapStore';
import { useVillas } from '@/hooks/useVillas';
import { useAlerts } from '@/hooks/useAlerts';
import { filterLatestAlertsPerVilla } from '@/utils/dataUtils';
import VillaDetails from '@/components/VillaDetails';

import { NormalizedVilla } from '@/types/villas';
import { Alert } from '@/types/alerts';


// Extend interfaces for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
    flyToLocationDirect?: (lon: number, lat: number, height: number) => void;
  }
}

// Extend Cesium Entity to include villa and alert data
declare module 'cesium' {
  interface Entity {
    villa?: NormalizedVilla;
    markerData?: {
      type: 'villa' | 'alert';
      data: NormalizedVilla | unknown;
    };
  }
}

// Set Cesium access token and base URL for local assets
if (typeof window !== 'undefined') {
  const accessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN;
  
  if (accessToken && accessToken !== 'YOUR_CESIUM_ACCESS_TOKEN_HERE') {
    Cesium.Ion.defaultAccessToken = accessToken;
  } else {
    console.warn('Cesium access token not set. Please add NEXT_PUBLIC_CESIUM_ACCESS_TOKEN to your .env.local file');
    // Use a default token for development (limited functionality)
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjg0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxY';
  }
  
  // Set the base URL for Cesium assets to use local files
  window.CESIUM_BASE_URL = '/cesium/';
}

export default function MapView() {
  const viewerRef = useRef<CesiumComponentRef<Cesium.Viewer> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapEntities, setMapEntities] = useState<Cesium.Entity[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<NormalizedVilla | null>(null);
  const [isVillaDetailsOpen, setIsVillaDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  
  const { emirate } = useUIStore();
  const { setViewportBounds, setCameraHeight, flyToLocation } = useMapStore();
  const { isWorkerReady, isProcessing, workerError, processMapData, getEmirateBounds } = useMapDataWorker();
  const { data: villas, isLoading: villasLoading, error: villasError } = useVillas();
  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useAlerts();

  // Apply filtering to remove duplicate alerts for the same villa - memoized to prevent unnecessary recalculations
  const filteredAlerts = useMemo(() => {
    return alerts && Array.isArray(alerts) ? filterLatestAlertsPerVilla(alerts) : [];
  }, [alerts]);





  // Direct fly-to-location function
  const flyToLocationDirect = useCallback((lon: number, lat: number, height: number) => {
    if (!viewerRef.current?.cesiumElement) {
      return;
    }

    const viewer = viewerRef.current.cesiumElement;
    const camera = viewer.camera;
    
    try {
      camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        duration: 2.0,
        complete: () => {
          // Ensure the marker is perfectly visible by slightly adjusting the camera
          setTimeout(() => {
            camera.zoomIn(0); // Fine-tune the zoom for perfect marker visibility
          }, 100);
        }
      });
    } catch (error) {
      console.error('Error in direct fly-to-location:', error);
    }
  }, []);

  // Expose the fly-to function globally for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { flyToLocationDirect: typeof flyToLocationDirect }).flyToLocationDirect = flyToLocationDirect;
    }
  }, [flyToLocationDirect]);

  // Handle villa marker click
  const handleVillaClick = useCallback((villa: NormalizedVilla) => {
    setSelectedVilla(villa);
    setIsVillaDetailsOpen(true);
  }, []);

  // Handle villa details fly to location
  const handleVillaFlyTo = useCallback(() => {
    if (selectedVilla) {
      flyToLocationDirect(selectedVilla.Longitude, selectedVilla.Latitude, 500); // Very close zoom - 500m height
      setIsVillaDetailsOpen(false);
      setSelectedVilla(null);
    }
  }, [selectedVilla, flyToLocationDirect]);

  // Close villa details
  const handleCloseVillaDetails = useCallback(() => {
    setIsVillaDetailsOpen(false);
    setSelectedVilla(null);
  }, []);

  // Debounced function to update map data
  const debouncedUpdateMap = useCallback(
    debounce(async () => {
      if (!viewerRef.current?.cesiumElement || !isWorkerReady) {
        return;
      }

      const viewer = viewerRef.current.cesiumElement;
      const camera = viewer.camera;
      const rectangle = camera.computeViewRectangle();
      
      if (!rectangle) {
        return;
      }

      const viewportBounds = {
        west: Cesium.Math.toDegrees(rectangle.west),
        east: Cesium.Math.toDegrees(rectangle.east),
        south: Cesium.Math.toDegrees(rectangle.south),
        north: Cesium.Math.toDegrees(rectangle.north),
      };

      const cameraHeight = camera.positionCartographic.height;
      
      setViewportBounds(viewportBounds);
      setCameraHeight(cameraHeight);

      try {
        const { clusters, markers } = await processMapData({
          viewportBounds,
          cameraHeight,
          emirate,
          showNonAlertAboveZoom: false,
        });
        
        // Clear existing entities
        viewer.entities.removeAll();
        
        // Add cluster entities
        clusters.forEach(cluster => {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(cluster.lon, cluster.lat),
            point: {
              pixelSize: 20,
              color: Cesium.Color.WHITE.withAlpha(0.7), // Transparent white
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
            },
            label: {
              text: cluster.count.toString(),
              font: '14px sans-serif',
              fillColor: Cesium.Color.BLACK,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, 0), // Center the text
            },
          });
        });

        // Add ALL alert markers - always show regardless of zoom level
        const alertMarkers = markers.filter(marker => marker.isAlert);
        
        // Create alert markers for ALL alerts from processed data
        alertMarkers.forEach((marker, index) => {
          
          // Determine icon based on alert status
          let iconUrl: string;
          let pixelSize: number;
          let height: number;

          if (marker.status === 'open') {
            // Open alert - red alarm icon
            iconUrl = '/alarmIcon.svg';
            pixelSize = 30;
            height = 28;
          } else {
            // Closed alert - green alarm icon
            iconUrl = '/greenAlarm.svg';
            pixelSize = 35;
            height = 40;
          }

          // Use the actual alert data from the worker
          const alertData = marker.alertData;

          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(marker.lon, marker.lat),
            billboard: {
              image: iconUrl,
              width: pixelSize,
              height: height,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            },
            label: {
              text: marker.accountNumber,
              font: '12px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -pixelSize - 5),
            },
            name: `Alert - ${marker.accountNumber}`,
          });



          // Store marker data for click handling
          if (alertData) {
            entity.markerData = {
              type: 'alert',
              data: alertData
            };
          }
        });

        // Add filtered alerts from alerts data directly - ensure no alerts are missed
        if (filteredAlerts && Array.isArray(filteredAlerts)) {
          
          // Filter alerts by emirate if needed
          const emirateFilteredAlerts = emirate === 'All' ? filteredAlerts : filteredAlerts.filter(alert => {
            // Find corresponding villa to check emirate
            const villa = villas?.data?.find(v => v.Account_Number === alert.Account_ID);
            return villa?.City === emirate;
          });
          
          emirateFilteredAlerts.forEach((alert, index) => {
            // Check if this alert already has a marker
            const existingMarker = alertMarkers.find(m => m.accountNumber === alert.Account_ID);
            if (existingMarker) {
              return;
            }
            
            // Find villa data for coordinates
            const villa = villas?.data?.find(v => v.Account_Number === alert.Account_ID);
            if (!villa) {
              return;
            }
            
            // Determine icon based on alert status
            let iconUrl: string;
            let pixelSize: number;
            let height: number;

            if (alert.Status === 'Open') {
              // Open alert - red alarm icon
              iconUrl = '/alarmIcon.svg';
              pixelSize = 30;
              height = 28;
            } else {
              // Closed alert - green alarm icon
              iconUrl = '/greenAlarm.svg';
              pixelSize = 35;
              height = 40;
            }

            const entity = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(villa.Longitude, villa.Latitude),
              billboard: {
                image: iconUrl,
                width: pixelSize,
                height: height,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              },
              label: {
                text: alert.Account_ID,
                font: '12px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -pixelSize - 5),
              },
              name: `Alert - ${alert.Account_ID}`,
            });



            // Store marker data for click handling
            entity.markerData = {
              type: 'alert',
              data: alert
            };
          });
        }

        // Add villa markers based on zoom level - only for villas without alerts
        if (villas && cameraHeight < 50000) { // Show villas when zoomed in enough
          const visibleVillas = villas.data.filter((villa: NormalizedVilla) => {
            return villa.Longitude >= viewportBounds.west && 
                   villa.Longitude <= viewportBounds.east && 
                   villa.Latitude >= viewportBounds.south && 
                   villa.Latitude <= viewportBounds.north;
          });

          // Get account numbers that already have alert markers (both open and closed)
          const alertAccountNumbers = new Set(markers.filter(m => m.isAlert).map(marker => marker.accountNumber));
          
          // Also add filtered alerts from alerts data to ensure complete coverage
          if (filteredAlerts && Array.isArray(filteredAlerts)) {
            filteredAlerts.forEach(alert => {
              alertAccountNumbers.add(alert.Account_ID);
            });
          }
          
          // Filter out villas that already have alert markers - alerts take absolute priority
          const villasWithoutAlerts = visibleVillas.filter(villa => !alertAccountNumbers.has(villa.Account_Number));

          // Limit the number of villa markers to prevent performance issues
          const maxVillaMarkers = cameraHeight < 10000 ? 100 : 50;
          const limitedVillas = villasWithoutAlerts.slice(0, maxVillaMarkers);

          limitedVillas.forEach((villa: NormalizedVilla, index) => {
            
            const entity = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(villa.Longitude, villa.Latitude),
              billboard: {
                image: '/greenIcon.svg',
                width: cameraHeight < 10000 ? 25 : 20,
                height: cameraHeight < 10000 ? 33 : 26,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              },
              label: {
                text: cameraHeight < 10000 ? villa.Customer_Name : '',
                font: '10px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -25),
              },
              name: `Villa - ${villa.Customer_Name}`,
            });

            // Store villa data on entity for click handling
            entity.villa = villa;
            entity.markerData = {
              type: 'villa',
              data: villa
            };
          });
        }

        setMapEntities(viewer.entities.values);
      } catch (error) {
        console.error('Error updating map:', error);
      }
    }, 300),
    [isWorkerReady, processMapData, setViewportBounds, setCameraHeight, villas, emirate]
  );

  // Handle emirate changes
  useEffect(() => {
    if (!isWorkerReady || !getEmirateBounds) return;

    const flyToEmirate = async () => {
      try {
        const bounds = await getEmirateBounds(emirate);
        if (bounds && viewerRef.current?.cesiumElement) {
          const viewer = viewerRef.current.cesiumElement;
          viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(
              bounds.west,
              bounds.south,
              bounds.east,
              bounds.north
            ),
            duration: 2.0,
          });
        }
      } catch (error) {
        console.error('Error flying to emirate:', error);
      }
    };

    flyToEmirate();
  }, [emirate, isWorkerReady, getEmirateBounds]);

  // Handle camera changes
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    const camera = viewer.camera;

    const cameraChangedHandler = () => {
      // Only update if we have data to work with
      if (isWorkerReady) {
        debouncedUpdateMap();
      }
    };

    camera.changed.addEventListener(cameraChangedHandler);

    return () => {
      camera.changed.removeEventListener(cameraChangedHandler);
    };
  }, [debouncedUpdateMap, isWorkerReady, processMapData]);

  // Handle fly-to-location requests
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    const camera = viewer.camera;

    // Check for fly-to-location requests periodically
    const checkForFlyTo = () => {
      const state = useMapStore.getState();
      
      if (state.viewportBounds && state.cameraHeight > 0) {
        const centerLon = (state.viewportBounds.west + state.viewportBounds.east) / 2;
        const centerLat = (state.viewportBounds.south + state.viewportBounds.north) / 2;
        const height = state.cameraHeight;

        // Fly to the location
        camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height),
          duration: 2.0,
          complete: () => {
            // Fly-to-location completed
          }
        });
        
        // Clear the viewport bounds to prevent repeated flying
        useMapStore.getState().setViewportBounds(null);
      }
    };

    const interval = setInterval(checkForFlyTo, 100);
    return () => clearInterval(interval);
  }, []);

  // Initial setup and click handlers
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    
    // Fly to UAE center initially with a more dramatic entrance
    setTimeout(() => {
      // Start from space (high altitude) and fly down to UAE
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(54.3773, 24.4539, 2000000), // UAE coordinates from space
        duration: 0.1, // Quick initial positioning
        complete: () => {
          // Then fly down to a closer view
          setTimeout(() => {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(54.3773, 24.4539, 500000), // Closer view of UAE
              duration: 3.0, // Smooth transition
              complete: () => {
                // UAE fly-to animation completed
              }
            });
          }, 500);
        }
      });
    }, 100);
  }, []);

  // Set up click handler for markers
  useEffect(() => {
    if (!viewerRef.current?.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    
    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    
    clickHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = viewer.scene.pick(event.position);
      
      if (pickedObject && pickedObject.id) {
        const entity = pickedObject.id;
        
        // Handle villa markers
        if (entity.villa) {
          setSelectedVilla(entity.villa);
          setIsVillaDetailsOpen(true);
        }
        
        // Handle alert markers
        if (entity.markerData?.type === 'alert') {
          // Alert clicked - can be handled here if needed
        }
      } else {
        // Clear selection when clicking on empty space
        setIsVillaDetailsOpen(false);
        setSelectedVilla(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      clickHandler.destroy();
    };
  }, [mapEntities]); // Re-run when map entities change

  // Create stable loading state
  const loadingState = useMemo(() => ({
    isWorkerReady,
    villasLoading,
    alertsLoading,
    hasVillas: Boolean(villas),
    hasWorkerError: Boolean(workerError),
    hasVillasError: Boolean(villasError),
    hasAlertsError: Boolean(alertsError)
  }), [
    isWorkerReady,
    villasLoading,
    alertsLoading,
    Boolean(villas), // Use Boolean instead of the entire object
    workerError,
    villasError,
    alertsError
  ]);

  // Handle loading state
  useEffect(() => {
    // Hide loading screen when everything is ready
    const shouldHideLoading = Boolean(
      loadingState.isWorkerReady && 
      !loadingState.villasLoading && 
      !loadingState.alertsLoading && 
      loadingState.hasVillas && 
      !loadingState.hasWorkerError && 
      !loadingState.hasVillasError && 
      !loadingState.hasAlertsError
    );

    if (shouldHideLoading) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [loadingState]);

  if (workerError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Worker Error</div>
          <div className="text-sm">{workerError}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Map Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" data-testid="map-view">
      <Viewer 
        ref={viewerRef}
        full
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        geocoder={false}
        animation={false}
        timeline={false}
        fullscreenButton={false}
        vrButton={false}

        className="w-full h-full"
      />
      <VillaDetails
        villa={selectedVilla}
        isOpen={isVillaDetailsOpen}
        onClose={handleCloseVillaDetails}
        onFlyToLocation={handleVillaFlyTo}
      />
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 