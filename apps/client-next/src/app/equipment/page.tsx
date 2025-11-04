import EquipmentPage from '@/components/EquipmentPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment — Honor of Kings',
  description:
    'Complete list of Honor of Kings equipment with stats, effects, and recommended builds.',
  keywords: 'equipment honor of kings, HoK items, build guide',
  openGraph: {
    title: 'Equipment — Honor of Kings',
    description:
      'Complete list of Honor of Kings equipment with stats, effects, and recommended builds.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/equipment`,
    siteName: 'BlogHok',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/banner_circle.png`,
        width: 1200,
        height: 630,
        alt: 'Equipment - BlogHok'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Equipment — Honor of Kings',
    description:
      'Complete list of Honor of Kings equipment with stats, effects, and recommended builds.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/banner_circle.png`]
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/equipment`
  }
};

export default EquipmentPage;

