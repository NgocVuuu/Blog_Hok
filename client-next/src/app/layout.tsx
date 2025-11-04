import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import I18nProvider from '@/components/I18nProvider';
import ClientProviders from '@/components/ClientProviders';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import WebVitals from '@/components/WebVitals';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BlogHok - Honor of Kings Builds, Guides & Meta",
    template: "%s | BlogHok"
  },
  description: "Your ultimate resource for Honor of Kings hero builds, guides, arcana, equipment, and latest meta. Stay updated with patch notes and pro strategies.",
  keywords: 'Honor of Kings, HoK, hero builds, meta, tier list, arcana, equipment, guides, esports',
  authors: [{ name: 'BlogHok' }],
  creator: 'BlogHok',
  publisher: 'BlogHok',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BlogHok',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@BlogHok',
  },
  // Use banner_circle.png as the site favicon / tab thumbnail
  icons: {
    icon: '/banner_circle.png',
    shortcut: '/banner_circle.png',
    apple: '/banner_circle.png'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // Add your verification codes here when available
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      {/*
        suppressHydrationWarning in development reduces noisy hydration warnings
        caused by browser extensions injecting attributes (eg. cz-shortcut-listen).
        This is a limited dev-only mitigation — leave disabled in production so
        real mismatches surface.
      */}
      <body
        suppressHydrationWarning={process.env.NODE_ENV === 'development'}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            <WebVitals />
          </>
        )}
        <ClientProviders>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
