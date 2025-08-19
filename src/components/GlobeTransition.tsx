'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobeTransitionProps {
  isVisible: boolean;
  onComplete: () => void;
}

// ============================================================================
// CONFIGURATION VARIABLES - CUSTOMIZE THESE TO CHANGE THE ANIMATION
// ============================================================================

// UAE coordinates for the fly-to animation
const UAE_COORDINATES = {
  latitude: 24.4539,
  longitude: 54.3773,
  height: 1000000 // 1000km altitude
};

// Brand colors from logo
const BRAND_COLORS = {
  red: '#EE1927',      // UAE flag red
  green: '#0E763D',    // UAE flag green
  white: '#FFFFFF',    // Pure white
  accent: '#EE1927',   // Use red as primary accent
  alert: '#EE1927',    // Use red for alerts
};

// Animation timing configuration (in milliseconds)
const ANIMATION_TIMING = {
  approachDuration: 1000,    // Time before zoom starts
  zoomDuration: 3000,        // Time for zoom animation
  landingDuration: 5000,     // Time for landing animation
  completeDelay: 1000,       // Delay before calling onComplete
};

// Earth globe configuration
const EARTH_CONFIG = {
  baseSize: 48,              // Base size of Earth (w-48 h-48)
  oceanSize: 44,             // Ocean layer size (w-44 h-44)
  continentSize: 40,         // Continent layer size (w-40 h-40)
  uaeHighlightSize: 2.5,     // UAE highlight size (w-2.5 h-2.5)
  
  // Scale multipliers for different phases
  scaleMultipliers: {
    approach: 0.8,
    zoom: 2,
    landing: 4,
    complete: 6,
  },
  
  // Position offsets for different phases
  positionOffsets: {
    approach: { x: 0, y: 0 },
    zoom: { x: -100, y: -50 },
    landing: { x: -200, y: -100 },
    complete: { x: -300, y: -150 },
  },
  
  // Rotation angles for different phases
  rotationAngles: {
    approach: 0,
    zoom: 45,
    landing: 90,
    complete: 135,
  },
};

// Space background configuration
const SPACE_CONFIG = {
  // Nebula settings - using brand colors
  nebulaCount: 3,
  nebulaSizes: [96, 80, 64], // w-96, w-80, w-64
  nebulaColors: [
    'from-red-900/40 via-red-800/30',      // Red nebula
    'from-green-900/40 via-green-800/30',  // Green nebula
    'from-red-800/30 via-green-800/20'     // Red-green blend
  ],
  nebulaPositions: [
    'top-1/4 left-1/4',
    'bottom-1/4 right-1/4',
    'top-1/2 left-1/2'
  ],
  
  // Star configuration - using brand colors
  starCount: 60,             // Number of stars
  starSizes: ['w-1 h-1', 'w-0.5 h-0.5'],
  starColors: ['bg-red-400', 'bg-white', 'bg-green-400'], // Brand color stars
  starAnimationRange: 30,    // How far stars move up
  
  // Shooting star configuration - using brand red
  shootingStarCount: 8,
  shootingStarSize: 'w-1 h-1',
  shootingStarColor: 'bg-red-500', // Brand red
  shootingStarCurve: 80,     // Curve intensity
  
  // Space dust configuration - using brand colors
  spaceDustCount: 60,
  spaceDustSize: 'w-0.5 h-0.5',
  spaceDustColor: 'bg-red-400/30', // Brand red with opacity
};

// Text configuration
const TEXT_CONFIG = {
  // Transition messages
  messages: {
    zoom: 'Approaching UAE...',
    landing: 'Entering UAE Airspace...',
    complete: 'Welcome to Hassantuk Fire Alarms UAE! 🚀'
  },
  
  // Subtitle messages
  subtitles: {
    zoom: 'Latitude: 24.4539°N, Longitude: 54.3773°E',
    landing: 'Establishing connection to monitoring systems...',
    complete: 'System ready for real-time monitoring'
  },
  
  // Text styling - using brand colors
  mainTextClass: 'text-white text-xl font-semibold mb-2',
  subtitleClass: 'text-red-200 text-sm', // Brand red tint
};

// Progress bar configuration - using white colors for professional look
const PROGRESS_CONFIG = {
  width: 80,                 // w-80 - wider for more professional look
  height: 1,                 // h-1 - thinner, more elegant
  borderClass: 'border-white/30', // White border
  backgroundClass: 'bg-black/30 backdrop-blur-md', // More subtle background
  fillClass: 'bg-gradient-to-r from-white via-white/90 to-white/80', // White gradient
  percentageClass: 'text-white/90 text-xs font-light tracking-wider', // White text
  labelClass: 'text-white/70 text-xs font-light uppercase tracking-widest', // White label
};

// Corner decorations configuration - using brand colors
const CORNER_DECORATIONS = [
  { 
    icon: '/fireIcon.png', 
    position: 'top-8 left-8', 
    animation: 'rotate', 
    color: 'text-red-500',
    size: 'w-6 h-6'
  },
  { 
    icon: '🌍', 
    position: 'top-8 right-8', 
    animation: 'scale', 
    color: 'text-green-500',
    size: 'text-2xl'
  },
  { 
    icon: '/building.png', 
    position: 'bottom-8 left-8', 
    animation: 'bounce', 
    color: 'text-red-400',
    size: 'w-6 h-6'
  },
  { 
    icon: '/alarmIcon.svg', 
    position: 'bottom-8 right-8', 
    animation: 'shake', 
    color: 'text-red-600',
    size: 'w-6 h-6'
  },
];

// ============================================================================
// END CONFIGURATION VARIABLES
// ============================================================================

export default function GlobeTransition({ isVisible, onComplete }: GlobeTransitionProps) {
  // Animation phase state: approach -> zoom -> landing -> complete
  const [phase, setPhase] = useState<'approach' | 'zoom' | 'landing' | 'complete'>('approach');

  // Animation phase management
  useEffect(() => {
    if (!isVisible) return;

    // Phase 1: Approach from space (Earth appears and starts rotating)
    const approachTimer = setTimeout(() => {
      setPhase('zoom');
    }, ANIMATION_TIMING.approachDuration);

    // Phase 2: Zoom into UAE (Earth scales up and moves toward UAE)
    const zoomTimer = setTimeout(() => {
      setPhase('landing');
    }, ANIMATION_TIMING.zoomDuration);

    // Phase 3: Landing and complete (Final zoom and transition to app)
    const landingTimer = setTimeout(() => {
      setPhase('complete');
      setTimeout(() => {
        onComplete(); // Call the completion callback
      }, ANIMATION_TIMING.completeDelay);
    }, ANIMATION_TIMING.landingDuration);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(approachTimer);
      clearTimeout(zoomTimer);
      clearTimeout(landingTimer);
    };
  }, [isVisible, onComplete]);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black overflow-hidden"
      >
        {/* ============================================================================
           SPACE BACKGROUND - Creates the immersive space environment
           ============================================================================ */}
        <div className="absolute inset-0">
          {/* Deep space gradient - Creates depth and atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-purple-950/10" />
          
          {/* ============================================================================
             NEBULA EFFECTS - Animated cosmic clouds for atmosphere
             ============================================================================ */}
          {/* Nebula 1: Purple/Blue nebula in top-left */}
          <motion.div
            className={`absolute ${SPACE_CONFIG.nebulaPositions[0]} w-${SPACE_CONFIG.nebulaSizes[0]} h-${SPACE_CONFIG.nebulaSizes[0]} bg-gradient-to-br ${SPACE_CONFIG.nebulaColors[0]} to-transparent rounded-full blur-3xl`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Nebula 2: Cyan/Blue nebula in bottom-right */}
          <motion.div
            className={`absolute ${SPACE_CONFIG.nebulaPositions[1]} w-${SPACE_CONFIG.nebulaSizes[1]} h-${SPACE_CONFIG.nebulaSizes[1]} bg-gradient-to-br ${SPACE_CONFIG.nebulaColors[1]} to-transparent rounded-full blur-3xl`}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.8, 0.5],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
          
          {/* Nebula 3: Pink/Purple nebula in center */}
          <motion.div
            className={`absolute ${SPACE_CONFIG.nebulaPositions[2]} w-${SPACE_CONFIG.nebulaSizes[2]} h-${SPACE_CONFIG.nebulaSizes[2]} bg-gradient-to-br ${SPACE_CONFIG.nebulaColors[2]} to-transparent rounded-full blur-2xl`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [180, 360, 180],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 6,
            }}
          />

          {/* ============================================================================
             STARS - Twinkling stars with varied sizes and colors
             ============================================================================ */}
          {/* Predefined star positions for natural-looking distribution */}
          {/* Each star has: x, y position, size, color, animation delay, and duration */}
          {[
            // Row 1: Top stars
            {x: 150, y: 120, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 0.2, duration: 4},
            {x: 450, y: 80, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.8, duration: 3},
            {x: 750, y: 200, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.5, duration: 5},
            {x: 1050, y: 150, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 2.1, duration: 4},
            {x: 1350, y: 90, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.5, duration: 3},
            {x: 1650, y: 180, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.8, duration: 5},
            
            // Row 2: Upper middle stars
            {x: 200, y: 300, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 0.9, duration: 4},
            {x: 500, y: 250, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 1.3, duration: 3},
            {x: 800, y: 350, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.4, duration: 5},
            {x: 1100, y: 280, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 0.7, duration: 4},
            {x: 1400, y: 320, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 1.6, duration: 3},
            {x: 1700, y: 270, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.9, duration: 5},
            
            // Row 3: Middle stars
            {x: 300, y: 480, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 0.4, duration: 4},
            {x: 600, y: 420, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 1.1, duration: 3},
            {x: 900, y: 500, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.9, duration: 5},
            {x: 1200, y: 450, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 2.6, duration: 4},
            {x: 1500, y: 480, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.3, duration: 3},
            {x: 1800, y: 430, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.4, duration: 5},
            
            // Row 4: Lower middle stars
            {x: 250, y: 650, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 2.2, duration: 4},
            {x: 550, y: 600, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.6, duration: 3},
            {x: 850, y: 680, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.7, duration: 5},
            {x: 1150, y: 620, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 2.8, duration: 4},
            {x: 1450, y: 650, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.1, duration: 3},
            {x: 1750, y: 580, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.2, duration: 5},
            
            // Row 5: Bottom stars
            {x: 100, y: 750, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 2.5, duration: 4},
            {x: 400, y: 720, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.9, duration: 3},
            {x: 700, y: 780, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.8, duration: 5},
            {x: 1000, y: 750, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 2.3, duration: 4},
            {x: 1300, y: 720, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.4, duration: 3},
            {x: 1600, y: 780, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.6, duration: 5},
            
            // Additional stars for better coverage
            {x: 350, y: 180, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.8, duration: 3},
            {x: 650, y: 220, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 1.5, duration: 4},
            {x: 950, y: 160, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.2, duration: 5},
            {x: 1250, y: 200, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.7, duration: 3},
            {x: 1550, y: 140, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 1.9, duration: 4},
            {x: 1850, y: 180, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.6, duration: 5},
            
            // More stars for density
            {x: 150, y: 400, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.3, duration: 3},
            {x: 450, y: 360, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 1.1, duration: 4},
            {x: 750, y: 420, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.8, duration: 5},
            {x: 1050, y: 380, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 2.4, duration: 3},
            {x: 1350, y: 440, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 0.6, duration: 4},
            {x: 1650, y: 400, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.3, duration: 5},
            
            // Final row of stars
            {x: 200, y: 600, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 2.0, duration: 3},
            {x: 500, y: 560, size: SPACE_CONFIG.starSizes[0], color: SPACE_CONFIG.starColors[0], delay: 0.5, duration: 4},
            {x: 800, y: 620, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 1.2, duration: 5},
            {x: 1100, y: 580, size: SPACE_CONFIG.starColors[1], color: SPACE_CONFIG.starColors[1], delay: 1.9, duration: 3},
            {x: 1400, y: 640, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 2.7, duration: 4},
            {x: 1700, y: 600, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 0.2, duration: 5},
            
            // Bottom edge stars
            {x: 300, y: 800, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[1], delay: 0.9, duration: 3},
            {x: 600, y: 760, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 1.6, duration: 4},
            {x: 900, y: 820, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.3, duration: 5},
            {x: 1200, y: 780, size: SPACE_CONFIG.starColors[1], color: SPACE_CONFIG.starColors[1], delay: 0.8, duration: 3},
            {x: 1500, y: 840, size: SPACE_CONFIG.starColors[0], color: SPACE_CONFIG.starColors[0], delay: 1.5, duration: 4},
            {x: 1800, y: 800, size: SPACE_CONFIG.starSizes[1], color: SPACE_CONFIG.starColors[2], delay: 2.2, duration: 5},
          ].map((star, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${star.size} ${star.color}`}
              initial={{
                x: star.x,
                y: star.y,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: star.y - SPACE_CONFIG.starAnimationRange,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: "linear",
                delay: star.delay,
              }}
            />
          ))}
          
          {/* ============================================================================
             SHOOTING STARS - Meteor-like effects across the screen
             ============================================================================ */}
          {/* Each shooting star has: y position, delay, and angle for trajectory */}
          {[
            {y: 100, delay: 0, angle: 15},
            {y: 250, delay: 3, angle: 20},
            {y: 400, delay: 6, angle: 10},
            {y: 550, delay: 9, angle: 25},
            {y: 700, delay: 12, angle: 18},
            {y: 850, delay: 15, angle: 12},
            {y: 200, delay: 18, angle: 22},
            {y: 350, delay: 21, angle: 16},
          ].map((star, i) => (
            <motion.div
              key={i}
              className={`absolute ${SPACE_CONFIG.shootingStarSize} ${SPACE_CONFIG.shootingStarColor} rounded-full`}
              initial={{
                x: -50,
                y: star.y,
                opacity: 0,
              }}
              animate={{
                x: 1200 + 50,
                y: star.y + Math.sin(star.angle * Math.PI / 180) * SPACE_CONFIG.shootingStarCurve,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: star.delay,
              }}
            />
          ))}

          {/* ============================================================================
             SPACE DUST - Floating particles for depth and atmosphere
             ============================================================================ */}
          {/* Each dust particle has: x, y position, delay, and duration */}
          {[
            // Row 1
            {x: 100, y: 150, delay: 0.5, duration: 8},
            {x: 300, y: 300, delay: 1.2, duration: 6},
            {x: 500, y: 450, delay: 2.1, duration: 9},
            {x: 700, y: 200, delay: 0.8, duration: 7},
            {x: 900, y: 350, delay: 1.8, duration: 8},
            {x: 1100, y: 500, delay: 2.5, duration: 6},
            {x: 1300, y: 250, delay: 0.3, duration: 9},
            {x: 1500, y: 400, delay: 1.6, duration: 7},
            {x: 1700, y: 550, delay: 2.3, duration: 8},
            
            // Row 2
            {x: 200, y: 600, delay: 0.9, duration: 6},
            {x: 400, y: 750, delay: 1.5, duration: 9},
            {x: 600, y: 100, delay: 2.0, duration: 7},
            {x: 800, y: 250, delay: 0.7, duration: 8},
            {x: 1000, y: 400, delay: 1.4, duration: 6},
            {x: 1200, y: 550, delay: 2.2, duration: 9},
            {x: 1400, y: 700, delay: 0.4, duration: 7},
            {x: 1600, y: 150, delay: 1.1, duration: 8},
            {x: 1800, y: 300, delay: 1.9, duration: 6},
            
            // Row 3
            {x: 250, y: 450, delay: 2.6, duration: 9},
            {x: 450, y: 600, delay: 0.2, duration: 7},
            {x: 650, y: 750, delay: 0.9, duration: 8},
            {x: 850, y: 200, delay: 1.7, duration: 6},
            {x: 1050, y: 350, delay: 2.4, duration: 9},
            {x: 1250, y: 500, delay: 0.6, duration: 7},
            {x: 1450, y: 650, delay: 1.3, duration: 8},
            {x: 1650, y: 100, delay: 2.0, duration: 6},
            {x: 1850, y: 250, delay: 0.8, duration: 9},
            
            // Row 4
            {x: 150, y: 400, delay: 1.5, duration: 7},
            {x: 350, y: 550, delay: 2.2, duration: 8},
            {x: 550, y: 700, delay: 0.4, duration: 6},
            {x: 750, y: 150, delay: 1.1, duration: 9},
            {x: 950, y: 300, delay: 1.8, duration: 7},
            {x: 1150, y: 450, delay: 2.5, duration: 8},
            {x: 1350, y: 600, delay: 0.3, duration: 6},
            {x: 1550, y: 750, delay: 1.0, duration: 9},
            {x: 1750, y: 200, delay: 1.7, duration: 7},
            
            // Row 5
            {x: 50, y: 350, delay: 2.4, duration: 8},
            {x: 250, y: 500, delay: 0.6, duration: 6},
            {x: 450, y: 650, delay: 1.3, duration: 9},
            {x: 650, y: 100, delay: 2.0, duration: 7},
            {x: 850, y: 250, delay: 0.8, duration: 8},
            {x: 1050, y: 400, delay: 1.5, duration: 6},
            {x: 1250, y: 550, delay: 2.2, duration: 9},
            {x: 1450, y: 700, delay: 0.4, duration: 7},
            {x: 1650, y: 150, delay: 1.1, duration: 8},
            {x: 1850, y: 300, delay: 1.8, duration: 6},
            
            // Row 6
            {x: 100, y: 450, delay: 2.5, duration: 9},
            {x: 300, y: 600, delay: 0.3, duration: 7},
            {x: 500, y: 750, delay: 1.0, duration: 8},
            {x: 700, y: 200, delay: 1.7, duration: 6},
            {x: 900, y: 350, delay: 2.4, duration: 9},
            {x: 1100, y: 500, delay: 0.6, duration: 7},
            {x: 1300, y: 650, delay: 1.3, duration: 8},
            {x: 1500, y: 100, delay: 2.0, duration: 6},
            {x: 1700, y: 250, delay: 0.8, duration: 9},
            
            // Row 7
            {x: 200, y: 400, delay: 1.5, duration: 7},
            {x: 400, y: 550, delay: 2.2, duration: 8},
            {x: 600, y: 700, delay: 0.4, duration: 6},
            {x: 800, y: 150, delay: 1.1, duration: 9},
            {x: 1000, y: 300, delay: 1.8, duration: 7},
            {x: 1200, y: 450, delay: 2.5, duration: 8},
            {x: 1400, y: 600, delay: 0.3, duration: 6},
            {x: 1600, y: 750, delay: 1.0, duration: 9},
            {x: 1800, y: 200, delay: 1.7, duration: 7},
          ].map((dust, i) => (
            <motion.div
              key={i}
              className={`absolute ${SPACE_CONFIG.spaceDustSize} ${SPACE_CONFIG.spaceDustColor} rounded-full`}
              initial={{
                x: dust.x,
                y: dust.y,
              }}
              animate={{
                y: 800 + 100,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: dust.duration,
                repeat: Infinity,
                ease: "linear",
                delay: dust.delay,
              }}
            />
          ))}
        </div>

        {/* ============================================================================
           EARTH GLOBE - The main animated Earth with realistic details
           ============================================================================ */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            // Scale the Earth based on current animation phase
            scale: EARTH_CONFIG.scaleMultipliers[phase],
            // Rotate the Earth for dynamic movement
            rotate: EARTH_CONFIG.rotationAngles[phase],
            // Move the Earth toward UAE location
            x: EARTH_CONFIG.positionOffsets[phase].x,
            y: EARTH_CONFIG.positionOffsets[phase].y,
          }}
          transition={{
            duration: phase === 'approach' ? 1 : phase === 'zoom' ? 2 : phase === 'landing' ? 2 : 1,
            ease: "easeInOut",
          }}
        >
          {/* ============================================================================
             MAIN EARTH SPHERE - Base layer with realistic gradient
             ============================================================================ */}
          <div className={`w-${EARTH_CONFIG.baseSize} h-${EARTH_CONFIG.baseSize} rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center shadow-2xl border-2 border-red-500/30 relative overflow-hidden`}>
            
            {/* ============================================================================
               OCEAN BASE LAYER - Realistic ocean with depth variations
               ============================================================================ */}
            <div className={`w-${EARTH_CONFIG.oceanSize} h-${EARTH_CONFIG.oceanSize} rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden`}>
              
              {/* ============================================================================
                 CONTINENT LAYER - Detailed continent shapes with realistic positioning
                 ============================================================================ */}
              <div className={`w-${EARTH_CONFIG.continentSize} h-${EARTH_CONFIG.continentSize} rounded-full bg-gradient-to-br from-emerald-600/70 via-emerald-500/80 to-emerald-600/70 flex items-center justify-center relative overflow-hidden`}>
                
                {/* ============================================================================
                   CONTINENT SHAPES - Realistic continent positioning and detail
                   ============================================================================ */}
                <div className="absolute inset-0 opacity-90">
                  {/* North America - More detailed shape with multiple parts */}
                  <div className="absolute top-1/4 left-1/4 w-10 h-7 bg-emerald-500/85 rounded-full transform rotate-12 shadow-lg" />
                  <div className="absolute top-1/3 left-1/3 w-5 h-4 bg-emerald-500/80 rounded-full transform rotate-45" />
                  <div className="absolute top-1/5 left-1/3 w-4 h-3 bg-emerald-500/75 rounded-full transform rotate-30" />
                  
                  {/* South America - More elongated shape */}
                  <div className="absolute top-1/2 left-1/3 w-6 h-12 bg-emerald-500/85 rounded-full transform rotate-12 shadow-lg" />
                  <div className="absolute top-2/3 left-1/4 w-4 h-5 bg-emerald-500/80 rounded-full transform rotate-30" />
                  <div className="absolute top-3/4 left-1/3 w-3 h-4 bg-emerald-500/75 rounded-full transform rotate-45" />
                  
                  {/* Europe - More detailed with multiple regions */}
                  <div className="absolute top-1/3 right-1/3 w-6 h-4 bg-emerald-500/85 rounded-full transform -rotate-12 shadow-lg" />
                  <div className="absolute top-1/4 right-1/4 w-4 h-3 bg-emerald-500/80 rounded-full transform -rotate-30" />
                  <div className="absolute top-1/5 right-1/3 w-3 h-2 bg-emerald-500/75 rounded-full transform -rotate-45" />
                  
                  {/* Africa - More detailed shape with multiple parts */}
                  <div className="absolute top-1/2 right-1/4 w-8 h-9 bg-emerald-500/85 rounded-full shadow-lg" />
                  <div className="absolute top-2/3 right-1/3 w-5 h-4 bg-emerald-500/80 rounded-full" />
                  <div className="absolute top-3/4 right-1/4 w-4 h-3 bg-emerald-500/75 rounded-full" />
                  
                  {/* Asia - Much more detailed with multiple regions */}
                  <div className="absolute top-1/4 right-1/6 w-12 h-8 bg-emerald-500/85 rounded-full transform rotate-6 shadow-lg" />
                  <div className="absolute top-1/3 right-1/8 w-8 h-5 bg-emerald-500/80 rounded-full transform rotate-15" />
                  <div className="absolute top-1/2 right-1/10 w-10 h-6 bg-emerald-500/80 rounded-full transform rotate-10" />
                  <div className="absolute top-1/4 right-1/12 w-6 h-4 bg-emerald-500/75 rounded-full transform rotate-25" />
                  <div className="absolute top-1/3 right-1/15 w-4 h-3 bg-emerald-500/70 rounded-full transform rotate-35" />
                  
                  {/* Australia - More detailed with Tasmania */}
                  <div className="absolute bottom-1/4 right-1/3 w-6 h-4 bg-emerald-500/85 rounded-full transform rotate-12 shadow-lg" />
                  <div className="absolute bottom-1/3 right-1/4 w-4 h-3 bg-emerald-500/80 rounded-full transform rotate-45" />
                  <div className="absolute bottom-1/5 right-1/3 w-3 h-2 bg-emerald-500/75 rounded-full transform rotate-30" />
                  
                  {/* Greenland - More detailed shape */}
                  <div className="absolute top-1/6 left-1/3 w-5 h-5 bg-emerald-500/80 rounded-full transform rotate-15 shadow-lg" />
                  <div className="absolute top-1/8 left-1/3 w-3 h-3 bg-emerald-500/75 rounded-full transform rotate-25" />
                  
                  {/* Antarctica - More detailed shape */}
                  <div className="absolute bottom-1/6 left-1/2 w-10 h-3 bg-emerald-500/70 rounded-full transform -rotate-10" />
                  <div className="absolute bottom-1/8 left-1/2 w-8 h-2 bg-emerald-500/65 rounded-full transform -rotate-15" />
                  
                  {/* Middle East region - More prominent for UAE context with brand colors */}
                  <div className="absolute top-1/3 right-1/4 w-4 h-3 bg-green-500/80 rounded-full transform rotate-5" />
                  <div className="absolute top-1/3 right-1/5 w-3 h-2 bg-green-500/75 rounded-full transform rotate-15" />
                  
                  {/* Indian subcontinent */}
                  <div className="absolute top-1/2 right-1/6 w-5 h-4 bg-emerald-500/80 rounded-full transform rotate-20" />
                  <div className="absolute top-1/2 right-1/7 w-3 h-3 bg-emerald-500/75 rounded-full transform rotate-30" />
                </div>
                
                {/* ============================================================================
                   UAE HIGHLIGHT - Becomes more prominent during zoom phases
                   ============================================================================ */}
                {/* Main UAE point - scales and becomes more visible during animation */}
                <motion.div
                  animate={{
                    scale: phase === 'approach' ? 1 : phase === 'zoom' ? 3 : phase === 'landing' ? 5 : 6,
                    opacity: phase === 'approach' ? 0.4 : phase === 'zoom' ? 0.9 : phase === 'landing' ? 1 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute top-1/3 right-1/4 w-${EARTH_CONFIG.uaeHighlightSize} h-${EARTH_CONFIG.uaeHighlightSize} bg-red-500 rounded-full shadow-lg shadow-red-500/60 z-20`}
                />
                
                {/* UAE glow effect - creates a halo around the UAE point */}
                <motion.div
                  animate={{
                    scale: phase === 'approach' ? 1 : phase === 'zoom' ? 4 : phase === 'landing' ? 6 : 7,
                    opacity: phase === 'approach' ? 0 : phase === 'zoom' ? 0.4 : phase === 'landing' ? 0.6 : 0.7,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute top-1/3 right-1/4 w-${EARTH_CONFIG.uaeHighlightSize} h-${EARTH_CONFIG.uaeHighlightSize} bg-red-500/40 rounded-full blur-md z-10`}
                />
                
                {/* UAE pulse effect - creates a pulsing animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute top-1/3 right-1/4 w-${EARTH_CONFIG.uaeHighlightSize} h-${EARTH_CONFIG.uaeHighlightSize} bg-red-500/20 rounded-full blur-sm z-5`}
                />
              </div>
              
              {/* ============================================================================
                 CLOUD LAYER - Rotating cloud patterns for atmosphere
                 ============================================================================ */}
              <div className="absolute inset-0 rounded-full opacity-35">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full"
                >
                  {/* Cloud patterns - more realistic distribution */}
                  <div className="absolute top-1/4 left-1/3 w-7 h-4 bg-white/45 rounded-full blur-sm" />
                  <div className="absolute top-1/2 right-1/4 w-9 h-5 bg-white/35 rounded-full blur-sm" />
                  <div className="absolute bottom-1/3 left-1/4 w-6 h-3 bg-white/40 rounded-full blur-sm" />
                  <div className="absolute top-1/3 right-1/3 w-5 h-4 bg-white/30 rounded-full blur-sm" />
                  <div className="absolute top-1/5 right-1/5 w-4 h-2 bg-white/25 rounded-full blur-sm" />
                  <div className="absolute bottom-1/4 left-1/2 w-5 h-3 bg-white/35 rounded-full blur-sm" />
                  <div className="absolute top-2/3 right-1/6 w-6 h-3 bg-white/30 rounded-full blur-sm" />
                  <div className="absolute top-1/2 left-1/5 w-4 h-2 bg-white/25 rounded-full blur-sm" />
                </motion.div>
              </div>
              
              {/* ============================================================================
                 DESERT REGIONS - Overlay for desert areas (relevant to UAE)
                 ============================================================================ */}
              <div className="absolute inset-0 rounded-full opacity-20">
                <div className="absolute top-1/3 right-1/4 w-6 h-4 bg-yellow-400/40 rounded-full transform rotate-5" />
                <div className="absolute top-1/3 right-1/5 w-4 h-3 bg-yellow-400/35 rounded-full transform rotate-15" />
                <div className="absolute top-1/2 right-1/6 w-5 h-3 bg-yellow-400/30 rounded-full transform rotate-10" />
              </div>
            </div>
            
            {/* ============================================================================
               ATMOSPHERE EFFECTS - Multiple glow layers for realistic atmosphere
               ============================================================================ */}
            {/* Primary atmosphere glow - using brand colors */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/25 via-transparent to-green-400/25 animate-pulse" />
            {/* Secondary atmosphere glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-300/15 via-transparent to-blue-500/20" />
            {/* Tertiary atmosphere glow - brand color accent */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-300/10 via-transparent to-green-300/10" />
            
            {/* ============================================================================
               SPECULAR HIGHLIGHTS - Realistic light reflection
               ============================================================================ */}
            {/* Main specular highlight */}
            <div className="absolute top-1/4 left-1/4 w-10 h-10 bg-white/25 rounded-full blur-sm" />
            {/* Secondary specular highlight */}
            <div className="absolute top-1/5 left-1/5 w-6 h-6 bg-white/15 rounded-full blur-sm" />
            
            {/* ============================================================================
               TERMINATOR LINE - Day/night boundary with enhanced effect
               ============================================================================ */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-black/25 to-transparent"
            />
            
            {/* ============================================================================
               POLAR ICE CAPS - White ice caps at poles
               ============================================================================ */}
            {/* North pole ice cap */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-white/60 rounded-full blur-sm" />
            {/* South pole ice cap */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-white/50 rounded-full blur-sm" />
            
            {/* ============================================================================
               OCEAN DEPTH VARIATIONS - Different ocean depths for realism
               ============================================================================ */}
            <div className="absolute inset-0 rounded-full opacity-30">
              <div className="absolute top-1/3 left-1/4 w-8 h-6 bg-blue-600/40 rounded-full blur-sm" />
              <div className="absolute bottom-1/3 right-1/4 w-6 h-8 bg-blue-600/35 rounded-full blur-sm" />
              <div className="absolute top-1/2 left-1/2 w-10 h-7 bg-blue-600/30 rounded-full blur-sm" />
            </div>
          </div>
        </motion.div>

        {/* ============================================================================
           UI ELEMENTS - Text, progress bar, and decorative elements
           ============================================================================ */}

        {/* ============================================================================
           TRANSITION TEXT - Dynamic messages based on animation phase
           ============================================================================ */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
          animate={{
            opacity: phase === 'approach' ? 0 : 1,
            y: phase === 'approach' ? 20 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Main transition message - changes based on current phase */}
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={TEXT_CONFIG.mainTextClass}
          >
            {phase === 'zoom' && TEXT_CONFIG.messages.zoom}
            {phase === 'landing' && TEXT_CONFIG.messages.landing}
            {phase === 'complete' && TEXT_CONFIG.messages.complete}
          </motion.div>
          
          {/* Subtitle message - provides additional context */}
          <motion.div
            className={TEXT_CONFIG.subtitleClass}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {phase === 'zoom' && TEXT_CONFIG.subtitles.zoom}
            {phase === 'landing' && TEXT_CONFIG.subtitles.landing}
            {phase === 'complete' && TEXT_CONFIG.subtitles.complete}
          </motion.div>
        </motion.div>

        {/* ============================================================================
           PROGRESS INDICATOR - Visual progress bar showing animation completion
           ============================================================================ */}
        <motion.div
          className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-${PROGRESS_CONFIG.width}`}
          animate={{
            opacity: phase === 'approach' ? 0 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Status label */}
          <div className={`text-center mb-3 ${PROGRESS_CONFIG.labelClass}`}>
            {phase === 'zoom' && 'INITIALIZING'}
            {phase === 'landing' && 'CONNECTING'}
            {phase === 'complete' && 'READY'}
          </div>
          
          {/* Progress bar container */}
          <div className="relative">
            {/* Progress bar background */}
            <div className={`${PROGRESS_CONFIG.backgroundClass} rounded-full h-${PROGRESS_CONFIG.height} overflow-hidden border ${PROGRESS_CONFIG.borderClass}`}>
              {/* Animated progress fill */}
              <motion.div
                className={`h-full ${PROGRESS_CONFIG.fillClass} rounded-full relative`}
                initial={{ width: 0 }}
                animate={{
                  width: phase === 'zoom' ? '33%' : phase === 'landing' ? '66%' : '100%',
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                {/* Progress fill glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
            
            {/* Progress percentage - positioned absolutely */}
            <div className={`absolute -top-6 right-0 ${PROGRESS_CONFIG.percentageClass}`}>
              {phase === 'zoom' && '33%'}
              {phase === 'landing' && '66%'}
              {phase === 'complete' && '100%'}
            </div>
          </div>
          
          {/* Progress steps indicator */}
          <div className="flex justify-between mt-2">
            <div className={`w-1 h-1 rounded-full ${phase === 'approach' ? 'bg-white/30' : 'bg-white'}`} />
            <div className={`w-1 h-1 rounded-full ${phase === 'approach' || phase === 'zoom' ? 'bg-white/30' : 'bg-white'}`} />
            <div className={`w-1 h-1 rounded-full ${phase === 'complete' ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </motion.div>

        {/* ============================================================================
           CORNER DECORATIONS - Animated decorative elements in corners
           ============================================================================ */}
        {/* Top-left decoration: Fire icon with rotation animation */}
        <motion.div
          className={`absolute ${CORNER_DECORATIONS[0].position} ${CORNER_DECORATIONS[0].color} ${CORNER_DECORATIONS[0].size}`}
          animate={{
            rotate: [0, 360],
            scale: phase === 'complete' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity },
          }}
        >
          <img src={CORNER_DECORATIONS[0].icon} alt="Fire Icon" className="w-full h-full object-contain" />
        </motion.div>
        
        {/* Top-right decoration: Globe with scale animation */}
        <motion.div
          className={`absolute ${CORNER_DECORATIONS[1].position} ${CORNER_DECORATIONS[1].color} ${CORNER_DECORATIONS[1].size}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: phase === 'complete' ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {CORNER_DECORATIONS[1].icon}
        </motion.div>
        
        {/* Bottom-left decoration: Building with bounce animation */}
        <motion.div
          className={`absolute ${CORNER_DECORATIONS[2].position} ${CORNER_DECORATIONS[2].color} ${CORNER_DECORATIONS[2].size}`}
          animate={{
            y: [0, -10, 0],
            opacity: phase === 'complete' ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <img src={CORNER_DECORATIONS[2].icon} alt="Building Icon" className="w-full h-full object-contain" />
        </motion.div>
        
        {/* Bottom-right decoration: Alarm with shake animation */}
        <motion.div
          className={`absolute ${CORNER_DECORATIONS[3].position} ${CORNER_DECORATIONS[3].color} ${CORNER_DECORATIONS[3].size}`}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: phase === 'complete' ? [1, 1.3, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <img src={CORNER_DECORATIONS[3].icon} alt="Alarm Icon" className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 