import type { Metadata } from 'next';
import MetaClient from './MetaClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const siteName = 'BlogHok';
const banner = `${baseUrl}/banner_circle.png`;

export const metadata: Metadata = {
  title: 'Meta — Honor of Kings',
  description: 'Hero meta, tier lists, and analysis for Honor of Kings.',
  keywords: 'Honor of Kings meta, tier list, hero rankings, HoK meta',
  openGraph: {
  title: 'Meta — Honor of Kings',
  description: 'Hero meta, tier lists, and analysis for Honor of Kings.',
    url: `${baseUrl}/meta`,
    siteName,
    images: [
      {
        url: banner,
        width: 1200,
        height: 630,
        alt: 'BlogHok Meta'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    title: 'Meta — Honor of Kings',
    card: 'summary_large_image',
    description: 'Hero meta, tier lists, and analysis for Honor of Kings.',
    images: [banner]
  },
  alternates: {
    canonical: `${baseUrl}/meta`
  }
};

export default function Page() {
  return <MetaClient />;
}
