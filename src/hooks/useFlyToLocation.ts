'use client';

import { useCallback } from 'react';
import { useMapStore } from '@/store/useMapStore';

export function useFlyToLocation() {
  const flyToLocation = useCallback((location: {
    longitude: number;
    latitude: number;
    height: number;
    duration?: number;
  }) => {
    // Update the store with the new location
    useMapStore.getState().flyToLocation(location);
  }, []);

  return { flyToLocation };
} 