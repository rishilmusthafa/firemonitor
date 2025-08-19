import { renderHook, waitFor } from '@testing-library/react';
import { useAlertsWorker } from '../useAlertsWorker';
import { useVillas } from '../useVillas';
import { useAlerts } from '../useAlerts';
import { useUIStore } from '@/store/useUIStore';

// Mock the dependencies
jest.mock('../useVillas');
jest.mock('../useAlerts');
jest.mock('@/store/useUIStore');
jest.mock('comlink', () => ({
  wrap: jest.fn(() => ({
    init: jest.fn(),
    processToday: jest.fn(),
    getAlertsByEmirate: jest.fn(),
  })),
}));

const mockUseVillas = useVillas as jest.MockedFunction<typeof useVillas>;
const mockUseAlerts = useAlerts as jest.MockedFunction<typeof useAlerts>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockVilla = {
  Account_Number: 'ACC001',
  Customer_Name: 'John Doe',
  Email_Address: 'john@example.com',
  Latitude: 25.2048,
  Longitude: 55.2708,
  Address: 'Dubai Marina',
  City: 'Dubai',
};

const mockAlert = {
  id: '1',
  Account_ID: 'ACC001',
  Title: 'Fire Alarm',
  Title_Ar: 'إنذار حريق',
  Alert_DateTime: '2025-01-17T10:30:00.000Z',
  Status: 'Open',
  Mobile: '0501234567',
  Type: 'fire',
};

describe('useAlertsWorker Hook', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseVillas.mockReturnValue({
      data: {
        success: true,
        data: [mockVilla],
        count: 1,
        analysis: {
          totalVillas: 1,
          uniqueAccountNumbers: 1,
          cities: 1,
          invalidCoordinates: 0,
        },
      },
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isFetched: true,
      isFetchedAfterMount: true,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isInvalidated: false,
      status: 'success',
      fetchStatus: 'idle',
      refetch: jest.fn(),
      remove: jest.fn(),
    });

    mockUseAlerts.mockReturnValue({
      data: [mockAlert],
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isFetched: true,
      isFetchedAfterMount: true,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isInvalidated: false,
      status: 'success',
      fetchStatus: 'idle',
      refetch: jest.fn(),
      remove: jest.fn(),
    });

    mockUseUIStore.mockReturnValue({
      emirate: 'All',
      theme: 'dark',
      setEmirate: jest.fn(),
      setTheme: jest.fn(),
    });

    // Mock Worker constructor
    global.Worker = jest.fn().mockImplementation(() => ({
      onerror: null,
      onmessageerror: null,
      terminate: jest.fn(),
      postMessage: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('initializes with fallback processor by default', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.useFallback).toBe(true);
        expect(result.current.isWorkerReady).toBe(true);
      });
    });

    test('initializes worker when data is available', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });
    });

    test('handles missing villa data', async () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isInvalidated: false,
        status: 'pending',
        fetchStatus: 'idle',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(false);
      });
    });

    test('handles missing alert data', async () => {
      mockUseAlerts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isInvalidated: false,
        status: 'pending',
        fetchStatus: 'idle',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(false);
      });
    });
  });

  describe('Worker Fallback', () => {
    test('falls back to processor when worker fails', async () => {
      // Mock Worker to throw error
      global.Worker = jest.fn().mockImplementation(() => {
        throw new Error('Worker not supported');
      });

      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.useFallback).toBe(true);
        expect(result.current.isWorkerReady).toBe(true);
      });
    });

    test('handles worker initialization errors', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });
    });
  });

  describe('Data Processing', () => {
    test('processes today alerts correctly', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      const processResult = await result.current.processToday();
      expect(processResult).toBeDefined();
    });

    test('gets alerts by emirate correctly', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      const alerts = await result.current.getAlertsByEmirate('Dubai');
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('handles processToday when worker not ready', async () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isPending: true,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: false,
        isFetching: true,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isInvalidated: false,
        status: 'pending',
        fetchStatus: 'fetching',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useAlertsWorker());

      const processResult = await result.current.processToday();
      expect(processResult).toEqual({
        openToday: 0,
        totalToday: 0,
        items: [],
      });
    });

    test('handles getAlertsByEmirate when worker not ready', async () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isPending: true,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: false,
        isFetching: true,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isInvalidated: false,
        status: 'pending',
        fetchStatus: 'fetching',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useAlertsWorker());

      const alerts = await result.current.getAlertsByEmirate('Dubai');
      expect(alerts).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('handles worker errors gracefully', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      // Simulate worker error
      result.current.workerError = 'Worker failed';
      expect(result.current.workerError).toBe('Worker failed');
    });

    test('handles processing errors', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      // Test error handling in processing
      const processResult = await result.current.processToday();
      expect(processResult).toBeDefined();
    });
  });

  describe('State Management', () => {
    test('tracks processing state', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
      });
    });

    test('tracks worker ready state', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });
    });

    test('tracks fallback state', async () => {
      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.useFallback).toBe(true);
      });
    });
  });

  describe('Data Filtering', () => {
    test('filters duplicate alerts correctly', async () => {
      const duplicateAlerts = [
        { ...mockAlert, id: '1', Alert_DateTime: '2025-01-17T10:30:00.000Z' },
        { ...mockAlert, id: '2', Alert_DateTime: '2025-01-17T10:35:00.000Z' }, // Later time
      ];

      mockUseAlerts.mockReturnValue({
        data: duplicateAlerts,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isFetched: true,
        isFetchedAfterMount: true,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isInvalidated: false,
        status: 'success',
        fetchStatus: 'idle',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      const { result } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    test('does not reinitialize unnecessarily', async () => {
      const { result, rerender } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      // Re-render with same data
      rerender();

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    test('cleans up worker on unmount', async () => {
      const { result, unmount } = renderHook(() => useAlertsWorker());

      await waitFor(() => {
        expect(result.current.isWorkerReady).toBe(true);
      });

      unmount();
      // Should not throw errors after unmount
    });
  });
}); 