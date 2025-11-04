"use client";
import React, { useState, useEffect, useMemo, useTransition, memo } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllHeroesAll } from '@/lib/heroService';

// Tier color helper (outside component for better performance)
const getTierColorValue = (tier: string): string => {
  const colors: Record<string, string> = {
    'S': '#ff4444',
    'A': '#ff8800',
    'B': '#ffcc00',
    'C': '#88cc00'
  };
  return colors[tier] || '#757575';
};

// Memoized HeroCard component
const HeroCard = memo(function HeroCard({ hero, tier, index, tierIndex }: { 
  hero: any; 
  tier: string; 
  index: number;
  tierIndex: number;
}) {
  const tierColor = getTierColorValue(tier);
  
  return (
    <Link
      href={`/heroes/${hero.slug || hero.name.toLowerCase().replace(/\s+/g, '-')}`}
      style={{ textDecoration: 'none' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: `1px solid ${tierColor}40`,
          contentVisibility: 'auto',
          containIntrinsicSize: '0 200px',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2,
            border: `1px solid ${tierColor}`
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: { xs: '85%', sm: '100%' },
            bgcolor: 'grey.100',
            overflow: 'hidden'
          }}
        >
          {hero.image ? (
            <Image
              src={hero.image}
              alt={hero.name}
              fill
              style={{ 
                objectFit: 'cover', 
                objectPosition: 'center 20%',
                transform: 'scale(1.5)',
                top: '13px'
              }}
              sizes="(max-width: 600px) 33vw, (max-width: 960px) 25vw, (max-width: 1280px) 16vw, 12vw"
              loading={tierIndex === 0 && index < 8 ? 'eager' : 'lazy'}
              priority={tierIndex === 0 && index < 4}
            />
          ) : (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: tierColor, fontSize: { xs: '1.5rem', sm: '2rem' }, borderRadius: 0 }}>
              {hero.name?.charAt(0)}
            </Box>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: { xs: 0.5, sm: 1 }, textAlign: 'center' }}>
          <Typography
            variant="caption"
            component="h3"
            fontWeight={600}
            color="text.primary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.7rem' },
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {hero.name}
          </Typography>

          {/* Stats - Win Rate and Pick Rate */}
          <Box sx={{ mt: 0.5 }}>
            {hero.winRate && (
              <Typography
                variant="caption"
                sx={{
                  color: hero.winRate >= 50 ? '#4caf50' : '#f44336',
                  fontWeight: 600,
                  fontSize: { xs: '0.65rem', sm: '0.65rem' },
                  display: 'block'
                }}
              >
                Win Rate: {hero.winRate}%
              </Typography>
            )}
            {hero.pickRate && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.6rem', sm: '0.6rem' },
                  display: 'block'
                }}
              >
                Pick Rate: {hero.pickRate}%
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
});

export default function MetaPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [heroes, setHeroes] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [visibleTiers, setVisibleTiers] = useState<string[]>(['S']);

  // Role options for tabs
  const roles = [
    { value: 'all', label: t('meta.roles.all', 'Tất cả') },
    { value: 'Marksman', label: t('roles.Marksman', 'Xạ thủ') },
    { value: 'Mage', label: t('roles.Mage', 'Pháp sư') },
    { value: 'Tank', label: t('roles.Tank', 'Đỡ đòn') },
    { value: 'Support', label: t('roles.Support', 'Hỗ trợ') },
    { value: 'Assassin', label: t('roles.Assassin', 'Sát thủ') },
    { value: 'Fighter', label: t('roles.Fighter', 'Đấu sĩ') }
  ];

  // Tier options
  const tiers = [
    { value: 'all', label: t('meta.tiers.all', 'Tất cả tier') },
    { value: 'S', label: t('meta.tiers.S', 'S Tier') },
    { value: 'A', label: t('meta.tiers.A', 'A Tier') },
    { value: 'B', label: t('meta.tiers.B', 'B Tier') },
    { value: 'C', label: t('meta.tiers.C', 'C Tier') }
  ];

  // Deferred fetch with startTransition
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    
    const fetchHeroes = async () => {
      try {
        const heroesData = await getAllHeroesAll(
          { page: 1, limit: 100, sort: 'name' },
          { signal: abortController.signal }
        );
        
        if (!mounted || abortController.signal.aborted) return;
        
        startTransition(() => {
          setHeroes(heroesData);
          setLoading(false);
        });
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        if (mounted) {
          startTransition(() => {
            setHeroes([]);
            setLoading(false);
          });
        }
      }
    };

    // Defer fetch to avoid blocking initial render
    setTimeout(() => {
      setLoading(true);
      fetchHeroes();
    }, 0);
    
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Progressive tier loading (S → A → B → C)
  useEffect(() => {
    if (tierFilter !== 'all' || selectedRole !== 'all') {
      setVisibleTiers(['S', 'A', 'B', 'C']);
      return;
    }

    setVisibleTiers(['S']);
    const timer1 = setTimeout(() => {
      startTransition(() => setVisibleTiers(['S', 'A']));
    }, 50);
    const timer2 = setTimeout(() => {
      startTransition(() => setVisibleTiers(['S', 'A', 'B']));
    }, 100);
    const timer3 = setTimeout(() => {
      startTransition(() => setVisibleTiers(['S', 'A', 'B', 'C']));
    }, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [heroes.length, tierFilter, selectedRole]);

  // Pre-group heroes by tier (computed once)
  const groupedByTier = useMemo(() => {
    const groups: Record<string, any[]> = { 'S': [], 'A': [], 'B': [], 'C': [] };
    
    heroes.forEach((hero: any) => {
      if (hero.metaTier && groups[hero.metaTier]) {
        groups[hero.metaTier].push(hero);
      }
    });
    
    return groups;
  }, [heroes]);

  // Optimized filtering - use pre-grouped data
  const filteredHeroesByTier = useMemo(() => {
    const result: Record<string, any[]> = { 'S': [], 'A': [], 'B': [], 'C': [] };
    
    ['S', 'A', 'B', 'C'].forEach((tier) => {
      let tierHeroes = groupedByTier[tier] || [];
      
      // Apply role filter
      if (selectedRole !== 'all') {
        tierHeroes = tierHeroes.filter((hero: any) =>
          hero.roles && hero.roles.includes(selectedRole)
        );
      }
      
      // Apply tier filter
      if (tierFilter === 'all' || tierFilter === tier) {
        result[tier] = tierHeroes;
      }
    });
    
    return result;
  }, [groupedByTier, selectedRole, tierFilter]);

  const getTierLabel = (tier: string) => {
    return t(`meta.tierLabels.${tier}`, tier);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        {t('meta.title', 'Meta Tướng')}
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        {t('meta.description', 'Danh sách các tướng đang mạnh trong meta hiện tại, được xếp hạng từ S đến C tier')}
      </Typography>

      {/* Role Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedRole}
          onChange={(_, newValue) => {
            startTransition(() => {
              setSelectedRole(newValue);
            });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          {roles.map((role) => (
            <Tab
              key={role.value}
              value={role.value}
              label={role.label}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tier Filter */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <FormControl variant="outlined" sx={{ minWidth: { xs: 150, sm: 200 } }} size="small">
          <InputLabel id="tier-filter-label">{t('meta_tier', 'Meta Tier')}</InputLabel>
          <Select
            labelId="tier-filter-label"
            value={tierFilter}
            onChange={(e) => {
              startTransition(() => {
                setTierFilter(e.target.value);
              });
            }}
            label={t('meta_tier', 'Meta Tier')}
          >
            {tiers.map((tier) => (
              <MenuItem key={tier.value} value={tier.value}>
                {tier.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Heroes Grid - Grouped by Tier */}
      {heroes.length > 0 ? (
        <>
          {(() => {
            const totalHeroes = Object.values(filteredHeroesByTier).reduce((sum, arr) => sum + arr.length, 0);
            
            if (totalHeroes === 0) {
              return (
                <Box py={4} textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('meta.noHeroes', 'Không tìm thấy tướng nào trong meta')}
                  </Typography>
                </Box>
              );
            }
            
            return ['S', 'A', 'B', 'C'].map((tier, tierIndex) => {
              if (!visibleTiers.includes(tier)) return null;

              const tierHeroes = filteredHeroesByTier[tier];
              if (!tierHeroes || tierHeroes.length === 0) return null;

              const tierColor = getTierColorValue(tier);

              return (
                <Box key={tier} mb={4}>
                  <Typography variant="h5" fontWeight={700} mb={2}
                    sx={{
                      color: tierColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    <Chip
                      label={getTierLabel(tier)}
                      sx={{
                        bgcolor: tierColor,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        height: { xs: '28px', sm: '32px' }
                      }}
                    />
                    ({tierHeroes.length})
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(3, 1fr)',
                        sm: 'repeat(4, 1fr)',
                        md: 'repeat(6, 1fr)',
                        lg: 'repeat(8, 1fr)'
                      },
                      gap: { xs: 1, sm: 1.5, md: 2 }
                    }}
                  >
                    {tierHeroes.map((hero: any, index: number) => (
                      <HeroCard
                        key={hero._id}
                        hero={hero}
                        tier={tier}
                        index={index}
                        tierIndex={tierIndex}
                      />
                    ))}
                  </Box>
                </Box>
              );
            });
          })()}
        </>
      ) : (
        <Box py={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            {t('meta.noHeroes', 'Không tìm thấy tướng nào trong meta')}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
