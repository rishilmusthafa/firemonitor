'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAlerts } from '@/hooks/useAlerts';
import { useQueryClient } from '@tanstack/react-query';

export default function RefreshButton() {
  const { refetch, isFetching, dataUpdatedAt } = useAlerts();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastManualRefresh, setLastManualRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;
    
    setIsRefreshing(true);
    setLastManualRefresh(new Date());
    
    try {
      // Invalidate and refetch alerts data
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      await refetch();
      
      // Also trigger a refetch of villas data if needed
      await queryClient.invalidateQueries({ queryKey: ['villas'] });
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Manual Refresh Time */}
      {lastManualRefresh && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xs text-textSecondary bg-background/80 backdrop-blur-sm px-2 py-1 rounded"
        >
          Manual: {formatTime(lastManualRefresh)}
        </motion.div>
      )}
      
      {/* Auto Refresh Time */}
      {dataUpdatedAt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-textSecondary bg-background/80 backdrop-blur-sm px-2 py-1 rounded"
        >
          Auto: {formatTime(new Date(dataUpdatedAt))}
        </motion.div>
      )}
      
      {/* Refresh Button */}
      <motion.button
        onClick={handleRefresh}
        disabled={isRefreshing || isFetching}
        className={`
          w-10 h-10 rounded-full
          bg-background/80 backdrop-blur-sm border border-secondary/20
          hover:bg-background/90 hover:border-secondary/40
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center
          ${isRefreshing || isFetching ? 'animate-pulse' : ''}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Refresh alerts data"
        data-testid="refresh-button"
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-textPrimary"
          animate={isRefreshing || isFetching ? { rotate: 360 } : {}}
          transition={{ 
            duration: 1, 
            repeat: isRefreshing || isFetching ? Infinity : 0,
            ease: "linear"
          }}
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </motion.svg>
      </motion.button>
    </div>
  );
} 