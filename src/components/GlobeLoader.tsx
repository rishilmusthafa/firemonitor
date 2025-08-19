'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobeLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

// Aceternity UI style card stack component
const CardStack = ({ items, offset = 10, scaleFactor = 0.06 }: {
  items: Array<{ id: number; name: string; designation: string; content: React.ReactNode }>;
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset;
  const SCALE_FACTOR = scaleFactor;
  const [cards, setCards] = useState(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-60 w-60 md:h-60 md:w-96">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute dark:bg-black bg-white h-60 w-60 md:h-60 md:w-96 rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
          style={{
            transformOrigin: "top center",
          }}
          animate={{
            top: index * -CARD_OFFSET,
            scale: 1 - index * SCALE_FACTOR,
            zIndex: cards.length - index,
          }}
        >
          <div className="font-normal text-neutral-700 dark:text-neutral-200">
            {card.content}
          </div>
          <div>
            <p className="text-neutral-500 font-medium dark:text-white">
              {card.name}
            </p>
            <p className="text-neutral-400 font-normal dark:text-neutral-200">
              {card.designation}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Advanced globe with Cesium-style effects
const AdvancedGlobe = () => {
  return (
    <div className="relative">
      {/* Main globe sphere */}
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 flex items-center justify-center shadow-2xl border border-cyan-500/20 relative"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(15, 23, 42, 0.8) 100%)',
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Latitude lines */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-px bg-cyan-400/20"
              style={{ top: `${(i + 1) * 16.66}%` }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          
          {/* Longitude lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-full w-px bg-cyan-400/20"
              style={{ left: `${(i + 1) * 12.5}%` }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Continents simulation */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-600/20 via-teal-500/30 to-cyan-600/20 flex items-center justify-center relative">
          {/* Fire monitoring center */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
              boxShadow: [
                "0 0 20px rgba(239, 68, 68, 0.3)",
                "0 0 40px rgba(239, 68, 68, 0.6)",
                "0 0 20px rgba(239, 68, 68, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl z-10 bg-red-500/20 rounded-full p-3 backdrop-blur-sm"
          >
            🔥
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting satellites */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
          style={{
            transformOrigin: "0 0",
          }}
          animate={{
            rotate: [0, 360],
            x: Math.cos((i * 120 * Math.PI) / 180) * 120,
            y: Math.sin((i * 120 * Math.PI) / 180) * 120,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-full h-full bg-yellow-300 rounded-full"
          />
        </motion.div>
      ))}

      {/* Data streams */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            transformOrigin: "0 0",
          }}
          animate={{
            rotate: [0, 360],
            x: Math.cos((i * 45 * Math.PI) / 180) * 140,
            y: Math.sin((i * 45 * Math.PI) / 180) * 140,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Pulse rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full border border-cyan-400/30"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            marginLeft: `-${(80 + i * 40) / 2}px`,
            marginTop: `-${(80 + i * 40) / 2}px`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

// Space background with enhanced effects
const EnhancedSpaceBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Static stars */}
    {[...Array(150)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: 0,
        }}
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 6 + 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
    
    {/* Shooting stars */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
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

    {/* Nebula effect */}
    <div className="absolute inset-0">
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"
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
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl"
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
  </div>
);

export default function GlobeLoader({ isLoading, onComplete }: GlobeLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const loadingTexts = [
    "Initializing Fire Monitoring System...",
    "Loading UAE Villa Database...",
    "Connecting to Real-time Alerts...",
    "Preparing 3D Globe Visualization...",
    "Establishing Secure Connections...",
    "System Ready! 🚀"
  ];

  const cardItems = [
    {
      id: 1,
      name: "System Status",
      designation: "Initializing",
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span>Core systems online</span>
        </div>
      ),
    },
    {
      id: 2,
      name: "Database",
      designation: "Loading",
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <span>Villa data processing</span>
        </div>
      ),
    },
    {
      id: 3,
      name: "Network",
      designation: "Connecting",
      content: (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
          <span>Real-time feeds active</span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading || !isClient) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 1000);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 200);

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden"
      >
        <EnhancedSpaceBackground />

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          {/* Advanced Globe */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 2, type: "spring" }}
            className="mb-16"
          >
            <AdvancedGlobe />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-6xl md:text-8xl font-bold text-white mb-8"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Fire Monitor UAE
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-2xl text-cyan-300 mb-16"
          >
            24/7 Real-time Monitoring System
          </motion.p>

          {/* Card Stack */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex justify-center mb-16"
          >
            <CardStack items={cardItems} />
          </motion.div>

          {/* Loading Text */}
          <motion.div
            key={currentText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-xl text-white mb-12 min-h-[2rem]"
          >
            {loadingTexts[currentText]}
          </motion.div>

          {/* Progress Bar */}
          <div className="w-96 mx-auto mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-full h-5 overflow-hidden border border-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-3 text-cyan-300 font-mono text-lg"
            >
              {Math.round(progress)}%
            </motion.div>
          </div>

          {/* Animated Dots */}
          <motion.div className="flex justify-center space-x-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
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
      </motion.div>
    </AnimatePresence>
  );
} 