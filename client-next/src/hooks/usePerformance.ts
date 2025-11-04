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

    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(
        () => {
          cleanupRef.current = effect();
        },
        { timeout: 2000 }
      );

      return () => {
        cancelIdleCallback(handle);
        if (cleanupRef.current) cleanupRef.current();
      };
    } else {
      // Fallback to setTimeout
      const timer = setTimeout(() => {
        cleanupRef.current = effect();
      }, 100);

      return () => {
        clearTimeout(timer);
        if (cleanupRef.current) cleanupRef.current();
      };
    }
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
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return ((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    timeoutRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    }, delay);
  }) as T;
}
