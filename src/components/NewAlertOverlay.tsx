'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/store/useUIStore';
import { useVillas } from '@/hooks/useVillas';
import { NormalizedVilla } from '@/types/villas';
import FireEffect from './FireEffect';
import CountdownTimer from './CountdownTimer';
import { cn } from '@/lib/utils';

export default function NewAlertOverlay() {
  const { 
    newAlertNotification, 
    showNewAlertOverlay, 
    setShowNewAlertOverlay, 
    setNewAlertNotification,
    alertQueue,
    removeFromAlertQueue
  } = useUIStore();
  const { data: villasData } = useVillas();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide overlay after 5 seconds
  useEffect(() => {
    if (showNewAlertOverlay && newAlertNotification) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for 5 seconds
      timeoutRef.current = setTimeout(() => {
        setShowNewAlertOverlay(false);
        // Clear the notification after animation completes
        setTimeout(() => {
          if (newAlertNotification) {
            removeFromAlertQueue(newAlertNotification.id);
            // Don't set newAlertNotification to null here - let the store handle it
          }
        }, 500); // Wait for exit animation
      }, 5000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [showNewAlertOverlay, newAlertNotification, setShowNewAlertOverlay, removeFromAlertQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  // Find villa for the alert
  const villa = newAlertNotification && villasData?.data 
    ? villasData.data.find((v: NormalizedVilla) => v.Account_Number === newAlertNotification.accountId)
    : null;

  return (
    <AnimatePresence>
      {showNewAlertOverlay && newAlertNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          data-testid="new-alert-overlay"
        >
          {/* Fire background effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-orange-800/10 to-yellow-600/5 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-transparent to-transparent" />
          </div>

          {/* Main notification card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.6 
            }}
            className="relative z-10"
          >
            <FireEffect 
              isActive={true}
              className="w-96"
            >
              <Card className="w-full bg-gradient-to-br from-[#616563] to-[#313633] border-0 shadow-2xl">
                <CardContent className="p-6">
                  {/* Header with notification icon */}
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-4xl"
                    >
                      🚨
                    </motion.div>
                  </div>

                  {/* Notification title */}
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white mb-2">
                      New Alert Received!
                    </h2>
                    <p className="text-sm text-gray-300">
                      Emergency notification detected
                    </p>
                  </div>

                  {/* Alert card */}
                  <div className="bg-black/30 rounded-lg p-4 mb-4 border border-red-500/30">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={cn(
                          "w-2 h-16 rounded-full",
                          getStatusColor(newAlertNotification.status)
                        )}
                        animate={{
                          scaleY: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {newAlertNotification.title} - {newAlertNotification.accountId}
                        </div>
                        {villa && (
                          <>
                            <div className="text-xs text-gray-300 truncate">
                              {villa.Customer_Name || 'Unknown Customer'}
                            </div>
                            <div className="text-xs text-gray-300 truncate">
                              {villa.City || 'Unknown City'}
                            </div>
                          </>
                        )}
                        <div className="text-xs text-gray-300">
                          {formatTime(newAlertNotification.datetime)}
                        </div>
                        {newAlertNotification.mobile && (
                          <div className="text-xs text-gray-300 truncate">
                            {newAlertNotification.mobile}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <motion.div 
                          className="flex items-center justify-center"
                          animate={{
                            scale: newAlertNotification.status === 'overdue' ? [1, 1.3, 1] : 1,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: newAlertNotification.status === 'overdue' ? Infinity : 0,
                          }}
                        >
                          {newAlertNotification.status === 'closed' ? (
                            <img 
                              src="/greenAlarm.svg" 
                              alt="Closed Alarm" 
                              className="w-8 h-8"
                            />
                          ) : (
                            <img 
                              src="/alarmIcon.svg" 
                              alt="Open Alarm" 
                              className="w-8 h-8"
                            />
                          )}
                        </motion.div>
                        {newAlertNotification.status === 'countdown' && newAlertNotification.secondsRemaining && (
                          <div className="text-xs text-orange-400 font-medium">
                            <CountdownTimer 
                              secondsRemaining={newAlertNotification.secondsRemaining}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                      <span className="text-xs text-red-300 font-medium">
                        {newAlertNotification.status === 'overdue' ? 'OVERDUE' : 
                         newAlertNotification.status === 'countdown' ? 'COUNTDOWN' : 
                         newAlertNotification.status === 'closed' ? 'CLOSED' : 'OPEN'}
                      </span>
                    </div>
                  </div>

                  {/* Auto-dismiss indicator */}
                  <div className="text-center mt-4">
                    <div className="text-xs text-gray-400">
                      Auto-dismissing in 5 seconds...
                    </div>
                    <motion.div 
                      className="h-1 bg-gray-600 rounded-full mt-2 overflow-hidden"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    >
                      <div className="h-full bg-red-500" />
                    </motion.div>
                    
                    {/* Queue indicator */}
                    {alertQueue.length > 1 && (
                      <div className="mt-2">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                          <span className="text-xs text-orange-300 font-medium">
                            {alertQueue.length - 1} more alert{alertQueue.length - 1 > 1 ? 's' : ''} waiting
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FireEffect>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              setShowNewAlertOverlay(false);
              setTimeout(() => {
                if (newAlertNotification) {
                  removeFromAlertQueue(newAlertNotification.id);
                  // Don't set newAlertNotification to null here - let the store handle it
                }
              }, 500);
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            data-testid="close-overlay-button"
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 