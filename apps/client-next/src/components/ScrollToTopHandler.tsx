"use client";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollToTopHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediately jump to top on route change to avoid preserved scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // We intentionally do NOT programmatically focus <main> here to avoid
    // showing a browser focus ring/frame around the page when the focus is
    // applied programmatically. Screen reader users will still pick up the
    // new content; if you want an a11y announcement we can add an
    // aria-live region instead.
  }, [pathname]);

  return null;
}
