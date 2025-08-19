'use client';

import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import ThemeToggle from '@/components/ThemeToggle';
import RefreshButton from '@/components/RefreshButton';
import Header from '@/components/Header';
import AlertList from '@/components/AlertList';
import SystemStatus from '@/components/SystemStatus';
import ZoomLevel from '@/components/ZoomLevel';

import GlobeTransition from '@/components/GlobeTransition';
import { motion } from 'framer-motion';

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setIsAppReady(true);
  };

  return (
    <>
      {/* Globe Transition */}
      <GlobeTransition 
        isVisible={isTransitioning} 
        onComplete={handleTransitionComplete} 
      />

      {/* Main App */}
      {isAppReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 bg-background text-textPrimary"
        >
          <ThemeToggle />
          <RefreshButton />
          <Header />
          <div className="absolute top-40 left-4 z-40">
            <SystemStatus />
          </div>
          <div className="absolute inset-0 pt-32 pb-32">
            <MapView />
          </div>
          <ZoomLevel />
          <AlertList />
        </motion.div>
      )}
    </>
  );
}
