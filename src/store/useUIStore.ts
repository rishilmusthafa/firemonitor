import { create } from 'zustand';
import { ProcessedAlert } from '@/types/alerts';

export type Emirate = 'All' | 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';

interface UIState {
  emirate: Emirate;
  setEmirate: (emirate: Emirate) => void;
  // New alert notification overlay state
  newAlertNotification: ProcessedAlert | null;
  showNewAlertOverlay: boolean;
  alertQueue: ProcessedAlert[]; // Queue for multiple alerts
  setNewAlertNotification: (alert: ProcessedAlert | null) => void;
  setShowNewAlertOverlay: (show: boolean) => void;
  addToAlertQueue: (alerts: ProcessedAlert[]) => void;
  removeFromAlertQueue: (alertId: string) => void;
  clearAlertQueue: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  emirate: 'All',
  setEmirate: (emirate: Emirate) => set({ emirate }),
  // New alert notification overlay state
  newAlertNotification: null,
  showNewAlertOverlay: false,
  alertQueue: [],
  setNewAlertNotification: (alert: ProcessedAlert | null) => set({ newAlertNotification: alert }),
  setShowNewAlertOverlay: (show: boolean) => set({ showNewAlertOverlay: show }),
  addToAlertQueue: (alerts: ProcessedAlert[]) => {
    const { alertQueue, showNewAlertOverlay, newAlertNotification } = get();
    
    // Add new alerts to queue
    const updatedQueue = [...alertQueue, ...alerts];
    set({ alertQueue: updatedQueue });
    
    // If no overlay is currently showing, show the first alert
    if (!showNewAlertOverlay && !newAlertNotification && updatedQueue.length > 0) {
      const firstAlert = updatedQueue[0];
      set({ 
        newAlertNotification: firstAlert,
        showNewAlertOverlay: true 
      });
    }
  },
  removeFromAlertQueue: (alertId: string) => {
    const { alertQueue, newAlertNotification } = get();
    
    // Remove the alert from queue
    const updatedQueue = alertQueue.filter(alert => alert.id !== alertId);
    set({ alertQueue: updatedQueue });
    
    // If we just finished showing an alert and there are more in queue, show the next one
    if (newAlertNotification?.id === alertId) {
      if (updatedQueue.length > 0) {
        // Show the next alert in queue
        const nextAlert = updatedQueue[0];
        set({ 
          newAlertNotification: nextAlert,
          showNewAlertOverlay: true 
        });
      } else {
        // No more alerts in queue, hide overlay
        set({ 
          newAlertNotification: null,
          showNewAlertOverlay: false 
        });
      }
    }
  },
  clearAlertQueue: () => set({ alertQueue: [] }),
})); 