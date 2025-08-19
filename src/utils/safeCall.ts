/**
 * Safely calls a function with error handling to prevent "apply" errors
 */
export function safeCall<T extends (...args: unknown[]) => unknown>(
  fn: T | undefined | null,
  ...args: Parameters<T>
): ReturnType<T> | null {
  try {
    if (typeof fn === 'function') {
      return fn(...args) as ReturnType<T>;
    }
    return null;
  } catch (error) {
    console.error('Error in safeCall:', error);
    return null;
  }
}

/**
 * Safely calls an async function with error handling
 */
export async function safeAsyncCall<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T | undefined | null,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>> | null> {
  try {
    if (typeof fn === 'function') {
      return (await fn(...args)) as Awaited<ReturnType<T>>;
    }
    return null;
  } catch (error) {
    console.error('Error in safeAsyncCall:', error);
    return null;
  }
}

/**
 * Safely wraps a callback function to prevent "apply" errors
 */
export function safeCallback<T extends (...args: unknown[]) => unknown>(
  callback: T | undefined | null
): T | (() => null) {
  if (typeof callback === 'function') {
    return ((...args: Parameters<T>) => {
      try {
        return callback(...args);
      } catch (error) {
        console.error('Error in safeCallback:', error);
        return null;
      }
    }) as T;
  }
  return (() => null) as T;
} 