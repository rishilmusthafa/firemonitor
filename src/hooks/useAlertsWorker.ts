'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { wrap } from 'comlink'; // Re-enable comlink import
import { useVillas } from './useVillas';
import { useAlerts } from './useAlerts';
import { useUIStore } from '@/store/useUIStore';
import { filterLatestAlertsPerVilla } from '@/utils/dataUtils';
import type { NormalizedVilla } from '@/types/villas';
import type { Alert, ProcessedAlert } from '@/types/alerts';

interface ProcessTodayResult {
  openToday: number;
  totalToday: number;
  items: ProcessedAlert[];
}

interface AlertStats {
  totalAlerts: number;
  openAlerts: number;
  closedAlerts: number;
  overdueAlerts: number;
  countdownAlerts: number;
}

interface AlertsWorkerAPI {
  init: (params: { alerts: Alert[]; villas: NormalizedVilla[]; nowUtc: string }) => Promise<void>;
  processToday: (params: { nowUtc: string }) => Promise<ProcessTodayResult>;
  getAlertStats: () => Promise<AlertStats>;
  getAlertsByEmirate: (emirate: string) => Promise<Alert[]>;
}

// Fallback synchronous implementation for testing/fallback
class SimpleAlertsProcessor {
  private alerts: Alert[] = [];
  private villas: NormalizedVilla[] = [];
  private nowUtc: string = '';

  init({ alerts, villas, nowUtc }: { alerts: Alert[]; villas: NormalizedVilla[]; nowUtc: string }) {
    this.alerts = alerts;
    this.villas = villas;
    this.nowUtc = nowUtc;
  }

  processToday({ nowUtc }: { nowUtc: string }): Promise<ProcessTodayResult> {
    this.nowUtc = nowUtc;
    const now = new Date(nowUtc);
    
    // Use UTC dates for consistent UTC timezone handling
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Filter alerts for today using UTC
    const todayAlerts = this.alerts.filter(alert => {
      const alertDate = new Date(alert.Alert_DateTime);
      return alertDate >= todayStart && alertDate < todayEnd;
    });

    // Process each alert using UTC
    const processedAlerts: ProcessedAlert[] = todayAlerts.map(alert => {
      // Use UTC timestamps exactly as they come from API
      const alertDate = new Date(alert.Alert_DateTime);
      const secondsSinceAlert = Math.floor((now.getTime() - alertDate.getTime()) / 1000);
      

      
      // Debug logging for countdown issues
      if (secondsSinceAlert < 0) {
        console.warn('Alert date is in the future (fallback):', {
          alertId: alert.id,
          alertDateTime: alert.Alert_DateTime,
          now: now.toISOString(),
          secondsSinceAlert
        });
      }
      
      let status: 'closed' | 'countdown' | 'overdue';
      let secondsRemaining: number | undefined;

      if (alert.Status === 'Closed') {
        status = 'closed';
      } else {
        // Open alerts: check if within 2-minute window
        const twoMinutes = 2 * 60; // 2 minutes in seconds
        
        // Handle negative seconds (future dates) - these should be treated as overdue
        if (secondsSinceAlert < 0) {
          status = 'overdue'; // Future alerts are considered overdue
          secondsRemaining = undefined;
        } else if (secondsSinceAlert <= twoMinutes) {
          status = 'countdown';
          secondsRemaining = twoMinutes - secondsSinceAlert;
        } else {
          status = 'overdue';
        }
        
        // Validate secondsRemaining is reasonable
        if (secondsRemaining !== undefined && (secondsRemaining < 0 || secondsRemaining > twoMinutes)) {
          console.error('❌ Invalid secondsRemaining (Fallback):', {
            alertId: alert.id,
            secondsSinceAlert,
            secondsRemaining,
            twoMinutes
          });
          secondsRemaining = Math.max(0, Math.min(twoMinutes, secondsRemaining));
        }
        

      }

      return {
        id: alert.id,
        accountId: alert.Account_ID,
        title: alert.Title,
        titleAr: alert.Title_Ar,
        datetime: alert.Alert_DateTime,
        status,
        secondsRemaining,
        mobile: alert.Mobile,
        type: alert.Type,
      };
    });

    const openToday = processedAlerts.filter(alert => alert.status !== 'closed').length;
    const totalToday = processedAlerts.length;

    return Promise.resolve({
      openToday,
      totalToday,
      items: processedAlerts
    });
  }

  getAlertStats(): Promise<AlertStats> {
    const now = new Date(this.nowUtc);
    const twoMinutes = 2 * 60; // 2 minutes in seconds

    let openAlerts = 0;
    let closedAlerts = 0;
    let overdueAlerts = 0;
    let countdownAlerts = 0;

    this.alerts.forEach(alert => {
      if (alert.Status === 'Closed') {
        closedAlerts++;
      } else {
        // Use UTC timestamps exactly as they come from API
        const alertDate = new Date(alert.Alert_DateTime);
        const secondsSinceAlert = Math.floor((now.getTime() - alertDate.getTime()) / 1000);
        
        // Handle future alerts as overdue
        if (secondsSinceAlert < 0) {
          overdueAlerts++;
        } else if (secondsSinceAlert <= twoMinutes) {
          countdownAlerts++;
        } else {
          overdueAlerts++;
        }
        openAlerts++;
      }
    });

    return Promise.resolve({
      totalAlerts: this.alerts.length,
      openAlerts,
      closedAlerts,
      overdueAlerts,
      countdownAlerts,
    });
  }

  getAlertsByEmirate(emirate: string): Promise<Alert[]> {
    if (emirate === 'All') {
      // For 'All', deduplicate by account ID and keep latest
      const alertMap = new Map<string, Alert>();
      this.alerts.forEach(alert => {
        const existing = alertMap.get(alert.Account_ID);
        if (!existing || new Date(alert.Alert_DateTime) > new Date(existing.Alert_DateTime)) {
          alertMap.set(alert.Account_ID, alert);
        }
      });
      return Promise.resolve(Array.from(alertMap.values()));
    }

    // Get villa account numbers for the selected emirate
    const emirateVillaIds = new Set(
      this.villas
        .filter(villa => villa.City?.toLowerCase() === emirate.toLowerCase())
        .map(villa => villa.Account_Number)
    );

    // Filter alerts for villas in the selected emirate and deduplicate by account ID
    const emirateAlerts = this.alerts.filter(alert => emirateVillaIds.has(alert.Account_ID));
    const alertMap = new Map<string, Alert>();
    
    emirateAlerts.forEach(alert => {
      const existing = alertMap.get(alert.Account_ID);
      if (!existing || new Date(alert.Alert_DateTime) > new Date(existing.Alert_DateTime)) {
        alertMap.set(alert.Account_ID, alert);
      }
    });

    return Promise.resolve(Array.from(alertMap.values()));
  }
}

export function useAlertsWorker() {
  const workerRef = useRef<Worker | null>(null);
  const workerApiRef = useRef<AlertsWorkerAPI | null>(null);
  const fallbackProcessorRef = useRef<SimpleAlertsProcessor | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(true); // Start with fallback by default

  const { data: villasData } = useVillas();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useAlerts();
  const { emirate } = useUIStore();

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
            workerRef.current = new Worker(new URL('../workers/AlertsWorker.ts', import.meta.url), {
              type: 'module',
            });
            
            // Add comprehensive error handlers for worker
            workerRef.current.onerror = (error) => {
              console.error('AlertsWorker error:', error);
              setWorkerError('AlertsWorker failed to initialize');
              setUseFallback(true);
            };
            
            workerRef.current.onmessageerror = (error) => {
              console.error('AlertsWorker message error:', error);
              setWorkerError('AlertsWorker message error');
              setUseFallback(true);
            };
            
            // Wrap with error handling
            try {
              workerApiRef.current = wrap(workerRef.current) as AlertsWorkerAPI;

              
              // Add a small delay to ensure worker is ready
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Test if worker is working by trying to call a simple method
              try {
                if (typeof workerApiRef.current.init === 'function') {
                  // Worker API test successful
                } else {
                  throw new Error('Worker API methods not available');
                }
              } catch (testError) {
                console.error('Worker API test failed:', testError);
                throw new Error('Worker API test failed');
              }
            } catch (wrapError) {
              console.error('Error wrapping AlertsWorker:', wrapError);
              setWorkerError('Failed to wrap AlertsWorker');
              setUseFallback(true);
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
          } catch (workerError) {
            console.error('Error creating AlertsWorker:', workerError);
            setWorkerError('Failed to create AlertsWorker');
            setUseFallback(true);
          }
        } else if (!fallbackProcessorRef.current && useFallback) {
          fallbackProcessorRef.current = new SimpleAlertsProcessor();
        }
      } catch (error) {
        console.error('Error creating AlertsWorker:', error);
        setWorkerError('Failed to create AlertsWorker');
        setUseFallback(true);
        fallbackProcessorRef.current = new SimpleAlertsProcessor();
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
      if (!villasData?.data || !alertsData) return;

      const nowUtc = new Date().toISOString();
      console.log(`🔄 Worker initialization - Alerts count: ${Array.isArray(alertsData) ? alertsData.length : 'invalid'}`);
      
      try {
        // Ensure alertsData is an array
        const alertsArray = Array.isArray(alertsData) ? alertsData : [];
        
        // Apply filtering to remove duplicate alerts for the same villa
        const filteredAlerts = filterLatestAlertsPerVilla(alertsArray);
        console.log(`🔄 Worker initialization - Filtered alerts count: ${filteredAlerts.length}`);
        
        if (workerApiRef.current && !useFallback) {
          try {
            // Check if worker API is properly initialized
            if (typeof workerApiRef.current.init !== 'function') {
              throw new Error('Worker API init method is not available');
            }
            
            // Add timeout to prevent hanging
            const initPromise = workerApiRef.current.init({
              alerts: filteredAlerts,
              villas: villasData.data,
              nowUtc,
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Worker init timeout')), 5000)
            );
            
            await Promise.race([initPromise, timeoutPromise]);
            console.log('✅ Worker API initialized successfully');
          } catch (error) {
            console.error('Worker API init failed, falling back to processor:', error);
            setUseFallback(true);
            if (fallbackProcessorRef.current) {
              fallbackProcessorRef.current.init({
                alerts: filteredAlerts,
                villas: villasData.data,
                nowUtc,
              });
              console.log('✅ Fallback processor initialized successfully');
            }
          }
        } else if (fallbackProcessorRef.current && useFallback) {
          fallbackProcessorRef.current.init({
            alerts: filteredAlerts,
            villas: villasData.data,
            nowUtc,
          });
          console.log('✅ Fallback processor initialized successfully');
        }
        
        setIsWorkerReady(true);
        setWorkerError(null);
      } catch (error) {
        console.error('Failed to initialize AlertsWorker/Processor:', error);
        setWorkerError('Failed to initialize with data');
        setUseFallback(true);
      }
    };

    initializeData();
  }, [villasData?.data, alertsData, useFallback]); // Removed isWorkerReady dependency to allow re-initialization

  // Process today's alerts
  const processToday = useCallback(async () => {
    if (!isWorkerReady) {
      console.log('❌ processToday called but worker not ready');
      return { openToday: 0, totalToday: 0, items: [] };
    }

    console.log('🔄 processToday called - processing alerts...');
    setIsProcessing(true);
    try {
      const nowUtc = new Date().toISOString();
      
      if (workerApiRef.current && !useFallback) {
        try {
          const result = await workerApiRef.current.processToday({ nowUtc });
          console.log(`✅ Worker API processed ${result.items.length} alerts`);
          return result;
        } catch (error) {
          console.error('Worker API processToday failed, falling back to processor:', error);
          setUseFallback(true);
          if (fallbackProcessorRef.current) {
            const result = await fallbackProcessorRef.current.processToday({ nowUtc });
            console.log(`✅ Fallback processor processed ${result.items.length} alerts`);
            return result;
          }
        }
      } else if (fallbackProcessorRef.current && useFallback) {
        const result = await fallbackProcessorRef.current.processToday({ nowUtc });
        console.log(`✅ Fallback processor processed ${result.items.length} alerts`);
        return result;
      }
      
      // Fallback return if no worker or processor is available
      console.log('❌ No worker or processor available for processToday');
      return { openToday: 0, totalToday: 0, items: [] };
    } catch (error) {
      console.error('Error processing today\'s alerts:', error);
      return { openToday: 0, totalToday: 0, items: [] };
    } finally {
      setIsProcessing(false);
    }
  }, [isWorkerReady, useFallback]);

  // Get alerts by emirate
  const getAlertsByEmirate = useCallback(async (emirateFilter: string) => {
    if (!isWorkerReady) {
      return [];
    }

    try {
      if (workerApiRef.current && !useFallback) {
        try {
          return await workerApiRef.current.getAlertsByEmirate(emirateFilter);
        } catch (error) {
          console.error('Worker API getAlertsByEmirate failed, falling back to processor:', error);
          setUseFallback(true);
          if (fallbackProcessorRef.current) {
            return await fallbackProcessorRef.current.getAlertsByEmirate(emirateFilter);
          }
        }
      } else if (fallbackProcessorRef.current && useFallback) {
        return await fallbackProcessorRef.current.getAlertsByEmirate(emirateFilter);
      }
      
      // Fallback return if no worker or processor is available
      return [];
    } catch (error) {
      console.error('Error getting alerts by emirate:', error);
      return [];
    }
  }, [isWorkerReady, useFallback]);

  return {
    isWorkerReady,
    isProcessing,
    workerError,
    useFallback,
    processToday,
    getAlertsByEmirate,
  };
} 