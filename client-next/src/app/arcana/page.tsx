import { Metadata } from 'next';
import ArcanaClient from './ArcanaClient';

export const metadata: Metadata = {
  title: 'Arcana — Honor of Kings',
  description: 'Complete guide to Honor of Kings arcana system. Browse all red, blue, and green arcanas with detailed stats, effects, and optimal builds for every hero.',
  keywords: 'Honor of Kings arcana, HoK arcana, red arcana, blue arcana, green arcana, arcana builds, arcana stats, arcana guide',
  openGraph: {
    title: 'Arcana — Honor of Kings',
    description: 'Complete guide to Honor of Kings arcana with stats and optimal builds.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/arcana`,
    siteName: 'BlogHok',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/og-arcana.jpg`,
        width: 1200,
        height: 630,
        alt: 'Honor of Kings Arcana',
      },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/banner_circle.png`,
        width: 1200,
        height: 630,
        alt: 'BlogHok'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arcana — Honor of Kings',
    description: 'Complete guide to HoK arcana with stats and builds.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/og-arcana.jpg`, `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/banner_circle.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/arcana`,
  },
};

export default function ArcanaPage() {
  return <ArcanaClient />;
}
