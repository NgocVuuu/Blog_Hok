import type { Metadata } from 'next';
import HeroesClient from './HeroesClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const siteName = 'BlogHok';
const banner = `${baseUrl}/banner_circle.png`;

export const metadata: Metadata = {
  title: 'Heroes — Honor of Kings',
  description: 'Complete list of Honor of Kings heroes with builds, skills, and meta guides.',
  keywords: 'Honor of Kings heroes, hero builds, hero guides, HoK',
  openGraph: {
  title: 'Heroes — Honor of Kings',
  description: 'Complete list of Honor of Kings heroes with builds, skills, and meta guides.',
    url: `${baseUrl}/heroes`,
    siteName,
    images: [
      {
        url: banner,
        width: 1200,
        height: 630,
        alt: 'BlogHok Heroes'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    title: 'Heroes — Honor of Kings',
    card: 'summary_large_image',
    description: 'Complete list of Honor of Kings heroes with builds, skills, and meta guides.',
    images: [banner]
  },
  alternates: {
    canonical: `${baseUrl}/heroes`
  }
};

export default function Page() {
  return <HeroesClient />;
}
