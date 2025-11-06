"use client";
import React, { useEffect } from 'react';

export default function AdsenseLoader() {
  useEffect(() => {
    // Avoid injecting twice
    if (typeof window === 'undefined') return;
    // avoid injecting if adsbygoogle script already present
    const existing = document.querySelector('script[src*="adsbygoogle"]');
    try {
      // If script already exists, ensure the queue is kicked so Auto Ads or slots render
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
    if (existing) return;

    const s = document.createElement('script');
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4441724622178884';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.addEventListener('load', () => {
      try {
        // Trigger Auto Ads (if enabled in your AdSense account) and render manual slots
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {}
    });
    s.addEventListener('error', () => {
      // eslint-disable-next-line no-console
      console.warn('AdSense script failed to load (possibly blocked by an adblocker).');
    });

    document.head.appendChild(s);
    // Do not remove the script on unmount — layout is long-lived and removing can break ads
  }, []);

  return null;
}
