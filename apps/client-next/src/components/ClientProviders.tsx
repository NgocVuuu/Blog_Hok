"use client";
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import I18nProvider from './I18nProvider';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import ScrollToTopHandler from './ScrollToTopHandler';
import ScrollTopButton from './ScrollTopButton';
import { GoogleProvider } from '../providers/GoogleProvider';
import { AuthProvider } from '../context/AuthContext';

// Create a client-side cache instance
const clientSideEmotionCache = createEmotionCache();

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nProvider>
          <GoogleProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <ScrollToTopHandler />
            <ScrollTopButton />
          </GoogleProvider>
        </I18nProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
