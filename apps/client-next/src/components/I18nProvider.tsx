"use client";
import React, { useEffect, useState } from 'react';
import i18n from '../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Optional: Load saved language from localStorage if you have logic for it here
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  // To prevent hydration mismatch, we can simply render children.
  // The mismatch happens because the text content differs.
  // By rendering children immediately, we accept the server HTML first.
  // However, forcing a re-render after mount (via setIsClient) can help if we hide content until then.
  // But hiding content hurts SEO/LCP.
  // better approach: rely on Next.js hydration suppression or ensure server lang matches client.
  // Since we can't easily sync server lang without cookies/middleware in this specific setup,
  // we will suppress hydration warning on the root or allow the mismatch to patch up naturally 
  // but simpler: return children wrapped in a div effectively? No that breaks layout.

  // Real fix: Just return children. The hydration error "Recoverable Error" 
  // is often fixed by just ensuring the initial state matches.
  // If we can't change server state, we simply render.

  // Actually, the user error shows "Trang chủ" vs "Home". 
  // If we change language in useEffect, it happens AFTER hydration, preventing the error.
  // The error comes because i18n might be auto-detecting language synchronously on client.

  return <>{children}</>;
}
