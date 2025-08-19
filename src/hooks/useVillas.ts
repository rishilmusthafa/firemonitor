import { useQuery } from '@tanstack/react-query';
import type { NormalizedVilla } from '@/types/villas';

interface VillasResponse {
  success: boolean;
  data: NormalizedVilla[];
  count: number;
  analysis: {
    totalVillas: number;
    uniqueAccountNumbers: number;
    cities: number;
    invalidCoordinates: number;
  };
}

export function useVillas() {
  return useQuery<VillasResponse>({
    queryKey: ['villas'],
    queryFn: async () => {
      const response = await fetch('/api/v1/villas');
      if (!response.ok) {
        throw new Error('Failed to fetch villas');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - villas don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 3,
    refetchOnWindowFocus: false, // Don't refetch villas on window focus
  });
} 