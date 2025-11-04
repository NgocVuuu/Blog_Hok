import type { Metadata } from 'next';
import HomeClient from './HomeClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const siteName = 'BlogHok';
const banner = `${baseUrl}/banner_circle.png`;

export const metadata: Metadata = {
  title: 'Home — Honor of Kings',
  description:
    'Latest news, hero guides, builds, and meta analysis for Honor of Kings.',
  keywords: 'Honor of Kings, HoK, hero builds, news, guides, meta, arcana, equipment',
  openGraph: {
    title: 'Home — Honor of Kings',
    description:
      'Latest news, hero guides, builds, and meta analysis for Honor of Kings.',
    url: baseUrl,
    siteName,
    images: [
      {
        url: banner,
        width: 1200,
        height: 630,
        alt: 'BlogHok'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    title: 'Home — Honor of Kings',
    card: 'summary_large_image',
    description:
      'Latest news, hero guides, builds, and meta analysis for Honor of Kings.',
    images: [banner]
  },
  alternates: {
    canonical: `${baseUrl}/`
  }
};

export default function Page() {
  return <HomeClient />;
}
