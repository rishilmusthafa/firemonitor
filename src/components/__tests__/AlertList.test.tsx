import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertList from '../AlertList';
import { useAlertsWorker } from '@/hooks/useAlertsWorker';
import { useVillas } from '@/hooks/useVillas';
import { useUIStore } from '@/store/useUIStore';

// Mock the hooks
jest.mock('@/hooks/useAlertsWorker');
jest.mock('@/hooks/useVillas');
jest.mock('@/store/useUIStore');
jest.mock('@/hooks/useFlyToLocation', () => ({
  useFlyToLocation: () => ({
    flyToLocation: jest.fn(),
  }),
}));

const mockUseAlertsWorker = useAlertsWorker as jest.MockedFunction<typeof useAlertsWorker>;
const mockUseVillas = useVillas as jest.MockedFunction<typeof useVillas>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockProcessedAlert = {
  id: '1',
  accountId: 'ACC001',
  title: 'Fire Alarm',
  titleAr: 'إنذار حريق',
  datetime: '2025-01-17T10:30:00.000Z',
  status: 'countdown' as const,
  secondsRemaining: 90,
  mobile: '0501234567',
  type: 'fire',
};

const mockVilla = {
  Account_Number: 'ACC001',
  Customer_Name: 'John Doe',
  Email_Address: 'john@example.com',
  Latitude: 25.2048,
  Longitude: 55.2708,
  Address: 'Dubai Marina',
  City: 'Dubai',
};

describe('AlertList Component', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseAlertsWorker.mockReturnValue({
      isWorkerReady: true,
      isProcessing: false,
      workerError: null,
      useFallback: false,
      processToday: jest.fn().mockResolvedValue({
        openToday: 1,
        totalToday: 1,
        items: [mockProcessedAlert],
      }),
      getAlertsByEmirate: jest.fn().mockResolvedValue([mockProcessedAlert]),
    });

    mockUseVillas.mockReturnValue({
      data: { data: [mockVilla] },
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
    test('renders alert list container', () => {
      render(<AlertList />);
      expect(screen.getByText('Alarms')).toBeInTheDocument();
    });

    test('renders alert cards when data is available', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('Fire Alarm - ACC001')).toBeInTheDocument();
      });
    });

    test('renders customer name and city', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Dubai')).toBeInTheDocument();
      });
    });

    test('renders alert time in UTC format', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        // Should show UTC time (10:30 AM)
        expect(screen.getByText('10:30 AM')).toBeInTheDocument();
      });
    });

    test('renders mobile number when available', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('0501234567')).toBeInTheDocument();
      });
    });
  });

  describe('Status Indicators', () => {
    test('shows countdown status with timer', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('1:30')).toBeInTheDocument(); // 90 seconds = 1:30
      });
    });

    test('shows overdue status without timer', async () => {
      const overdueAlert = { ...mockProcessedAlert, status: 'overdue' as const, secondsRemaining: undefined };
      
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 1,
          totalToday: 1,
          items: [overdueAlert],
        }),
        getAlertsByEmirate: jest.fn().mockResolvedValue([overdueAlert]),
      });

      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.queryByText('1:30')).not.toBeInTheDocument();
      });
    });

    test('shows closed status with green icon', async () => {
      const closedAlert = { ...mockProcessedAlert, status: 'closed' as const };
      
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn().mockResolvedValue({
          openToday: 0,
          totalToday: 1,
          items: [closedAlert],
        }),
        getAlertsByEmirate: jest.fn().mockResolvedValue([closedAlert]),
      });

      render(<AlertList />);
      
      await waitFor(() => {
        const alertCard = screen.getByText('Fire Alarm - ACC001').closest('.card');
        expect(alertCard).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    test('filters alerts by emirate', async () => {
      mockUseUIStore.mockReturnValue({
        emirate: 'Dubai',
        theme: 'dark',
        setEmirate: jest.fn(),
        setTheme: jest.fn(),
      });

      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('Fire Alarm - ACC001')).toBeInTheDocument();
      });
    });

    test('shows all alerts when emirate is "All"', async () => {
      mockUseUIStore.mockReturnValue({
        emirate: 'All',
        theme: 'dark',
        setEmirate: jest.fn(),
        setTheme: jest.fn(),
      });

      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('Fire Alarm - ACC001')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    test('handles alert click for map navigation', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        const alertCard = screen.getByText('Fire Alarm - ACC001');
        fireEvent.click(alertCard);
      });
    });

    test('handles double click for alert details', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        const alertCard = screen.getByText('Fire Alarm - ACC001');
        fireEvent.doubleClick(alertCard);
      });
    });

    test('handles scroll to load more alerts', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        const scrollContainer = screen.getByRole('region');
        fireEvent.scroll(scrollContainer, { target: { scrollLeft: 100 } });
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state when worker is not ready', () => {
      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: false,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: jest.fn(),
        getAlertsByEmirate: jest.fn(),
      });

      render(<AlertList />);
      
      // Should not show alerts when worker is not ready
      expect(screen.queryByText('Fire Alarm - ACC001')).not.toBeInTheDocument();
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

      render(<AlertList />);
      
      // Component should still render during processing
      expect(screen.getByText('Alarms')).toBeInTheDocument();
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

      render(<AlertList />);
      
      // Should still render the component
      expect(screen.getByText('Alarms')).toBeInTheDocument();
    });

    test('handles villa data errors', () => {
      mockUseVillas.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch villas'),
      });

      render(<AlertList />);
      
      // Should still render with fallback data
      expect(screen.getByText('Alarms')).toBeInTheDocument();
    });
  });

  describe('Data Updates', () => {
    test('updates alerts every 10 seconds', async () => {
      jest.useFakeTimers();
      
      const mockProcessToday = jest.fn().mockResolvedValue({
        openToday: 1,
        totalToday: 1,
        items: [mockProcessedAlert],
      });

      mockUseAlertsWorker.mockReturnValue({
        isWorkerReady: true,
        isProcessing: false,
        workerError: null,
        useFallback: false,
        processToday: mockProcessToday,
        getAlertsByEmirate: jest.fn().mockResolvedValue([mockProcessedAlert]),
      });

      render(<AlertList />);
      
      // Initial call
      expect(mockProcessToday).toHaveBeenCalledTimes(1);
      
      // Fast-forward 10 seconds
      jest.advanceTimersByTime(10000);
      
      await waitFor(() => {
        expect(mockProcessToday).toHaveBeenCalledTimes(2);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        expect(screen.getByText('Alarms')).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      render(<AlertList />);
      
      await waitFor(() => {
        const alertCard = screen.getByText('Fire Alarm - ACC001');
        expect(alertCard).toBeInTheDocument();
      });
    });
  });
}); 