'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAlertsWorker } from '@/hooks/useAlertsWorker';
import { useVillas } from '@/hooks/useVillas';
import { useFlyToLocation } from '@/hooks/useFlyToLocation';
import { useUIStore } from '@/store/useUIStore';
import { getEmirateFromCity } from '@/utils/dataUtils';
import CountdownTimer from './CountdownTimer';
import AlertDetails from './AlertDetails';
import FireEffect from './FireEffect';
import NewAlertOverlay from './NewAlertOverlay';
import { motion } from 'framer-motion';
import { ProcessedAlert } from '@/types/alerts';
import { NormalizedVilla } from '@/types/villas';
import { useAlerts } from '@/hooks/useAlerts'; // Add direct React Query data

export default function AlertList() {
  const { isWorkerReady, processToday } = useAlertsWorker();
  const { data: villasData } = useVillas();
  const { flyToLocation } = useFlyToLocation();
  const { emirate, addToAlertQueue } = useUIStore();
  const { data: alertsData, dataUpdatedAt } = useAlerts(); // Add direct React Query data
  const [todayAlerts, setTodayAlerts] = useState<ProcessedAlert[]>([]);
  const [previousAlerts, setPreviousAlerts] = useState<ProcessedAlert[]>([]);
  const [newAlertTimestamps, setNewAlertTimestamps] = useState<Map<string, number>>(new Map());
  const [countdownAnimationIds, setCountdownAnimationIds] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<ProcessedAlert | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousAlertsRef = useRef<ProcessedAlert[]>([]);
  const updateCounterRef = useRef(0);
  const lastDataUpdateRef = useRef<number>(0);

  // Function to update alerts from worker
  const updateAlertsFromWorker = useCallback(async () => {
    if (!isWorkerReady) return;

    updateCounterRef.current += 1;
    console.log(`🔄 AlertList update #${updateCounterRef.current} - Worker ready: ${isWorkerReady}`);

    // Safeguard against too frequent updates
    if (updateCounterRef.current > 100) {
      console.warn('⚠️ Too many updates detected, stopping to prevent infinite loop');
      return;
    }

    try {
      const result = await processToday();
      
      // Detect new alerts by comparing with previous alerts
      const currentAlertIds = new Set(result.items.map(alert => alert.id));
      const previousAlertIds = new Set(previousAlertsRef.current.map(alert => alert.id));
      
      // Find new alerts (alerts that exist in current but not in previous)
      const newIds = new Set<string>();
      const newAlerts: ProcessedAlert[] = [];
      
      // Only detect new alerts if this is not the initial load
      if (!isInitialLoad) {
        currentAlertIds.forEach(id => {
          if (!previousAlertIds.has(id)) {
            newIds.add(id);
            // Find the actual alert object
            const newAlert = result.items.find(alert => alert.id === id);
            if (newAlert) {
              newAlerts.push(newAlert);
            }
          }
        });
      }
      
      // Add all new alerts to the queue for overlay display
      if (newAlerts.length > 0) {
        console.log(`🚨 New alerts detected: ${newAlerts.length}`, newAlerts.map(a => a.id));
        addToAlertQueue(newAlerts);
      }
      
      // Update new alert timestamps - add new alerts with current timestamp
      setNewAlertTimestamps(prev => {
        const updated = new Map(prev);
        const now = Date.now();
        newIds.forEach(id => {
          updated.set(id, now);
        });
        return updated;
      });
      
      // Update countdown animation IDs
      const countdownIds = new Set<string>();
      result.items.forEach(alert => {
        if (alert.status === 'countdown' && alert.secondsRemaining !== undefined) {
          countdownIds.add(alert.id);
        }
      });
      setCountdownAnimationIds(countdownIds);
      
      // Update previous alerts for next comparison
      previousAlertsRef.current = result.items;
      setPreviousAlerts(result.items);
      setTodayAlerts(result.items);
      
      // Mark initial load as complete after first successful load
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error updating today\'s alerts:', error);
    }
  }, [isWorkerReady, processToday, isInitialLoad, addToAlertQueue]);

  // Monitor React Query data updates
  useEffect(() => {
    if (dataUpdatedAt && dataUpdatedAt !== lastDataUpdateRef.current) {
      lastDataUpdateRef.current = dataUpdatedAt;
      console.log(`📡 React Query data updated at: ${new Date(dataUpdatedAt).toLocaleTimeString()}`);
      
      // Trigger alert list update when new data arrives
      if (isWorkerReady) {
        updateAlertsFromWorker();
      }
    }
  }, [dataUpdatedAt, isWorkerReady, updateAlertsFromWorker]);

  // Initial update when worker becomes ready
  useEffect(() => {
    if (isWorkerReady) {
      updateAlertsFromWorker();
    }
  }, [isWorkerReady, updateAlertsFromWorker]);

  // Periodic update as backup (every 10 seconds)
  useEffect(() => {
    if (!isWorkerReady) return;

    const interval = setInterval(() => {
      console.log('⏰ Periodic update triggered');
      updateAlertsFromWorker();
    }, 10000);

    return () => clearInterval(interval);
  }, [isWorkerReady, updateAlertsFromWorker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      previousAlertsRef.current = [];
    };
  }, []);

  // Clean up expired new alert animations (after 2 minutes)
  useEffect(() => {
    const cleanupExpiredAlerts = () => {
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
      
      setNewAlertTimestamps(prev => {
        const updated = new Map(prev);
        let hasChanges = false;
        
        for (const [alertId, timestamp] of updated.entries()) {
          if (now - timestamp > twoMinutes) {
            updated.delete(alertId);
            hasChanges = true;
          }
        }
        
        return hasChanges ? updated : prev;
      });
    };

    // Clean up every 10 seconds
    const cleanupInterval = setInterval(cleanupExpiredAlerts, 10000);
    return () => clearInterval(cleanupInterval);
  }, []);

  // Clean up expired countdown animations (after 2 minutes)
  useEffect(() => {
    if (countdownAnimationIds.size === 0) return;

    const timer = setTimeout(() => {
      setCountdownAnimationIds(new Set());
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearTimeout(timer);
  }, [countdownAnimationIds.size]); // Only depend on size, not the entire set

  // Helper function to check if an alert should show fire animation
  const shouldShowFireAnimation = (alertId: string) => {
    // Check if it's a new alert (within 2 minutes)
    const newAlertTimestamp = newAlertTimestamps.get(alertId);
    if (newAlertTimestamp) {
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      if (now - newAlertTimestamp <= twoMinutes) {
        return true;
      }
    }
    
    // Check if it's a countdown alert
    return countdownAnimationIds.has(alertId);
  };

  const handleAlertClick = (alert: ProcessedAlert) => {
    if (!villasData?.data) return;

    // Find the villa for this alert
    const villa = villasData.data.find(v => v.Account_Number === alert.accountId);
    
    if (villa) {
      // Try direct fly-to method first for maximum zoom
      if (typeof window !== 'undefined' && (window as unknown as { flyToLocationDirect?: (lon: number, lat: number, height: number) => void }).flyToLocationDirect) {
        (window as unknown as { flyToLocationDirect: (lon: number, lat: number, height: number) => void }).flyToLocationDirect(
          villa.Longitude, 
          villa.Latitude, 
          150 // Very close zoom - 500m height for maximum detail
        );
      } else {
        flyToLocation({
          longitude: villa.Longitude,
          latitude: villa.Latitude,
          height: 150, // Very close zoom - 500m height for maximum detail
          duration: 2.0, // 2 second animation
        });
      }
    }
  };

  const handleAlertDetails = (alert: ProcessedAlert) => {
    setSelectedAlert(alert);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedAlert(null);
  };

  const handleFlyToFromDetails = () => {
    if (selectedAlert) {
      handleAlertClick(selectedAlert);
      // Close the modal after flying to location
      setIsDetailsOpen(false);
      setSelectedAlert(null);
    }
  };

  // Filter and sort alerts by emirate and status
  const filteredAndSortedAlerts = todayAlerts
    .filter(alert => {
      if (emirate === 'All') return true;
      
      // Find the villa for this alert to check its city
      const villa = villasData?.data?.find((v: NormalizedVilla) => v.Account_Number === alert.accountId);
      
      // Use the emirate mapping function for proper city-to-emirate conversion
      return villa?.City ? getEmirateFromCity(villa.City) === emirate : false;
    })
    .sort((a, b) => {
      // Sort by status: open alerts first, then closed
      const statusOrder = { 'overdue': 0, 'countdown': 1, 'closed': 2 };
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // If same status, sort by datetime (newest first)
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });

  // Handle scroll to load more alerts
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10; // 10px threshold
    
    if (isAtEnd && visibleCount < filteredAndSortedAlerts.length) {
      setVisibleCount(prev => Math.min(prev + 10, filteredAndSortedAlerts.length));
    }
  };

  // Reset visible count when emirate changes
  useEffect(() => {
    setVisibleCount(10);
  }, [emirate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-500';
      case 'countdown':
        return 'bg-orange-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return '🛡️';
      case 'countdown':
        return '⏰';
      case 'overdue':
        return '🚨';
      default:
        return '🔥';
    }
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    // Use UTC time exactly as it comes from API - no timezone conversion
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  // Find villa for selected alert
  const selectedVilla = selectedAlert && villasData?.data 
    ? villasData.data.find(v => v.Account_Number === selectedAlert.accountId)
    : null;

  return (
    <>
      {/* New Alert Overlay */}
      <NewAlertOverlay />
      
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4 bg-background/80 backdrop-blur-sm border-t border-secondary/20" data-testid="alert-list">
        <div className="flex items-center space-x-4">
          {/* Left panel */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium text-textPrimary">Alarms</span>
            <img src="/fireIcon.png" alt="Fire Alarms" className="w-8 h-8" />
            <div className="flex items-center space-x-1 bg-secondary/50 px-2 py-1 rounded-full">
              <span className="text-xs">📅</span>
              <span className="text-xs text-textPrimary">
              {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </span>
            </div>
          </div>

          {/* Horizontal scrolling alerts */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto"
            onScroll={handleScroll}
          >
            <div className="flex space-x-4 min-w-max py-4 pl-6">
              {isWorkerReady && filteredAndSortedAlerts.length > 0 ? (
                filteredAndSortedAlerts.slice(0, visibleCount).map((alert, index) => (
                  <motion.div
                    key={`${alert.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FireEffect 
                      isActive={shouldShowFireAnimation(alert.id)}
                      className="w-64 flex-shrink-0"
                    >
                      <Card 
                        className="w-full cursor-pointer hover:shadow-lg transition-all duration-200 overflow-visible rounded-2xl bg-gradient-to-br from-[#616563] to-[#313633] border-0"
                        data-testid="alert-item"
                      >
                      <CardContent 
                        className="p-3"
                        onClick={() => handleAlertClick(alert)}
                        onDoubleClick={() => handleAlertDetails(alert)}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className={cn(
                              "w-1 h-12 rounded-full",
                              getStatusColor(alert.status)
                            )}
                            animate={{
                              scaleY: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {alert.title} - {alert.accountId}
                              {shouldShowFireAnimation(alert.id) && (
                                <span className="ml-1 text-xs text-orange-400">🔥</span>
                              )}
                            </div>
                            {(() => {
                              const villa = villasData?.data?.find((v: NormalizedVilla) => v.Account_Number === alert.accountId);
                              return (
                                <>
                                  <div className="text-xs text-textSecondary truncate">
                                    {villa?.Customer_Name || 'Unknown Customer'}
                            </div>
                            <div className="text-xs text-textSecondary truncate">
                                    {villa?.City || 'Unknown City'}
                            </div>
                                </>
                              );
                            })()}
                            <div className="text-xs text-textSecondary">
                              {formatTime(alert.datetime)}
                            </div>
                            {alert.mobile && (
                              <div className="text-xs text-textSecondary truncate">
                                {alert.mobile}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <motion.div 
                              className="flex items-center justify-center"
                              animate={{
                                scale: alert.status === 'overdue' ? [1, 1.1, 1] : 1,
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: alert.status === 'overdue' ? Infinity : 0,
                              }}
                            >
                              {alert.status === 'closed' ? (
                                <img 
                                  src="/greenAlarm.svg" 
                                  alt="Closed Alarm" 
                                  className="w-6 h-6"
                                />
                              ) : (
                                <img 
                                  src="/alarmIcon.svg" 
                                  alt="Open Alarm" 
                                  className="w-6 h-6"
                                />
                              )}
                            </motion.div>
                            {alert.status === 'countdown' && alert.secondsRemaining && (
                              <div className="text-xs text-orange-500 font-medium">
                                <CountdownTimer 
                                  secondsRemaining={alert.secondsRemaining}
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-textSecondary mt-2 text-center">
                          Click to fly • Double-click for details
                        </div>
                      </CardContent>
                    </Card>
                    </FireEffect>
                  </motion.div>
                ))
              ) : (
                // No alerts message
                <div className="flex items-center justify-center w-full h-32">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔕</div>
                    <div className="text-sm font-medium text-textSecondary mb-1">
                      {emirate === 'All' ? 'No Alerts Today' : `No Alerts in ${emirate}`}
                    </div>
                    <div className="text-xs text-textSecondary/70">
                      All systems are running smoothly
                        </div>
                        </div>
                      </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      <AlertDetails
        alert={selectedAlert}
        villa={selectedVilla}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onFlyToLocation={handleFlyToFromDetails}
      />
    </>
  );
} 