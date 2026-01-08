'use client';
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import HeroSelector from '@/components/compare/HeroSelector';
import ComparisonView from '@/components/compare/ComparisonView';
import { MdShare } from 'react-icons/md';

export default function ComparisonPageClient({ heroes }: { heroes: any[] }) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [heroA, setHeroA] = useState<any | null>(null);
    const [heroB, setHeroB] = useState<any | null>(null);

    // Initialize from URL params
    useEffect(() => {
        const slugA = searchParams.get('a');
        const slugB = searchParams.get('b');

        if (slugA && !heroA) {
            const found = heroes.find(h => h.slug === slugA || h._id === slugA || h.name.toLowerCase() === slugA.toLowerCase());
            if (found) setHeroA(found);
        }
        if (slugB && !heroB) {
            const found = heroes.find(h => h.slug === slugB || h._id === slugB || h.name.toLowerCase() === slugB.toLowerCase());
            if (found) setHeroB(found);
        }
    }, [heroes, searchParams]); // Run once mostly

    // Update URL on change
    const updateUrl = (hA: any, hB: any) => {
        const params = new URLSearchParams();
        if (hA) params.set('a', hA.slug);
        if (hB) params.set('b', hB.slug);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleSelectA = (h: any) => {
        setHeroA(h);
        updateUrl(h, heroB);
    };

    const handleSelectB = (h: any) => {
        setHeroB(h);
        updateUrl(heroA, h);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight={800} sx={{
                    background: 'linear-gradient(45deg, #C9A063 30%, #f0c485 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    {t('compare.title', 'Hero vs Hero')}
                </Typography>
                <Typography color="text.secondary">
                    {t('compare.subtitle', 'Compare stats, attributes, and playstyles side-by-side.')}
                </Typography>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} justifyContent="center" alignItems="flex-start">
                {/* Selector A */}
                <Box flex={1} width="100%">
                    <HeroSelector
                        heroes={heroes}
                        selectedHero={heroA}
                        onSelect={handleSelectA}
                        label={String(t('compare.select_hero_1', 'Select First Hero'))}
                        excludeId={heroB?._id}
                    />
                </Box>

                {/* VS Divider (Mobile only) or Spacer */}
                <Box sx={{ display: { xs: 'none', md: 'block' }, width: 20 }} />

                {/* Selector B */}
                <Box flex={1} width="100%">
                    <HeroSelector
                        heroes={heroes}
                        selectedHero={heroB}
                        onSelect={handleSelectB}
                        label={String(t('compare.select_hero_2', 'Select Second Hero'))}
                        excludeId={heroA?._id}
                    />
                </Box>
            </Box>

            <ComparisonView heroA={heroA} heroB={heroB} />

        </Container>
    );
}
