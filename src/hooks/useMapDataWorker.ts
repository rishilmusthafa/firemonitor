'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { wrap } from 'comlink'; // Re-enable comlink import
import { useVillas } from './useVillas';
import { useAlerts } from './useAlerts';
import { useUIStore } from '@/store/useUIStore';
import { useMapStore } from '@/store/useMapStore';
import type { NormalizedVilla } from '@/types/villas';
import type { Alert } from '@/types/alerts';

interface ViewportBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

interface Cluster {
  lon: number;
  lat: number;
  count: number;
}

interface Marker {
  id: string;
  lon: number;
  lat: number;
  isAlert: boolean;
  status?: 'open' | 'closed';
  accountNumber: string;
  customerName: string;
  alertData?: Alert;
}

interface MapDataWorkerAPI {
  init: (params: { villas: NormalizedVilla[]; alerts: Alert[] }) => Promise<void>;
  filterAndCluster: (params: {
    viewportBounds: ViewportBounds;
    cameraHeight: number;
    emirate: string;
    showNonAlertAboveZoom: boolean;
  }) => Promise<{
    clusters: Cluster[];
    markers: Marker[];
  }>;
  getEmirateBounds: (emirate: string) => Promise<ViewportBounds | null>;
}

// Fallback synchronous implementation for testing/fallback
class SimpleMapDataProcessor {
  private villas: NormalizedVilla[] = [];
  private alerts: Alert[] = [];
  private alertVillaIds: Set<string> = new Set();

  init({ villas, alerts }: { villas: NormalizedVilla[]; alerts: Alert[] }) {
    this.villas = villas;
      this.alerts = alerts;
    
    // Create set of villa account numbers that have alerts
    this.alertVillaIds = new Set(
      alerts.map(alert => alert.Account_ID)
    );
  }

  filterAndCluster(params: {
    viewportBounds: ViewportBounds;
    cameraHeight: number;
    emirate: string;
    showNonAlertAboveZoom: boolean;
  }): Promise<{ clusters: Cluster[]; markers: Marker[] }> {
    // Validate parameters
    if (!params) {
      console.error('SimpleMapDataProcessor.filterAndCluster: params is undefined');
      return Promise.resolve({ clusters: [], markers: [] });
    }

    const { viewportBounds, cameraHeight, emirate, showNonAlertAboveZoom } = params;

    // Validate required parameters
    if (!viewportBounds || typeof cameraHeight !== 'number' || !emirate || typeof showNonAlertAboveZoom !== 'boolean') {
      console.error('SimpleMapDataProcessor.filterAndCluster: Invalid parameters', { viewportBounds, cameraHeight, emirate, showNonAlertAboveZoom });
      return Promise.resolve({ clusters: [], markers: [] });
    }
    // Filter villas by emirate
    let filteredVillas = this.villas;
    if (emirate !== 'All') {
      filteredVillas = this.villas.filter(villa => 
        villa.City?.toLowerCase() === emirate.toLowerCase()
      );
    }

    // Filter by viewport
    const viewportVillas = filteredVillas.filter(villa => 
      villa.Longitude >= viewportBounds.west && 
      villa.Longitude <= viewportBounds.east && 
      villa.Latitude >= viewportBounds.south && 
      villa.Latitude <= viewportBounds.north
    );

    // Determine which villas to show based on camera height
    const shouldShowNonAlertVillas = cameraHeight < 100000; // 100km threshold
    const showAllVillas = showNonAlertAboveZoom || shouldShowNonAlertVillas;

    // Create markers
    const markers: Marker[] = [];
    
    for (const villa of viewportVillas) {
      const hasAlert = this.alertVillaIds.has(villa.Account_Number);
      const alert = this.alerts.find(a => a.Account_ID === villa.Account_Number);
      
      // Show alert villas always, show non-alert villas based on threshold
      if (hasAlert || showAllVillas) {
        markers.push({
          id: villa.Account_Number,
          lon: villa.Longitude,
          lat: villa.Latitude,
          isAlert: hasAlert,
          status: alert?.Status === 'Open' ? 'open' : 'closed',
          accountNumber: villa.Account_Number,
          customerName: villa.Customer_Name,
          alertData: alert,
        });
      }
    }

    // Simple clustering based on camera height
    const clusterDistance = cameraHeight > 50000 ? 0.02 : 0.01;
    const clusters: Cluster[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < markers.length; i++) {
      if (processed.has(markers[i].id)) continue;

      const cluster = [markers[i]];
      processed.add(markers[i].id);

      for (let j = i + 1; j < markers.length; j++) {
        if (processed.has(markers[j].id)) continue;

        const distance = Math.sqrt(
          Math.pow(markers[i].lon - markers[j].lon, 2) + 
          Math.pow(markers[i].lat - markers[j].lat, 2)
        );

        if (distance <= clusterDistance) {
          cluster.push(markers[j]);
          processed.add(markers[j].id);
        }
      }

      if (cluster.length > 1) {
        const avgLon = cluster.reduce((sum, m) => sum + m.lon, 0) / cluster.length;
        const avgLat = cluster.reduce((sum, m) => sum + m.lat, 0) / cluster.length;
        clusters.push({ lon: avgLon, lat: avgLat, count: cluster.length });
      }
    }

    const finalMarkers = markers.filter(marker => {
    // Remove markers that are part of clusters
      return !clusters.some(cluster => {
        const distance = Math.sqrt(
          Math.pow(marker.lon - cluster.lon, 2) + 
          Math.pow(marker.lat - cluster.lat, 2)
        );
        return distance <= clusterDistance;
      });
    });

    return Promise.resolve({
      clusters,
      markers: finalMarkers,
    });
  }

  getEmirateBounds(emirate: string): Promise<ViewportBounds | null> {
    const EMIRATE_BOUNDS = {
      "Dubai": { west: 55.0, east: 55.6, south: 24.9, north: 25.5 },
      "Abu Dhabi": { west: 52.5, east: 55.5, south: 22.5, north: 25.3 },
      "Sharjah": { west: 55.3, east: 55.9, south: 25.1, north: 25.5 },
      "Ajman": { west: 55.4, east: 55.6, south: 25.3, north: 25.5 },
      "Umm Al Quwain": { west: 55.5, east: 55.8, south: 25.5, north: 25.7 },
      "Ras Al Khaimah": { west: 55.6, east: 56.2, south: 25.5, north: 26.2 },
      "Fujairah": { west: 56.0, east: 56.5, south: 25.0, north: 25.7 },
      "All": { west: 52.5, east: 56.6, south: 22.5, north: 26.5 }
    };
    
    return Promise.resolve(EMIRATE_BOUNDS[emirate as keyof typeof EMIRATE_BOUNDS] || null);
  }
}

export function useMapDataWorker() {
  const workerRef = useRef<Worker | null>(null);
  const workerApiRef = useRef<MapDataWorkerAPI | null>(null);
  const fallbackProcessorRef = useRef<SimpleMapDataProcessor | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(true); // Start with fallback by default

  const { data: villasData } = useVillas();
  const { data: alertsData } = useAlerts();
  const { emirate } = useUIStore();
  const { viewportBounds, cameraHeight, setViewportBounds, setCameraHeight } = useMapStore();

  // Initialize worker or fallback processor
  useEffect(() => {
    // Listen for force fallback events
    const handleForceFallback = () => {
      setUseFallback(true);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        workerApiRef.current = null;
      }
    };

    window.addEventListener('forceWorkerFallback', handleForceFallback);

    const initializeWorker = async () => {
      try {
        if (!workerRef.current && !useFallback) {
          
          try {
            workerRef.current = new Worker(new URL('../workers/MapDataWorker.ts', import.meta.url), {
              type: 'module',
            });
            
            // Add comprehensive error handlers for worker
            workerRef.current.onerror = (error) => {
              console.error('MapDataWorker error:', error);
              setWorkerError('MapDataWorker failed to initialize');
              setUseFallback(true);
            };
            
            workerRef.current.onmessageerror = (error) => {
              console.error('MapDataWorker message error:', error);
              setWorkerError('MapDataWorker message error');
              setUseFallback(true);
            };
            
            // Wrap with error handling
            try {
              workerApiRef.current = wrap(workerRef.current) as MapDataWorkerAPI;
  
              
              // Add a small delay to ensure worker is ready
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Test if worker is working by trying to call a simple method
              try {
                if (typeof workerApiRef.current.init === 'function') {
                  // MapDataWorker API test successful
                } else {
                  throw new Error('MapDataWorker API methods not available');
                }
              } catch (testError) {
                console.error('MapDataWorker API test failed:', testError);
                throw new Error('MapDataWorker API test failed');
              }
            } catch (wrapError) {
              console.error('Error wrapping MapDataWorker:', wrapError);
              setWorkerError('Failed to wrap MapDataWorker');
              setUseFallback(true);
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
          } catch (workerError) {
            console.error('Error creating MapDataWorker:', workerError);
            setWorkerError('Failed to create MapDataWorker');
            setUseFallback(true);
          }
                } else if (!fallbackProcessorRef.current && useFallback) {
          fallbackProcessorRef.current = new SimpleMapDataProcessor();
        }
    } catch (error) {
        console.error('Error creating MapDataWorker:', error);
        setWorkerError('Failed to create MapDataWorker');
        setUseFallback(true);
        fallbackProcessorRef.current = new SimpleMapDataProcessor();
      }
    };

    initializeWorker();

    return () => {
      window.removeEventListener('forceWorkerFallback', handleForceFallback);
      
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        workerApiRef.current = null;
        setIsWorkerReady(false);
        setWorkerError(null);
      }
      if (fallbackProcessorRef.current) {
        fallbackProcessorRef.current = null;
        setIsWorkerReady(false);
        setWorkerError(null);
      }
    };
  }, [useFallback]);

  // Initialize worker/processor with data
  useEffect(() => {
    const initializeData = async () => {
      if (!villasData?.data || !alertsData || isWorkerReady) return;

      try {
        // Ensure alertsData is an array
        const alertsArray = Array.isArray(alertsData) ? alertsData : [];
        
        if (workerApiRef.current && !useFallback) {
          try {
            // Check if worker API is properly initialized
            if (typeof workerApiRef.current.init !== 'function') {
              throw new Error('MapDataWorker API init method is not available');
            }
            
            await workerApiRef.current.init({
              villas: villasData.data,
              alerts: alertsArray,
            });
          } catch (error) {
            console.error('MapDataWorker API init failed, falling back to processor:', error);
            setUseFallback(true);
            if (fallbackProcessorRef.current) {
              fallbackProcessorRef.current.init({
                villas: villasData.data,
                alerts: alertsArray,
              });
            }
          }
        } else if (fallbackProcessorRef.current && useFallback) {
          fallbackProcessorRef.current.init({
          villas: villasData.data,
          alerts: alertsArray,
        });
        }
        
        setIsWorkerReady(true);
        setWorkerError(null);
      } catch (error) {
        console.error('Failed to initialize MapDataWorker/Processor:', error);
        setWorkerError('Failed to initialize with data');
        setUseFallback(true);
      }
    };

    initializeData();
  }, [villasData?.data, alertsData, isWorkerReady, useFallback]);

  // Process map data
  const processMapData = useCallback(async (params: {
    viewportBounds: ViewportBounds;
    cameraHeight: number;
    emirate: string;
    showNonAlertAboveZoom: boolean;
  }) => {
    // Validate input parameters
    if (!params) {
      console.error('processMapData: params is undefined');
      return { clusters: [], markers: [] };
    }

    const { viewportBounds, cameraHeight, emirate, showNonAlertAboveZoom } = params;

    if (!viewportBounds || typeof cameraHeight !== 'number' || !emirate || typeof showNonAlertAboveZoom !== 'boolean') {
      console.error('processMapData: Invalid parameters', { viewportBounds, cameraHeight, emirate, showNonAlertAboveZoom });
      return { clusters: [], markers: [] };
    }

    if (!isWorkerReady) {
      return { clusters: [], markers: [] };
    }

    setIsProcessing(true);
    try {
      if (workerApiRef.current && !useFallback) {
        try {
          return await workerApiRef.current.filterAndCluster(params);
        } catch (error) {
          console.error('MapDataWorker API filterAndCluster failed, falling back to processor:', error);
          setUseFallback(true);
          if (fallbackProcessorRef.current) {
            return await fallbackProcessorRef.current.filterAndCluster(params);
          }
        }
      } else if (fallbackProcessorRef.current && useFallback) {
        return await fallbackProcessorRef.current.filterAndCluster(params);
      }
      
      // Fallback return if no worker or processor is available
      return { clusters: [], markers: [] };
    } catch (error) {
      console.error('Error processing map data:', error);
      return { clusters: [], markers: [] };
    } finally {
      setIsProcessing(false);
    }
  }, [isWorkerReady, useFallback]);

  // Get emirate bounds
  const getEmirateBounds = useCallback(async (emirateFilter: string) => {
    if (!isWorkerReady) {
      return null;
    }

    try {
      if (workerApiRef.current && !useFallback) {
        try {
          return await workerApiRef.current.getEmirateBounds(emirateFilter);
        } catch (error) {
          console.error('MapDataWorker API getEmirateBounds failed, falling back to processor:', error);
          setUseFallback(true);
          if (fallbackProcessorRef.current) {
            return await fallbackProcessorRef.current.getEmirateBounds(emirateFilter);
          }
        }
      } else if (fallbackProcessorRef.current && useFallback) {
        return await fallbackProcessorRef.current.getEmirateBounds(emirateFilter);
      }
      
      // Fallback return if no worker or processor is available
      return null;
    } catch (error) {
      console.error('Error getting emirate bounds:', error);
      return null;
    }
  }, [isWorkerReady, useFallback]);

  return {
    isWorkerReady,
    isProcessing,
    workerError,
    useFallback,
    processMapData,
    getEmirateBounds,
  };
} 