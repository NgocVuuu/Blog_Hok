import { Suspense } from 'react';
import { getAllHeroesAll } from '@/lib/heroService';
import ComparisonPageClient from './ComparisonPageClient';

export const metadata = {
    title: 'Hero Comparison - Honor of Kings',
    description: 'Compare Honor of Kings heroes side-by-side. Analyze win rates, attributes, and roles to find the best pick.',
};

export default async function ComparisonPage() {
    // Fetch specific fields only to reduce payload if possible (but API returns all)
    const heroes = await getAllHeroesAll({ limit: 300 });

    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading comparison...</div>}>
            <ComparisonPageClient heroes={heroes} />
        </Suspense>
    );
}
