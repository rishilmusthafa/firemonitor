import { create } from 'zustand';

interface ViewportBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

interface FlyToLocation {
  longitude: number;
  latitude: number;
  height: number;
  duration?: number;
}

interface MapState {
  viewportBounds: ViewportBounds | null;
  cameraHeight: number;
  setViewportBounds: (bounds: ViewportBounds | null) => void;
  setCameraHeight: (height: number) => void;
  flyToLocation: (location: FlyToLocation) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  viewportBounds: null,
  cameraHeight: 0,
  setViewportBounds: (bounds: ViewportBounds | null) => set({ viewportBounds: bounds }),
  setCameraHeight: (height) => set({ cameraHeight: height }),
  flyToLocation: (location) => {
    // This will be called by components that need to fly to a location
    // The actual flying logic will be handled in MapView component
    const newViewportBounds = {
      west: location.longitude - 0.01,
      east: location.longitude + 0.01,
      south: location.latitude - 0.01,
      north: location.latitude + 0.01,
    };
    
    set({ 
      viewportBounds: newViewportBounds,
      cameraHeight: location.height 
    });
  },
})); 