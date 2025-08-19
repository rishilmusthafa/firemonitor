'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAlerts } from '@/hooks/useAlerts';
import { useVillas } from '@/hooks/useVillas';
import { useAlertsWorker } from '@/hooks/useAlertsWorker';
import { motion } from 'framer-motion';

export default function SystemStatus() {
  const { data: alerts, isLoading: alertsLoading, error: alertsError, dataUpdatedAt } = useAlerts();
  const { data: villas, isLoading: villasLoading, error: villasError } = useVillas();
  const { isWorkerReady, isProcessing, workerError } = useAlertsWorker();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Monitor data updates
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdate(new Date(dataUpdatedAt));
      setUpdateCount(prev => prev + 1);
      console.log(`📊 SystemStatus: Data updated at ${new Date(dataUpdatedAt).toLocaleTimeString()}`);
    }
  }, [dataUpdatedAt]);

  // Monitor alerts count changes
  useEffect(() => {
    if (alerts) {
      console.log(`📊 SystemStatus: Alerts count changed to ${alerts.length}`);
    }
  }, [alerts?.length]);

  const getStatusColor = (isReady: boolean, isLoading: boolean, error: unknown) => {
    if (error) return 'text-red-500';
    if (isLoading) return 'text-yellow-500';
    if (isReady) return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusText = (isReady: boolean, isLoading: boolean, error: unknown) => {
    if (error) return 'Error';
    if (isLoading) return 'Loading';
    if (isReady) return 'Ready';
    return 'Initializing';
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <Card className="w-80 bg-background/80 backdrop-blur-sm border-secondary/20">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-textPrimary">System Status</h3>
        
        <div className="space-y-2 text-xs">
          {/* API Status */}
          <div className="flex justify-between items-center">
            <span className="text-textSecondary">Alerts API:</span>
            <div className="flex items-center space-x-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${getStatusColor(!alertsLoading && !alertsError, alertsLoading, alertsError)}`}
                animate={alertsLoading ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: alertsLoading ? Infinity : 0 }}
              />
              <span className={getStatusColor(!alertsLoading && !alertsError, alertsLoading, alertsError)}>
                {getStatusText(!alertsLoading && !alertsError, alertsLoading, alertsError)}
              </span>
            </div>
          </div>

          {/* Villas API */}
          <div className="flex justify-between items-center">
            <span className="text-textSecondary">Villas API:</span>
            <div className="flex items-center space-x-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${getStatusColor(!villasLoading && !villasError, villasLoading, villasError)}`}
                animate={villasLoading ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: villasLoading ? Infinity : 0 }}
              />
              <span className={getStatusColor(!villasLoading && !villasError, villasLoading, villasError)}>
                {getStatusText(!villasLoading && !villasError, villasLoading, villasError)}
              </span>
            </div>
          </div>

          {/* Worker Status */}
          <div className="flex justify-between items-center">
            <span className="text-textSecondary">Data Processor:</span>
            <div className="flex items-center space-x-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${getStatusColor(isWorkerReady, isProcessing, workerError)}`}
                animate={isProcessing ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
              />
              <span className={getStatusColor(isWorkerReady, isProcessing, workerError)}>
                {getStatusText(isWorkerReady, isProcessing, workerError)}
              </span>
            </div>
          </div>

          {/* Real-time Updates */}
          <div className="pt-2 border-t border-secondary/20">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Last Update:</span>
              <span className="text-textPrimary font-mono text-xs">
                {formatTime(lastUpdate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Update Count:</span>
              <span className="text-textPrimary font-mono text-xs">
                {updateCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Alerts Count:</span>
              <span className="text-textPrimary font-mono text-xs">
                {alerts?.length || 0}
              </span>
            </div>
          </div>

          {/* Real-time Indicator */}
          <div className="flex items-center justify-center pt-2">
            <motion.div
              className="flex items-center space-x-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-green-500 font-medium">Real-time Active</span>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 