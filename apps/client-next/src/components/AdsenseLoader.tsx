"use client";
import React, { useEffect } from 'react';

export default function AdsenseLoader() {
  useEffect(() => {
    // Avoid injecting twice
    if (typeof window === 'undefined') return;
    // avoid injecting if adsbygoogle script already present
    const existing = document.querySelector('script[src*="adsbygoogle"]');
    const unfilledSelector = 'ins.adsbygoogle:not([data-adsbygoogle-status])';
    const hasUnfilledIns = () => !!document.querySelector(unfilledSelector);

    let injected = false;
    const injectScript = () => {
      if (injected) return;
      injected = true;
      // If script already exists, just kick the queue
      if (existing) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (_) {}
        return;
      }

      const s = document.createElement('script');
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4441724622178884';
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.addEventListener('load', () => {
        try {
          if (hasUnfilledIns()) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (_) {}
      });
      s.addEventListener('error', () => {
        // eslint-disable-next-line no-console
        console.warn('AdSense script failed to load (possibly blocked by an adblocker).');
      });
      document.head.appendChild(s);
    };

    // If there are already unfilled slots in the page, observe them and inject when one becomes visible.
    // This delays loading the heavy third-party script until it's actually needed (reduces Lighthouse noise).
    try {
      if (hasUnfilledIns()) {
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              injectScript();
              io.disconnect();
              if (mo) mo.disconnect();
              break;
            }
          }
        }, { rootMargin: '200px' });

        const nodes = Array.from(document.querySelectorAll(unfilledSelector));
        nodes.forEach((n) => io.observe(n));

        // Also watch for future ad slots inserted after initial render
        const mo = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of Array.from(m.addedNodes)) {
              if (node instanceof Element && node.matches && node.matches(unfilledSelector)) {
                io.observe(node);
              } else if (node instanceof Element) {
                const found = node.querySelector && node.querySelector(unfilledSelector);
                if (found) io.observe(found);
              }
            }
          }
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // Fallback: if nothing intersects within X seconds, inject anyway to avoid empty pages
        const fallback = setTimeout(() => {
          if (!injected) injectScript();
        }, 5000);

        // cleanup on unmount
        return () => {
          io.disconnect();
          try { mo.disconnect(); } catch (_) {}
          clearTimeout(fallback);
        };
      } else {
        // No unfilled slots yet — inject after a short delay so ads still load on pages without immediate slots
        const timer = setTimeout(() => injectScript(), 2000);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      // If IntersectionObserver / MutationObserver are not available, just inject immediately
      injectScript();
    }
  }, []);

  return null;
}
