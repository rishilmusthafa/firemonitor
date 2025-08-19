'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

// UAE coordinates for the fly-to animation
const UAE_COORDINATES = {
  latitude: 24.4539,
  longitude: 54.3773,
  height: 1000000 // 1000km altitude
};

// Aceternity UI style floating card component
const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className="relative group/card hover:shadow-2xl hover:shadow-accent/20 bg-black/40 backdrop-blur-md border-accent/20 border w-auto rounded-xl p-6 shadow-2xl transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        {children}
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
  </motion.div>
);

// Animated Earth component with realistic space appearance
const AnimatedEarth = ({ isTransitioning = false }: { isTransitioning?: boolean }) => (
  <div className="relative">
    {/* Main Earth */}
    <motion.div
      animate={{ 
        rotate: isTransitioning ? 0 : 360,
        scale: isTransitioning ? 1.2 : 1
      }}
      transition={{ 
        duration: isTransitioning ? 2 : 20, 
        repeat: isTransitioning ? 0 : Infinity, 
        ease: isTransitioning ? "easeInOut" : "linear" 
      }}
      className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center shadow-2xl border-2 border-accent/30 relative overflow-hidden"
    >
      {/* Earth continents overlay */}
      <div className="w-44 h-44 rounded-full bg-gradient-to-br from-emerald-600/40 via-emerald-500/50 to-emerald-600/40 flex items-center justify-center relative overflow-hidden">
        {/* Continents pattern */}
        <div className="absolute inset-0 opacity-60">
          {/* North America */}
          <div className="absolute top-1/4 left-1/4 w-8 h-6 bg-emerald-500/70 rounded-full transform rotate-12" />
          {/* South America */}
          <div className="absolute top-1/2 left-1/3 w-6 h-10 bg-emerald-500/70 rounded-full transform rotate-12" />
          {/* Europe */}
          <div className="absolute top-1/3 right-1/3 w-6 h-4 bg-emerald-500/70 rounded-full transform -rotate-12" />
          {/* Africa */}
          <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-emerald-500/70 rounded-full" />
          {/* Asia */}
          <div className="absolute top-1/4 right-1/6 w-12 h-8 bg-emerald-500/70 rounded-full transform rotate-6" />
          {/* Australia */}
          <div className="absolute bottom-1/4 right-1/3 w-6 h-4 bg-emerald-500/70 rounded-full transform rotate-12" />
        </div>
        
        {/* UAE Highlight */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: 1
          }}
          className="absolute top-1/3 right-1/4 w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50 z-10"
        />
      </div>
      
      {/* Atmosphere glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20 animate-pulse" />
    </motion.div>

    {/* Orbiting satellites */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50"
        style={{
          transformOrigin: "0 0",
        }}
        animate={{
          rotate: [0, 360],
          x: Math.cos((i * 120 * Math.PI) / 180) * 140,
          y: Math.sin((i * 120 * Math.PI) / 180) * 140,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
          delay: i * 0.5,
        }}
      />
    ))}

    {/* Data streams */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent rounded-full"
        style={{
          transformOrigin: "0 0",
        }}
        animate={{
          rotate: [0, 360],
          x: Math.cos((i * 45 * Math.PI) / 180) * 160,
          y: Math.sin((i * 45 * Math.PI) / 180) * 160,
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
          delay: i * 0.3,
        }}
      />
    ))}
  </div>
);

// Enhanced space background with nebula and stars
const SpaceBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    {/* Nebula effect */}
    <div className="absolute inset-0">
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>

    {/* Stars */}
    {[...Array(200)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-0.5 bg-white rounded-full"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: 0,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 6 + 3,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
      />
    ))}
    
    {/* Shooting stars */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-accent rounded-full"
        initial={{
          x: -50,
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: 0,
        }}
        animate={{
          x: (typeof window !== 'undefined' ? window.innerWidth : 1200) + 50,
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: i * 3,
        }}
      />
    ))}

    {/* Space dust */}
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-0.5 bg-accent/30 rounded-full"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        }}
        animate={{
          y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
      />
    ))}
  </div>
);

export default function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadingTexts = [
    "Initializing Fire Monitoring System...",
    "Loading UAE Villa Database...",
    "Connecting to Real-time Alerts...",
    "Preparing 3D Globe Visualization...",
    "Establishing Secure Connections...",
    "Navigating to UAE... 🚀"
  ];

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading || !isClient) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start transition animation
          setIsTransitioning(true);
          setTimeout(() => {
            onComplete?.();
          }, 2000); // Wait for transition animation
          return 100;
        }
        return prev + Math.random() * 8; // Slower progress for better experience
      });
    }, 300); // Slower interval for smoother progress

    const textInterval = setInterval(() => {
      setCurrentText(prev => {
        if (prev >= loadingTexts.length - 1) {
          clearInterval(textInterval);
          return loadingTexts.length - 1;
        }
        return prev + 1;
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [isLoading, onComplete, isClient]);

  if (!isLoading || !isClient) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      >
        <SpaceBackground />

        {/* Central Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          {/* Animated Earth */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: isTransitioning ? 0.8 : 1, 
              rotate: isTransitioning ? 0 : 0,
              y: isTransitioning ? -100 : 0,
              x: isTransitioning ? 200 : 0
            }}
            transition={{ 
              duration: isTransitioning ? 2 : 1.5, 
              ease: isTransitioning ? "easeInOut" : "easeOut"
            }}
            className="mb-12"
          >
            <AnimatedEarth isTransitioning={isTransitioning} />
          </motion.div>



          {/* Loading Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <FloatingCard delay={1}>
              <div className="text-accent text-sm font-medium">System Status</div>
              <div className="text-white text-lg font-semibold">Initializing</div>
            </FloatingCard>
            
            <FloatingCard delay={1.2}>
              <div className="text-accent text-sm font-medium">Database</div>
              <div className="text-white text-lg font-semibold">Loading</div>
            </FloatingCard>
            
            <FloatingCard delay={1.4}>
              <div className="text-accent text-sm font-medium">Connection</div>
              <div className="text-white text-lg font-semibold">Establishing</div>
            </FloatingCard>
          </div>

          {/* Loading Text */}
          <motion.div
            key={currentText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-lg text-white mb-8 min-h-[2rem]"
          >
            {loadingTexts[currentText]}
          </motion.div>

          {/* Progress Bar */}
          <div className="w-96 mx-auto mb-8">
            <div className="bg-black/50 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-accent/30">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-3 text-accent font-mono"
            >
              {Math.round(progress)}%
            </motion.div>
          </div>

          {/* Animated Dots */}
          <motion.div className="flex justify-center space-x-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-gradient-to-r from-accent to-accent/80 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Corner Decorations */}
        <motion.div 
          className="absolute top-8 left-8 text-accent text-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          ⚡
        </motion.div>
        
        <motion.div 
          className="absolute top-8 right-8 text-accent text-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌍
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 left-8 text-accent text-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏠
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 right-8 text-alert text-3xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🚨
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 