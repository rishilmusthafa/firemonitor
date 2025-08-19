'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { motion } from 'framer-motion';
import { useMapStore } from '@/store/useMapStore';

export default function ZoomLevel() {
  const [zoomLevel, setZoomLevel] = useState<string>('Loading...');
  const { cameraHeight } = useMapStore();

  useEffect(() => {
    if (cameraHeight > 0) {
      // Convert camera height to a more readable format
      let displayText: string;
      let zoomType: string;

      if (cameraHeight >= 1000000) {
        // Above 1000km - show in thousands of km
        displayText = `${Math.round(cameraHeight / 1000)}k`;
        zoomType = 'km';
      } else if (cameraHeight >= 1000) {
        // Above 1km - show in km
        displayText = `${Math.round(cameraHeight)}`;
        zoomType = 'km';
      } else {
        // Below 1km - show in meters
        displayText = `${Math.round(cameraHeight)}`;
        zoomType = 'm';
      }

      setZoomLevel(`${displayText} ${zoomType}`);
    }
  }, [cameraHeight]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute top-40 right-4 z-40"
    >
      <Card className="bg-background/80 backdrop-blur-sm border border-secondary/20 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="text-lg">🔍</div>
            <div className="flex flex-col">
              <div className="text-xs text-textSecondary">Zoom Level</div>
                                        <div className="text-sm font-bold text-white">{zoomLevel}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 