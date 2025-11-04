"use client";
import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface DeferredSectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}

export default function DeferredSection({ 
  children, 
  fallback = null, 
  rootMargin = '100px' 
}: DeferredSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use Intersection Observer for lazy rendering
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}
