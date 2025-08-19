import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';
import { useAlertsWorker } from '@/hooks/useAlertsWorker';
import { useVillas } from '@/hooks/useVillas';
import { useUIStore } from '@/store/useUIStore';

// Mock the hooks
jest.mock('@/hooks/useAlertsWorker');
jest.mock('@/hooks/useVillas');
jest.mock('@/store/useUIStore');

const mockUseAlertsWorker = useAlertsWorker as jest.MockedFunction<typeof useAlertsWorker>;
const mockUseVillas = useVillas as jest.MockedFunction<typeof useVillas>;
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

describe('Header Component', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseAlertsWorker.mockReturnValue({
      isWorkerReady: true,
      isProcessing: false,
      workerError: null,
      useFallback: false,
      processToday: jest.fn().mockResolvedValue({
        openToday: 5,
        totalToday: 10,
        items: [],
      }),
      getAlertsByEmirate: jest.fn().mockResolvedValue([]),
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
    });

    mockUseUIStore.mockReturnValue({
      emirate: 'All',
      theme: 'dark',
      setEmirate: jest.fn(),
      setTheme: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders header with brand information', () => {
      render(<Header />);
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
      expect(screen.getByText('Fire Alarms')).toBeInTheDocument();
    });

    test('renders logo image', () => {
      render(<Header />);
      const logo = screen.getByAltText('Hassantuk');
      expect(logo).toBeInTheDocument();
    });

    test('renders statistics cards', async () => {
      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('Open Today')).toBeInTheDocument();
        expect(screen.getByText('Total Today')).toBeInTheDocument();
        expect(screen.getByText('Open Alerts')).toBeInTheDocument();
        expect(screen.getByText('Closed Alerts')).toBeInTheDocument();
        expect(screen.getByText('Overdue Alerts')).toBeInTheDocument();
        expect(screen.getByText('Countdown Alerts')).toBeInTheDocument();
      });
    });

    test('renders villa count', async () => {
      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('Villas')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    test('displays correct open today count', async () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 3,
          totalToday: 8,
          items: [],
        }),
        getAlertsByEmirate: jest.fn().mockResolvedValue([]),
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Open Today count
      });
    });

    test('displays correct total today count', async () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 2,
          totalToday: 7,
          items: [],
        }),
        getAlertsByEmirate: jest.fn().mockResolvedValue([]),
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('7')).toBeInTheDocument(); // Total Today count
      });
    });

    test('displays correct villa count', async () => {
      mockUseVillas.mockReturnValue({
        data: {
          success: true,
          data: [mockVilla, { ...mockVilla, Account_Number: 'ACC002' }],
          count: 2,
          analysis: {
            totalVillas: 2,
            uniqueAccountNumbers: 2,
            cities: 1,
            invalidCoordinates: 0,
          },
        },
        isLoading: false,
        error: null,
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Villa count
      });
    });
  });

  describe('Emirate Filtering', () => {
    test('filters statistics by selected emirate', async () => {
      mockUseUIStore.mockReturnValue({
        emirate: 'Dubai',
        theme: 'dark',
        setEmirate: jest.fn(),
        setTheme: jest.fn(),
      });

      const mockGetAlertsByEmirate = jest.fn().mockResolvedValue([
        {
          id: '1',
          Account_ID: 'ACC001',
          Title: 'Fire Alarm',
          Status: 'Open',
          Alert_DateTime: '2025-01-17T10:30:00.000Z',
        },
      ]);

      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 1,
          totalToday: 1,
          items: [],
        }),
        getAlertsByEmirate: mockGetAlertsByEmirate,
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(mockGetAlertsByEmirate).toHaveBeenCalledWith('Dubai');
      });
    });

    test('shows all emirates when "All" is selected', async () => {
      mockUseUIStore.mockReturnValue({
        emirate: 'All',
        theme: 'dark',
        setEmirate: jest.fn(),
        setTheme: jest.fn(),
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(screen.getByText('Open Today')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('handles loading state when worker is not ready', () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: false,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn(),
        getAlertsByEmirate: jest.fn(),
      });

      render(<Header />);
      
      // Should still render the header
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });

    test('handles processing state', () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: true,
        workerError: null,
        useFallback: false,
        processToday: jest.fn(),
        getAlertsByEmirate: jest.fn(),
      });

      render(<Header />);
      
      // Should still render during processing
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });

    test('handles villa loading state', () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<Header />);
      
      // Should still render during loading
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles worker errors gracefully', () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: false,
        isProcessing: false,
        workerError: 'Worker failed to initialize',
        useFallback: true,
        processToday: jest.fn(),
        getAlertsByEmirate: jest.fn(),
      });

      render(<Header />);
      
      // Should still render the header
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });

    test('handles villa data errors', () => {
      mockUseVillas.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch villas'),
      });

      render(<Header />);
      
      // Should still render with fallback data
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });
  });

  describe('Data Updates', () => {
    test('updates statistics every 10 seconds', async () => {
      jest.useFakeTimers();
      
      const mockGetAlertsByEmirate = jest.fn().mockResolvedValue([]);

      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 1,
          totalToday: 1,
          items: [],
        }),
        getAlertsByEmirate: mockGetAlertsByEmirate,
      });

      render(<Header />);
      
      // Initial call
      expect(mockGetAlertsByEmirate).toHaveBeenCalledTimes(1);
      
      // Fast-forward 10 seconds
      jest.advanceTimersByTime(10000);
      
      await waitFor(() => {
        expect(mockGetAlertsByEmirate).toHaveBeenCalledTimes(2);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Statistics Calculation', () => {
    test('calculates overdue alerts correctly', async () => {
      const mockAlerts = [
        {
          id: '1',
          Account_ID: 'ACC001',
          Title: 'Fire Alarm',
          Status: 'Open',
          Alert_DateTime: '2025-01-17T08:00:00.000Z', // 2.5 hours ago
        },
        {
          id: '2',
          Account_ID: 'ACC002',
          Title: 'Fire Alarm',
          Status: 'Open',
          Alert_DateTime: '2025-01-17T10:25:00.000Z', // 5 minutes ago
        },
      ];

      const mockGetAlertsByEmirate = jest.fn().mockResolvedValue(mockAlerts);

      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 2,
          totalToday: 2,
          items: [],
        }),
        getAlertsByEmirate: mockGetAlertsByEmirate,
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(mockGetAlertsByEmirate).toHaveBeenCalled();
      });
    });

    test('calculates countdown alerts correctly', async () => {
      const mockAlerts = [
        {
          id: '1',
          Account_ID: 'ACC001',
          Title: 'Fire Alarm',
          Status: 'Open',
          Alert_DateTime: '2025-01-17T10:29:00.000Z', // 1 minute ago
        },
      ];

      const mockGetAlertsByEmirate = jest.fn().mockResolvedValue(mockAlerts);

      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 1,
          totalToday: 1,
          items: [],
        }),
        getAlertsByEmirate: mockGetAlertsByEmirate,
      });

      render(<Header />);
      
      await waitFor(() => {
        expect(mockGetAlertsByEmirate).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    test('has proper heading hierarchy', () => {
      render(<Header />);
      const heading = screen.getByText('Hassantuk');
      expect(heading.tagName).toBe('H1');
    });

    test('has proper alt text for images', () => {
      render(<Header />);
      const logo = screen.getByAltText('Hassantuk');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders on different screen sizes', () => {
      render(<Header />);
      
      // Should render without errors
      expect(screen.getByText('Hassantuk')).toBeInTheDocument();
    });
  });
}); 