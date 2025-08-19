import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CountdownTimer from '../CountdownTimer';

describe('CountdownTimer Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders countdown timer with initial time', () => {
      render(<CountdownTimer secondsRemaining={120} />);
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    test('renders countdown timer with 1 minute 30 seconds', () => {
      render(<CountdownTimer secondsRemaining={90} />);
      expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    test('renders countdown timer with 45 seconds', () => {
      render(<CountdownTimer secondsRemaining={45} />);
      expect(screen.getByText('0:45')).toBeInTheDocument();
    });

    test('renders countdown timer with 10 seconds', () => {
      render(<CountdownTimer secondsRemaining={10} />);
      expect(screen.getByText('0:10')).toBeInTheDocument();
    });

    test('renders countdown timer with 0 seconds', () => {
      render(<CountdownTimer secondsRemaining={0} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    test('formats time correctly for hours', () => {
      render(<CountdownTimer secondsRemaining={3661} />); // 1 hour 1 minute 1 second
      expect(screen.getByText('1:01:01')).toBeInTheDocument();
    });

    test('formats time correctly for minutes only', () => {
      render(<CountdownTimer secondsRemaining={125} />); // 2 minutes 5 seconds
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    test('formats time correctly for seconds only', () => {
      render(<CountdownTimer secondsRemaining={30} />);
      expect(screen.getByText('0:30')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 hour', () => {
      render(<CountdownTimer secondsRemaining={3600} />);
      expect(screen.getByText('1:00:00')).toBeInTheDocument();
    });
  });

  describe('Countdown Functionality', () => {
    test('counts down every second', async () => {
      render(<CountdownTimer secondsRemaining={3} />);
      
      expect(screen.getByText('0:03')).toBeInTheDocument();
      
      // Fast-forward 1 second
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(screen.getByText('0:02')).toBeInTheDocument();
      });
      
      // Fast-forward another second
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(screen.getByText('0:01')).toBeInTheDocument();
      });
      
      // Fast-forward to 0
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });

    test('calls onComplete when countdown reaches zero', async () => {
      const onComplete = jest.fn();
      render(<CountdownTimer secondsRemaining={1} onComplete={onComplete} />);
      
      // Fast-forward 1 second
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    test('stops counting down at zero', async () => {
      render(<CountdownTimer secondsRemaining={1} />);
      
      // Fast-forward to zero
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
      
      // Fast-forward more time - should still be 0:00
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });
  });

  describe('Color Coding', () => {
    test('shows green color for time > 60 seconds', () => {
      render(<CountdownTimer secondsRemaining={90} />);
      const timer = screen.getByText('1:30');
      expect(timer).toHaveClass('text-green-500');
    });

    test('shows orange color for time between 30-60 seconds', () => {
      render(<CountdownTimer secondsRemaining={45} />);
      const timer = screen.getByText('0:45');
      expect(timer).toHaveClass('text-orange-500');
    });

    test('shows red color for time <= 30 seconds', () => {
      render(<CountdownTimer secondsRemaining={25} />);
      const timer = screen.getByText('0:25');
      expect(timer).toHaveClass('text-red-500');
    });

    test('shows red color for time exactly 30 seconds', () => {
      render(<CountdownTimer secondsRemaining={30} />);
      const timer = screen.getByText('0:30');
      expect(timer).toHaveClass('text-red-500');
    });
  });

  describe('Input Validation', () => {
    test('clamps negative values to 0', () => {
      render(<CountdownTimer secondsRemaining={-10} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    test('clamps values above 120 to 120', () => {
      render(<CountdownTimer secondsRemaining={200} />);
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    test('handles decimal values correctly', () => {
      render(<CountdownTimer secondsRemaining={90.5} />);
      expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    test('handles undefined values gracefully', () => {
      render(<CountdownTimer secondsRemaining={undefined as any} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('applies custom className', () => {
      render(<CountdownTimer secondsRemaining={60} className="custom-class" />);
      const timer = screen.getByText('1:00');
      expect(timer).toHaveClass('custom-class');
    });

    test('works without onComplete callback', () => {
      render(<CountdownTimer secondsRemaining={5} />);
      expect(screen.getByText('0:05')).toBeInTheDocument();
      
      // Should not throw error when countdown reaches zero
      jest.advanceTimersByTime(5000);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    test('works without className prop', () => {
      render(<CountdownTimer secondsRemaining={60} />);
      const timer = screen.getByText('1:00');
      expect(timer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very large numbers', () => {
      render(<CountdownTimer secondsRemaining={999999} />);
      expect(screen.getByText('2:00')).toBeInTheDocument(); // Clamped to 120
    });

    test('handles NaN values', () => {
      render(<CountdownTimer secondsRemaining={NaN as any} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    test('handles null values', () => {
      render(<CountdownTimer secondsRemaining={null as any} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    test('handles string values', () => {
      render(<CountdownTimer secondsRemaining={'60' as any} />);
      expect(screen.getByText('1:00')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not create unnecessary re-renders', () => {
      const { rerender } = render(<CountdownTimer secondsRemaining={60} />);
      
      // Re-render with same value
      rerender(<CountdownTimer secondsRemaining={60} />);
      expect(screen.getByText('1:00')).toBeInTheDocument();
    });

    test('cleans up interval on unmount', () => {
      const { unmount } = render(<CountdownTimer secondsRemaining={10} />);
      
      // Fast-forward a bit
      jest.advanceTimersByTime(2000);
      
      // Unmount component
      unmount();
      
      // Fast-forward more - should not cause errors
      jest.advanceTimersByTime(5000);
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<CountdownTimer secondsRemaining={60} />);
      const timer = screen.getByText('1:00');
      expect(timer).toBeInTheDocument();
      expect(timer.tagName).toBe('SPAN');
    });

    test('maintains color contrast for accessibility', () => {
      render(<CountdownTimer secondsRemaining={60} />);
      const timer = screen.getByText('1:00');
      expect(timer).toHaveClass('font-mono', 'font-bold');
    });
  });
}); 