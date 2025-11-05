import { useEffect, useRef } from 'react';

/**
 * Optimized useEffect that uses requestIdleCallback to defer non-critical work
 * Helps prevent "Forced reflow" violations during page transitions
 */
export function useIdleEffect(effect: () => void | (() => void), deps: any[]) {
  const cleanupRef = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') {
      cleanupRef.current = effect();
      return cleanupRef.current;
    }

    // Helpers: safe wrappers around requestIdleCallback / cancelIdleCallback
    // Some browsers (or embedded webviews) don't implement these APIs and
    // calling them directly can throw a ReferenceError. Use fallbacks that
    // map to setTimeout/clearTimeout so the effect still runs.
    const runIdle = (cb: () => void, options?: { timeout?: number }) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        // @ts-ignore - some TS libs may not include requestIdleCallback
        return (window as any).requestIdleCallback(cb, options);
      }
      // fallback to a normal timer
      return globalThis.setTimeout(cb, options?.timeout ?? 0);
    };

    const cancelIdle = (handle: any) => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        // @ts-ignore
        return (window as any).cancelIdleCallback(handle);
      }
      return globalThis.clearTimeout(handle);
    };

    // Schedule the effect on an idle callback where possible
    const handle = runIdle(() => {
      cleanupRef.current = effect();
    }, { timeout: 2000 });

    return () => {
      try {
        cancelIdle(handle);
      } finally {
        if (cleanupRef.current) cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Debounced callback hook with RAF for smooth animations
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  // Use platform-friendly timer types (browsers return number from setTimeout)
  const timeoutRef = useRef<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) globalThis.clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return ((...args: any[]) => {
    if (timeoutRef.current) globalThis.clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    timeoutRef.current = globalThis.setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    }, delay) as unknown as number;
  }) as T;
}
