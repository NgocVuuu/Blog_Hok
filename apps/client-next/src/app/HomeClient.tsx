"use client";
import React, { useEffect, useState, memo, useTransition, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import Link from 'next/link';
import HomeSearch from '@/components/HomeSearch';
import NewsCard from '@/components/NewsCard';
import SectionUnderline from '@/components/SectionUnderline';
import { Box, Container, Typography, Skeleton } from '@mui/material';
import CalculatorButton from '@/components/CalculatorButton';
import { useTranslation } from 'react-i18next';
import { getAllHeroesAll } from '@/lib/heroService';

// Lazy load non-critical components with intersection observer trigger
const Banner = dynamic(() => import('@/components/Banner'), {
  loading: () => <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />,
  ssr: false
});

const QuickLinks = dynamic(() => import('@/components/QuickLinks'), {
  loading: () => <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />,
  ssr: false
});

// Below-the-fold components - load on demand
const SpecialTrending = dynamic(() => import('@/components/SpecialTrending'), {
  loading: () => <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />,
  ssr: false
});

const TopCounters = dynamic(() => import('@/components/TopCounters'), {
  loading: () => <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />,
  ssr: false
});

const HeroMetaPanel = dynamic(() => import('@/components/HeroMetaPanel'), {
  loading: () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />,
  ssr: false
});

const PatchHighlights = dynamic(() => import('@/components/PatchHighlights'), {
  loading: () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />,
  ssr: false
});

// Memoized timeAgo helper
const timeAgoRaw = (date: Date | null, t: any) => {
  if (!date) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return t('time.just_now', 'just now');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('time.minutes_ago', 'minutes ago')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('time.hours_ago', 'hours ago')}`;
  return `${Math.floor(diff / 86400)} ${t('time.days_ago', 'days ago')}`;
};

export default function HomePage() {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  // Separate state for better performance
  const [heroes, setHeroes] = useState<any[]>([]);
  const [heroesUpdatedAt, setHeroesUpdatedAt] = useState<Date | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [special, setSpecial] = useState<any[]>([]);
  const [newsUpdatedAt, setNewsUpdatedAt] = useState<Date | null>(null);

  const [loadingHeroes, setLoadingHeroes] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingSpecial, setLoadingSpecial] = useState(true);

  // Fetch heroes first (most critical)
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchHeroes = async () => {
      try {
        const hData = await getAllHeroesAll(
          { page: 1, limit: 100, sort: 'name' },
          { signal: abortController.signal }
        );

        if (!mounted || abortController.signal.aborted) return;

        startTransition(() => {
          setHeroes(Array.isArray(hData) ? hData : []);
          setLoadingHeroes(false);
        });

        // Fetch server-side heroes meta updated timestamp (if available)
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
          const resp = await axios.get(`${API_URL}/api/meta/site-info/heroes_meta_updated`, { signal: abortController.signal });
          if (resp?.data?.success && resp.data.data && resp.data.data.updatedAt) {
            const d = new Date(resp.data.data.updatedAt);
            if (!abortController.signal.aborted && mounted) {
              setHeroesUpdatedAt(d);
            }
          } else {
            // fallback to client time if server didn't return
            if (!abortController.signal.aborted && mounted) setHeroesUpdatedAt(new Date());
          }
        } catch (err) {
          if (!abortController.signal.aborted && mounted) setHeroesUpdatedAt(new Date());
        }
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        startTransition(() => {
          setHeroes([]);
          setLoadingHeroes(false);
        });
      }
    };

    setTimeout(fetchHeroes, 0);

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Fetch news second (important)
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchNews = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const res = await axios.get(`${API_URL}/api/news`, {
          signal: abortController.signal
        });

        if (!mounted || abortController.signal.aborted) return;

        const nData = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);

        startTransition(() => {
          setNews(Array.isArray(nData) ? nData : []);
          setNewsUpdatedAt(new Date());
          setLoadingNews(false);
        });
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        startTransition(() => {
          setNews([]);
          setLoadingNews(false);
        });
      }
    };

    // Defer news fetch slightly after heroes
    setTimeout(fetchNews, 100);

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Fetch special trending last (least critical)
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchSpecial = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const res = await axios.get(`${API_URL}/api/meta/special-trending`, {
          signal: abortController.signal
        });

        if (!mounted || abortController.signal.aborted) return;

        const sData = res.data?.success ? (res.data.data || []) : (Array.isArray(res.data) ? res.data : []);

        startTransition(() => {
          setSpecial(Array.isArray(sData) ? sData : []);
          setLoadingSpecial(false);
        });
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        startTransition(() => {
          setSpecial([]);
          setLoadingSpecial(false);
        });
      }
    };

    // Defer special fetch even more
    setTimeout(fetchSpecial, 200);

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Optimized memoization with proper dependencies
  const latest = useMemo(() => {
    if (!Array.isArray(news) || news.length === 0) return [];

    return news
      .sort((a: any, b: any) =>
        new Date(b.createdAt || b.date || 0).getTime() -
        new Date(a.createdAt || a.date || 0).getTime()
      )
      .slice(0, 8);
  }, [news]);

  const featuredNewsItem = useMemo(() => {
    if (!latest.length) return null;
    return latest.find((n: any) => /patch|meta/i.test(n.title || '')) || latest[0];
  }, [latest]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Banner />

      <Box sx={{ mb: 3 }}>
        <HomeSearch heroes={heroes} news={news} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <QuickLinks />
      </Box>

      <Box component="section" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography component="h2" variant="h5" noWrap sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 'inherit' }, minWidth: 0 }}>
            {t('home.specialTrending', 'Special Trending')}
          </Typography>
          <CalculatorButton />
        </Box>
        <Box>
          {loadingSpecial ? (
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
          ) : (
            <SpecialTrending items={special} />
          )}
        </Box>
      </Box>

      <Box component="section" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" noWrap sx={{ fontWeight: 800, minWidth: 0, fontSize: { xs: 18, sm: 'inherit' } }}>
            {t('home.topCounters', 'Top meta heroes')}
          </Typography>
        </Box>
        <TopCounters heroes={heroes} loading={loadingHeroes} />
      </Box>

      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'nowrap' }}>
          <Typography variant="h5" noWrap sx={{ fontWeight: 700, color: 'text.primary', minWidth: 0, flex: 1, fontSize: { xs: 18, sm: 'inherit' } }}>
            {t('home.patchHighlights', 'Patch highlights')}
          </Typography>
          {/* Removed the 'Updated just now' caption for Latest Published as requested */}
        </Box>
        {loadingNews ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 7 }, mb: 3 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          featuredNewsItem && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 2, md: 7, lg: 8 },
              mb: 3,
              alignItems: 'stretch'
            }}>
              <PatchHighlights item={featuredNewsItem} loading={loadingNews} />
              <HeroMetaPanel heroes={heroes} loading={loadingHeroes} lastUpdated={heroesUpdatedAt} />
            </Box>
          )
        )}
      </Box>

      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" noWrap sx={{ fontWeight: 800, minWidth: 0, fontSize: { xs: 18, sm: 'inherit' } }}>
            {t('home.latestNews', 'Latest news')}
          </Typography>
        </Box>
        {loadingNews ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: { xs: 'flex', sm: 'grid' },
              gap: 2,
              overflowX: { xs: 'auto', sm: 'visible' },
              scrollSnapType: { xs: 'x mandatory', sm: 'none' },
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              gridTemplateColumns: { sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
              pb: 2,
              mb: 2
            }}
          >
            {latest.map((item: any, i: number) => (
              <Box
                key={item.slug || item._id || i}
                sx={{
                  minWidth: { xs: '85%', sm: 'auto' },
                  scrollSnapAlign: { xs: 'center', sm: 'unset' },
                  scrollSnapStop: { xs: 'always', sm: 'unset' }
                }}
              >
                <NewsCard item={item} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
