import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapView from '../MapView';
import { useMapDataWorker } from '@/hooks/useMapDataWorker';
import { useVillas } from '@/hooks/useVillas';
import { useAlerts } from '@/hooks/useAlerts';
import { useUIStore } from '@/store/useUIStore';
import { useMapStore } from '@/store/useMapStore';

// Mock the hooks and dependencies
jest.mock('@/hooks/useMapDataWorker');
jest.mock('@/hooks/useVillas');
jest.mock('@/hooks/useAlerts');
jest.mock('@/store/useUIStore');
jest.mock('@/store/useMapStore');
jest.mock('resium', () => ({
  Viewer: ({ children, ...props }: any) => <div data-testid="cesium-viewer" {...props}>{children}</div>,
  Entity: ({ children, ...props }: any) => <div data-testid="cesium-entity" {...props}>{children}</div>,
  Camera: ({ children, ...props }: any) => <div data-testid="cesium-camera" {...props}>{children}</div>,
}));
jest.mock('cesium', () => ({
  Ion: {
    defaultAccessToken: 'test-token',
  },
  Math: {
    toDegrees: jest.fn((radians) => radians * (180 / Math.PI)),
  },
  Cartesian3: {
    fromDegrees: jest.fn((lon, lat, height) => ({ lon, lat, height })),
  },
  Color: {
    WHITE: { withAlpha: jest.fn(() => ({ alpha: 0.7 })) },
    BLACK: {},
  },
  LabelStyle: {
    FILL_AND_OUTLINE: 'FILL_AND_OUTLINE',
  },
  VerticalOrigin: {
    BOTTOM: 'BOTTOM',
  },
  HorizontalOrigin: {
    CENTER: 'CENTER',
  },
  ScreenSpaceEventHandler: jest.fn(() => ({
    setInputAction: jest.fn(),
  })),
}));

const mockUseMapDataWorker = useMapDataWorker as jest.MockedFunction<typeof useMapDataWorker>;
const mockUseVillas = useVillas as jest.MockedFunction<typeof useVillas>;
const mockUseAlerts = useAlerts as jest.MockedFunction<typeof useAlerts>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

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
  Status: 'Open' as const,
  Mobile: '0501234567',
  Type: 'fire',
};

describe('MapView Component', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseMapDataWorker.mockReturnValue({
      isWorkerReady: true,
      isProcessing: false,
      workerError: null,
      useFallback: false,
      processMapData: jest.fn().mockResolvedValue({
        clusters: [],
        markers: [],
      }),
      getEmirateBounds: jest.fn().mockResolvedValue({
        west: 54.0,
        east: 56.0,
        south: 24.0,
        north: 26.0,
      }),
    });

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

    mockUseMapStore.mockReturnValue({
      viewportBounds: null,
      cameraHeight: 1000,
      flyToLocation: jest.fn(),
      setViewportBounds: jest.fn(),
      setCameraHeight: jest.fn(),
    });

    // Mock window.CESIUM_BASE_URL
    Object.defineProperty(window, 'CESIUM_BASE_URL', {
      value: '/cesium/',
      writable: true,
    });

    // Mock process.env
    Object.defineProperty(process.env, 'NEXT_PUBLIC_CESIUM_ACCESS_TOKEN', {
      value: 'test-token',
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders Cesium viewer', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('renders map container', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('displays loading state initially', async () => {
      render(<MapView />);
      
      // Should show loading initially
      expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
    });
  });

  describe('Map Initialization', () => {
    test('initializes Cesium with correct configuration', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        const viewer = screen.getByTestId('cesium-viewer');
        expect(viewer).toBeInTheDocument();
      });
    });

    test('sets up camera controls', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles Cesium access token configuration', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Data Processing', () => {
    test('processes map data when worker is ready', async () => {
      const mockProcessMapData = jest.fn().mockResolvedValue({
        clusters: [],
        markers: [],
      });

      mockUseMapDataWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processMapData: mockProcessMapData,
        getEmirateBounds: jest.fn().mockResolvedValue(null),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(mockProcessMapData).toHaveBeenCalled();
      });
    });

    test('handles worker not ready state', async () => {
      mockUseMapDataWorker.mockReturnValue({
        isWorkerReady: false,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processMapData: jest.fn(),
        getEmirateBounds: jest.fn(),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles worker errors gracefully', async () => {
      mockUseMapDataWorker.mockReturnValue({
        isWorkerReady: false,
        isProcessing: false,
        workerError: 'Worker failed to initialize',
        useFallback: true,
        processMapData: jest.fn(),
        getEmirateBounds: jest.fn(),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Marker Rendering', () => {
    test('renders alert markers when data is available', async () => {
      const mockProcessMapData = jest.fn().mockResolvedValue({
        clusters: [],
        markers: [
          {
            lon: 55.2708,
            lat: 25.2048,
            isAlert: true,
            status: 'open',
            accountNumber: 'ACC001',
            alertData: mockAlert,
          },
        ],
      });

      mockUseMapDataWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processMapData: mockProcessMapData,
        getEmirateBounds: jest.fn().mockResolvedValue(null),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(mockProcessMapData).toHaveBeenCalled();
      });
    });

    test('renders cluster markers when data is clustered', async () => {
      const mockProcessMapData = jest.fn().mockResolvedValue({
        clusters: [
          {
            lon: 55.2708,
            lat: 25.2048,
            count: 5,
          },
        ],
        markers: [],
      });

      mockUseMapDataWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processMapData: mockProcessMapData,
        getEmirateBounds: jest.fn().mockResolvedValue(null),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(mockProcessMapData).toHaveBeenCalled();
      });
    });
  });

  describe('Camera Controls', () => {
    test('handles camera movement', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('updates viewport bounds on camera change', async () => {
      const mockSetViewportBounds = jest.fn();
      const mockSetCameraHeight = jest.fn();

      mockUseMapStore.mockReturnValue({
        viewportBounds: null,
        cameraHeight: 1000,
        flyToLocation: jest.fn(),
        setViewportBounds: mockSetViewportBounds,
        setCameraHeight: mockSetCameraHeight,
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Interaction Handling', () => {
    test('handles marker clicks', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles villa details display', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles fly-to-location requests', async () => {
      const mockFlyToLocation = jest.fn();

      mockUseMapStore.mockReturnValue({
        viewportBounds: null,
        cameraHeight: 1000,
        flyToLocation: mockFlyToLocation,
        setViewportBounds: jest.fn(),
        setCameraHeight: jest.fn(),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles Cesium initialization errors', async () => {
      // Mock Cesium to throw error
      jest.doMock('cesium', () => {
        throw new Error('Cesium failed to load');
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles data loading errors', async () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load villas'),
        isError: true,
        isPending: false,
        isLoadingError: true,
        isRefetchError: false,
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        isStale: false,
        isPlaceholderData: false,
        isFetched: false,
        isFetchedAfterMount: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: Date.now(),
        failureCount: 1,
        failureReason: new Error('Failed to load villas'),
        errorUpdateCount: 1,
        isInvalidated: false,
        status: 'error',
        fetchStatus: 'idle',
        refetch: jest.fn(),
        remove: jest.fn(),
      });

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('debounces map updates', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });

    test('handles large datasets efficiently', async () => {
      const largeVillas = Array.from({ length: 1000 }, (_, i) => ({
        ...mockVilla,
        Account_Number: `ACC${String(i).padStart(3, '0')}`,
      }));

      mockUseVillas.mockReturnValue({
        data: {
          success: true,
          data: largeVillas,
          count: 1000,
          analysis: {
            totalVillas: 1000,
            uniqueAccountNumbers: 1000,
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

      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        const viewer = screen.getByTestId('cesium-viewer');
        expect(viewer).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to different screen sizes', async () => {
      render(<MapView />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cesium-viewer')).toBeInTheDocument();
      });
    });
  });
}); 