import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

// Component that throws an "apply" error
const ThrowApplyError = () => {
  const obj: any = null;
  obj.someMethod(); // This will throw "Cannot read properties of null (reading 'apply')"
  return <div>This should not render</div>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Catching', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });

    test('catches and displays error UI when child throws error', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An error occurred while rendering this component.')).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
    });

    test('catches "apply" errors and dispatches forceWorkerFallback event', () => {
      const onError = jest.fn();
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      render(
        <ErrorBoundary onError={onError}>
          <ThrowApplyError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'forceWorkerFallback',
          detail: expect.any(Object)
        })
      );
    });

    test('catches "Cannot read properties of undefined" errors', () => {
      const onError = jest.fn();
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      // Create a component that throws this specific error
      const ThrowUndefinedError = () => {
        const obj: any = undefined;
        obj.someMethod(); // This will throw "Cannot read properties of undefined"
        return <div>This should not render</div>;
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowUndefinedError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'forceWorkerFallback',
          detail: expect.any(Object)
        })
      );
    });
  });

  describe('Error UI', () => {
    test('displays error message and description', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An error occurred while rendering this component.')).toBeInTheDocument();
    });

    test('displays retry button', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    test('displays report button', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report/i });
      expect(reportButton).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    test('retry button resets error state', () => {
      const onError = jest.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Re-render with no error
      rerender(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal component')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    test('report button calls onError callback', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report/i });
      fireEvent.click(reportButton);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Lifecycle', () => {
    test('calls onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('logs error to console in development', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple errors gracefully', () => {
      const onError = jest.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Try to render another error
      rerender(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('handles errors in error UI components', () => {
      const onError = jest.fn();

      // Create an error boundary with a problematic error UI
      const ProblematicErrorUI = () => {
        throw new Error('Error in error UI');
      };

      // Mock the error UI to throw
      const originalErrorUI = ErrorBoundary.prototype.render;
      ErrorBoundary.prototype.render = function() {
        if (this.state.hasError) {
          return <ProblematicErrorUI />;
        }
        return this.props.children;
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still handle the error gracefully
      expect(onError).toHaveBeenCalled();

      // Restore original render method
      ErrorBoundary.prototype.render = originalErrorUI;
    });

    test('handles null children', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          {null}
        </ErrorBoundary>
      );

      // Should not throw error
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    test('handles undefined children', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          {undefined}
        </ErrorBoundary>
      );

      // Should not throw error
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveAttribute('role', 'alert');
    });

    test('buttons have proper accessibility attributes', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      const reportButton = screen.getByRole('button', { name: /report/i });

      expect(retryButton).toBeInTheDocument();
      expect(reportButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('applies correct CSS classes', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveClass('error-boundary');
    });

    test('applies correct button styling', () => {
      render(
        <ErrorBoundary onError={jest.fn()}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      const reportButton = screen.getByRole('button', { name: /report/i });

      expect(retryButton).toHaveClass('btn', 'btn-primary');
      expect(reportButton).toHaveClass('btn', 'btn-secondary');
    });
  });
}); 