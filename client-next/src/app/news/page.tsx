import type { Metadata } from 'next';
import NewsClient from './NewsClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const siteName = 'BlogHok';
const banner = `${baseUrl}/banner_circle.png`;

export const metadata: Metadata = {
  title: 'News — Honor of Kings',
  description: 'Latest news, patch notes and guides for Honor of Kings.',
  keywords: 'Honor of Kings news, patch notes, HoK guides',
  openGraph: {
  title: 'News — Honor of Kings',
  description: 'Latest news, patch notes and guides for Honor of Kings.',
    url: `${baseUrl}/news`,
    siteName,
    images: [
      {
        url: banner,
        width: 1200,
        height: 630,
        alt: 'BlogHok News'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    title: 'News — Honor of Kings',
    card: 'summary_large_image',
    description: 'Latest news, patch notes and guides for Honor of Kings.',
    images: [banner]
  },
  alternates: {
    canonical: `${baseUrl}/news`
  }
};

export default function Page() {
  return <NewsClient />;
}
