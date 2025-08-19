'use client';

import { useEffect, useState } from 'react';
import { useVillas } from '@/hooks/useVillas';
import { useAlertsWorker } from '@/hooks/useAlertsWorker';
import { useUIStore } from '@/store/useUIStore';
import { filterVillasByEmirate } from '@/utils/dataUtils';
import CounterCard from './CounterCard';
import CityFilter from './CityFilter';
import LoadingSpinner from './LoadingSpinner';

export default function Header() {
  const { emirate } = useUIStore();
  const { data: villasData, isLoading: villasLoading, error: villasError } = useVillas();
  const { isWorkerReady, processToday, getAlertsByEmirate, workerError } = useAlertsWorker();
  
  const [alertStats, setAlertStats] = useState({
    openToday: 0,
    totalToday: 0,
    openAlerts: 0,
    closedAlerts: 0,
    overdueAlerts: 0,
    countdownAlerts: 0,
  });

  // Calculate filtered villa count
  const filteredVillaCount = villasData?.data 
    ? filterVillasByEmirate(villasData.data, emirate).length 
    : 0;

  // Update alert statistics with emirate filtering
  useEffect(() => {
    const updateStats = async () => {
      if (!isWorkerReady) return;

      try {
        // Get emirate-filtered alerts
        const emirateAlerts = await getAlertsByEmirate(emirate);
        
        // Process today's alerts for the selected emirate
        const now = new Date();
        
        // Use UTC dates for consistent timezone handling
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const todayAlerts = emirateAlerts.filter(alert => {
          // Use UTC timestamps exactly as they come from API
          const alertDate = new Date(alert.Alert_DateTime);
          return alertDate >= todayStart && alertDate < todayEnd;
        });

        // Calculate emirate-specific stats
        const openToday = todayAlerts.filter(alert => alert.Status !== 'Closed').length;
        const totalToday = todayAlerts.length;

        // Calculate overall stats for the emirate
        const twoMinutes = 2 * 60; // 2 minutes in seconds
        let openAlerts = 0;
        let closedAlerts = 0;
        let overdueAlerts = 0;
        let countdownAlerts = 0;

        emirateAlerts.forEach(alert => {
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

        setAlertStats({
          openToday,
          totalToday,
          openAlerts,
          closedAlerts,
          overdueAlerts,
          countdownAlerts,
        });
      } catch (error) {
        console.error('Error updating emirate-filtered alert stats:', error);
      }
    };

    updateStats();

    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, [isWorkerReady, getAlertsByEmirate, emirate]);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-4 bg-background/80 backdrop-blur-sm border-b border-secondary/20">
      <div className="flex items-center justify-between">
        {/* Left side - Brand and Filter */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Hassantuk" className="w-10 h-10" />
            <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">Hassantuk</h1>
            <span className="text-textSecondary">Fire Alarms</span>
            </div>
          </div>
          <CityFilter />
        </div>

        {/* Right side - Counter Cards */}
        <div className="flex items-center space-x-4 mr-16">
          <CounterCard
            title="Total Villas"
            value={villasLoading ? <LoadingSpinner size="sm" /> : villasError ? 'Error' : filteredVillaCount.toLocaleString()}
            icon={<img src="/building.png" alt="Building" className="w-10 h-10" />}
            variant="primary"
          />
          
          <CounterCard
            title={`Alerts (${emirate})`}
            value={isWorkerReady ? `${alertStats.openToday} / ${alertStats.totalToday}` : workerError ? 'Error' : <LoadingSpinner size="sm" />}
            icon={<img src="/fireIcon.png" alt="Fire Alert" className="w-10 h-10" />}
            variant="primary"
            data-testid="alerts-stats"
          />
          <div data-testid="open-today-count" className="hidden">{alertStats.openToday}</div>
          <div data-testid="total-today-count" className="hidden">{alertStats.totalToday}</div>
          
          <CounterCard
            title="Maintenance"
            value="340"
            icon={<img src="/maintainaceIcon.png" alt="Maintenance" className="w-10 h-10" />}
            variant="primary"
          />
        </div>
      </div>
    </header>
  );
} 