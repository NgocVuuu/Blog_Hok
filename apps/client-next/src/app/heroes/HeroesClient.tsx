"use client";
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Box,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import Image from 'next/image';
import { getAllHeroesAll } from '@/lib/heroService';

export default function HeroesPage() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
    
    const fetchHeroes = async () => {
      try {
        const heroesData = await getAllHeroesAll(
          { page: 1, limit: 100, sort: 'name' },
          { signal: abortController.signal }
        );
        if (!mounted || abortController.signal.aborted) return;
        
        startTransition(() => {
          setHeroes(Array.isArray(heroesData) ? heroesData : []);
          setLoading(false);
        });
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        console.error('Error fetching heroes:', err);
        startTransition(() => {
          setError(err.message);
          setHeroes([]);
          setLoading(false);
        });
      }
    };
    
    const fetchGuides = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/news`, { 
          params: { category: 'guides', limit: 5, sort: 'latest' },
          signal: abortController.signal
        });
        if (!mounted || abortController.signal.aborted) return;
        const posts = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        
        startTransition(() => {
          setGuides(posts);
          setLoadingGuides(false);
        });
      } catch (e: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (e.name === 'AbortError' || e.name === 'CanceledError') return;
        console.error('Fetch guides error', e);
        startTransition(() => {
          setGuides([]);
          setLoadingGuides(false);
        });
      }
    };
    
    // Defer fetch to allow initial render
    const timerId = setTimeout(() => {
      setLoading(true);
      setLoadingGuides(true);
      fetchHeroes();
      fetchGuides();
    }, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timerId);
      abortController.abort();
    };
  }, []);

  // Filter + search - optimized
  const filteredHeroes = useMemo(() => {
    if (!Array.isArray(heroes) || heroes.length === 0) return [];
    
    let list = heroes;
    
    // Role filter first (cheaper)
    if (selectedRole !== 'all') {
      list = list.filter(h => Array.isArray(h.roles) && h.roles.includes(selectedRole));
    }
    
    // Then search (more expensive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(h =>
        (h.name && h.name.toLowerCase().includes(term)) ||
        (h.title && h.title.toLowerCase().includes(term))
      );
    }
    
    return list;
  }, [heroes, searchTerm, selectedRole]);

  // Quick search suggestions - simplified
  const quickMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || !heroes.length) return [];
    
    // Simple prefix match for better performance
    return heroes
      .filter(h => {
        const name = (h.name || '').toLowerCase();
        return name.startsWith(term) || name.includes(term);
      })
      .slice(0, 8);
  }, [heroes, searchTerm]);

  // Group by role after filtering
  const heroesByRole = useMemo(() => {
    if (selectedRole !== 'all') {
      return { [selectedRole]: filteredHeroes };
    }
    return filteredHeroes.reduce((acc, hero) => {
      if (hero && Array.isArray(hero.roles)) {
        hero.roles.forEach((role: string) => {
          if (!acc[role]) acc[role] = [];
          acc[role].push(hero);
        });
      }
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredHeroes, selectedRole]);

  // Distinct roles for filter dropdown
  const allRoles = useMemo(() => {
    const set = new Set<string>();
    heroes.forEach(h => Array.isArray(h.roles) && h.roles.forEach((r: string) => set.add(r)));
    return Array.from(set).sort();
  }, [heroes]);

  // Precompute main heroes section content based on loading/error states
  let heroesSection;
  if (loading) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  } else if (Object.keys(heroesByRole).length === 0) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <Typography variant="h6" color="text.secondary">
          {t('heroes.noData', 'No heroes available')}
        </Typography>
      </Box>
    );
  } else {
    heroesSection = Object.keys(heroesByRole).sort().map((role, roleIndex) => (
      <Box key={role} sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2, fontWeight: 400 }}>
          {t(`roles.${role}`, role)}
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(4, minmax(0, 1fr))',  
            sm: 'repeat(3, minmax(0, 1fr))',  
            md: 'repeat(6, minmax(0, 1fr))'   
          },
          gap: 2,  
          width: '100%'
        }}>
          {heroesByRole[role].map((hero: any, heroIndex: number) => {
            const shouldPrioritize = roleIndex === 0 && heroIndex < 8;
            
            return (
              <Box key={hero._id} sx={{ minWidth: 0, width: '100%' }}>
              <Card
                component={Link}
                href={`/heroes/${hero.slug}`}
                sx={{
                  width: '100%',
                  height: { xs: 90, sm: 150, md: 200 },
                  minHeight: { xs: 90, sm: 150, md: 200 },
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  borderRadius: { xs: 1, md: 2 },
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                {hero.image && (
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: { xs: '70px', sm: '80px', md: '100px' },
                    minHeight: { xs: '70px', sm: '80px', md: '100px' },
                    flexShrink: 0,
                    overflow: 'hidden',
                    bgcolor: 'grey.200'
                  }}>
                    <Box
                      component={Image}
                      src={hero.image}
                      alt={hero.name}
                      fill
                      sx={{
                        objectFit: 'cover',
                        objectPosition: { xs: 'center 20%', sm: 'center 12%', md: 'center' },
                        transform: { xs: 'scale(1.63)', sm: 'scale(1.15)', md: 'scale(1)' },
                        top: { xs: '8px !important', sm: '0 !important', md: '0 !important' },
                        position: 'absolute',
                        transition: 'transform 0.25s ease'
                      }}
                      sizes="(max-width: 600px) 25vw, (max-width: 900px) 33vw, 16.66vw"
                      priority={shouldPrioritize}
                    />
                  </Box>
                )}
                <CardContent sx={{
                  pt: { xs: '1px', sm: 0.75, md: 0.75 },
                  px: { xs: '4px', sm: 0.75, md: 0.75 },
                  pb: { xs: '8px', sm: 0.75, md: 0.75 },
                  flexGrow: 1,
                  minHeight: { xs: '22px', sm: 'auto', md: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:last-child': { pb: { xs: '8px', sm: '6px', md: '6px' } }
                }}>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    noWrap
                    sx={{
                      fontSize: { xs: '0.58rem', sm: '0.78rem', md: '0.95rem' },
                      mb: { xs: '1px', sm: 0.5, md: 0.75 },
                      lineHeight: { xs: 1.3, sm: 1.1, md: 1.1 },
                      fontWeight: 600,
                      overflow: 'visible',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: { xs: 'center', sm: 'left', md: 'left' }
                    }}
                  >
                    {hero.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    noWrap
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.875rem' }
                    }}
                  >
                    {hero.title}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    gap={0.5}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    {(selectedRole !== 'all' ? [selectedRole] : hero.roles || []).map((role: string) => (
                      <Chip
                        key={role}
                        label={String(t(`roles.${role}`, role))}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: '20px' }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            );
          })}
        </Box>
      </Box>
    ));
  }

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 1, md: 4 },
      px: { xs: 1, sm: 2, md: 3 }  
    }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          md: '3fr 1fr'  
        }, 
        gap: { xs: 2, md: 4 }
      }}>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            Hero List Honor Of King
          </Typography>
          {/* Controls */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ position: 'relative', width: { xs: '100%', sm: 260 } }}>
              <TextField
                size="small"
                placeholder={t('heroes.search', 'Search heroes...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickMatches.length > 0) {
                    const first = quickMatches[0];
                    router.push(`/heroes/${first.slug}`);
                    setSearchFocused(false);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    searchTerm ? (
                      <IconButton size="small" aria-label={t('common.clear', 'Clear')} onClick={() => setSearchTerm('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  )
                }}
                sx={{ width: '100%' }}
              />
              {searchFocused && searchTerm && quickMatches.length > 0 && (
                <Paper elevation={6} sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, zIndex: 20, maxHeight: 320, overflowY: 'auto' }}>
                  <List dense disablePadding>
                    {quickMatches.map(h => (
                      <ListItemButton
                        key={h._id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/heroes/${h.slug}`);
                          setSearchFocused(false);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          {h.image && (
                            <Box sx={{ position: 'relative', width: 28, height: 28, borderRadius: '4px', overflow: 'hidden' }}>
                              <Image src={h.image} alt={h.name} fill style={{ objectFit: 'cover' }} sizes="28px" />
                            </Box>
                          )}
                          <ListItemText
                            primary={<Typography variant="body2" noWrap>{h.name}</Typography>}
                            secondary={h.title ? <Typography variant="caption" color="text.secondary" noWrap>{h.title}</Typography> : null}
                          />
                        </Box>
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} displayEmpty>
                <MenuItem value="all">{t('heroes.roleAll', 'All Roles')}</MenuItem>
                {allRoles.map(r => (
                  <MenuItem key={r} value={r}>{t(`roles.${r}`, r)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedRole !== 'all' && (
              <Chip label={String(t(`roles.${selectedRole}`, selectedRole))} color="primary" onDelete={() => setSelectedRole('all')} />
            )}
          </Box>

          {heroesSection}
        </Box>
        {/* Sidebar */}
        <Box sx={{ display: { xs: 'block', md: 'block' }, minWidth: 0, overflow: 'visible' }}>
          <Paper elevation={3} sx={{ 
            p: 2, 
            position: { xs: 'static', md: 'sticky' }, 
            top: { md: '80px' },
            alignSelf: 'start',
            boxShadow: { 
              xs: 3, 
              md: '0 4px 20px rgba(0,0,0,0.1), 0 -4px 20px rgba(0,0,0,0.05)' 
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              {t('heroes.guidesSidebar', 'Latest Guides')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {loadingGuides ? (
              <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
            ) : guides.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('heroes.noGuides', 'No guide posts')}
              </Typography>
            ) : (
              <List dense disablePadding>
                {guides.map(post => (
                  <ListItemButton
                    key={post._id}
                    component={Link}
                    href={`/news/${post.slug || post._id}`}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
