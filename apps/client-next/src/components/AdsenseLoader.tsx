"use client";
import React, { useEffect } from 'react';

export default function AdsenseLoader() {
  useEffect(() => {
    // Avoid injecting twice
    if (typeof window === 'undefined') return;
  // avoid injecting if adsbygoogle script already present
  const existing = document.querySelector('script[src*="adsbygoogle"]');
  if (existing) return;

  const s = document.createElement('script');
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4441724622178884';
  s.async = true;
  s.crossOrigin = 'anonymous';
    s.addEventListener('error', () => {
      // eslint-disable-next-line no-console
      console.warn('AdSense script failed to load (possibly blocked by an adblocker).');
    });

  document.head.appendChild(s);

    return () => {
      try {
        s.remove();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return null;
}
