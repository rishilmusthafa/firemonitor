import { useQuery } from '@tanstack/react-query';
import type { Alert } from '@/types/alerts';

interface AlertsResponse {
  success: boolean;
  data: Alert[];
  count: number;
  todayAlerts: Alert[];
  todayCount: number;
  analysis: {
    totalVillas: number;
    totalAlerts: number;
    todayAlerts: number;
    orphanAlerts: number;
    cities: string[];
    emirates: string[];
  };
}

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      // Use external API only
      const response = await fetch('https://10.1.61.100/get-alerts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        // Check for nested data structures
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else if (data.items && Array.isArray(data.items)) {
          return data.items;
        } else if (data.results && Array.isArray(data.results)) {
          return data.results;
        } else {
          console.error('❌ useAlerts: No valid array found in response:', data);
          throw new Error('No valid array found in API response');
        }
      } else {
        console.error('❌ useAlerts: Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
    },
    staleTime: 0, // Data is immediately stale for real-time updates
    retry: 3, // Increase retry attempts for reliability
    refetchInterval: 10000, // 10 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on component mount
    select: (data: unknown) => {
      if (Array.isArray(data)) {
        return data as Alert[];
      }
      console.error('❌ useAlerts: Final data is not an array:', data);
      return [];
    }
  });
} 