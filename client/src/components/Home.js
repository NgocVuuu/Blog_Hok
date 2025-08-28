import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Box, Typography, TextField, InputAdornment, IconButton, Card, CardContent, CardMedia, Grid, Chip, Skeleton, Button } from '@mui/material';
import { MdSearch as SearchIcon, MdCasino as CasinoIcon, MdWhatshot as WhatshotIcon, MdBolt as BoltIcon, MdArticle as ArticleIcon, MdConstruction as ConstructionIcon } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Banner from './Banner';
import { getAllHeroesAll } from '../services/heroService';
import { getNews } from '../services/newsService';
import { getSpecialTrending } from '../services/metaService';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

// Helper to format relative updated time (localized)
const timeAgoRaw = (date, t) => {
  if (!date) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return t('time.just_now', 'just now');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('time.minutes_ago', 'minutes ago')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('time.hours_ago', 'hours ago')}`;
  return `${Math.floor(diff / 86400)} ${t('time.days_ago', 'days ago')}`;
};

const getHeroSlug = (hero) => hero?.slug || (hero?.name ? hero.name.toLowerCase().replace(/\s+/g, '-') : '');

const Home = () => {
  const navigate = useNavigate();
  const [heroes, setHeroes] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingHeroes, setLoadingHeroes] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [specialTrending, setSpecialTrending] = useState([]);
  const [loadingSpecial, setLoadingSpecial] = useState(true);
  // removed heroesUpdatedAt (no longer shown after removing Trending Heroes)
  const [newsUpdatedAt, setNewsUpdatedAt] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Command palette
  const [query, setQuery] = useState('');
  const searchRef = useRef();

  useEffect(() => {
    // Keyboard shortcut '/' to focus
    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Setup AbortControllers so requests are actually cancelled on cleanup
    const heroesAbort = new AbortController();
    const newsAbort = new AbortController();
    const specialAbort = new AbortController();

    const isCanceled = (err) => {
      return err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || /aborted|canceled/i.test(err?.message || '');
    };

    (async () => {
      try {
        setLoadingHeroes(true);
        const list = await getAllHeroesAll({ page: 1, limit: 100, sort: 'name' }, { signal: heroesAbort.signal });
        if (!cancelled) { setHeroes(list || []); }
      } catch (err) {
        if (!cancelled && !isCanceled(err)) {
          // Log non-cancel errors for visibility
          // eslint-disable-next-line no-console
          console.error('Failed to load heroes on Home:', err);
        }
      } finally { if (!cancelled) setLoadingHeroes(false); }
    })();
    (async () => {
      try {
        setLoadingNews(true);
        const res = await getNews({ signal: newsAbort.signal });
        const items = Array.isArray(res) ? res : (res?.data || []);
        if (!cancelled) { setNews(items); setNewsUpdatedAt(new Date()); }
      } catch (err) {
        if (!cancelled && !isCanceled(err)) {
          // eslint-disable-next-line no-console
          console.error('Failed to load news on Home:', err);
        }
      } finally { if (!cancelled) setLoadingNews(false); }
    })();
    (async () => {
      try {
        setLoadingSpecial(true);
        const res = await getSpecialTrending({ signal: specialAbort.signal });
        const list = res && res.success ? (res.data || []) : [];
        if (!cancelled) setSpecialTrending(list);
      } catch (err) {
        if (!cancelled && !isCanceled(err)) {
          // eslint-disable-next-line no-console
          console.error('Failed to load special trending on Home:', err);
        }
      } finally { if (!cancelled) setLoadingSpecial(false); }
    })();
    return () => {
      cancelled = true;
      heroesAbort.abort();
      newsAbort.abort();
      specialAbort.abort();
    };
  }, []);

  // Command palette suggestions: heroes and news
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const heroMatches = (heroes || []).filter(h => (h.name||'').toLowerCase().includes(term)).slice(0, 5).map(h => ({
      type: 'hero', id: h._id, title: h.name, image: h.image, href: `/heroes/${getHeroSlug(h)}`
    }));
    const newsMatches = (news || []).filter(n => (n.title||'').toLowerCase().includes(term)).slice(0, 5).map(n => ({
      type: 'news', id: n._id, title: n.title, image: n.thumbnail || n.image, href: `/news`
    }));
    return [...heroMatches, ...newsMatches].slice(0, 10);
  }, [query, heroes, news]);

  // Removed Trending Heroes in favor of Special Trending

  const patchHighlight = useMemo(() => {
    // Prefer news with title including Patch/Meta, else latest
    const items = (news || []).slice();
    items.sort((a,b) => new Date(b.createdAt||b.date||0) - new Date(a.createdAt||a.date||0));
    const found = items.find(n => /patch|meta/i.test(n.title||'')) || items[0];
    return found;
  }, [news]);

  const latestNews = useMemo(() => {
    const items = (news || []).slice();
    items.sort((a,b) => new Date(b.createdAt||b.date||0) - new Date(a.createdAt||a.date||0));
    return items.slice(0, 8);
  }, [news]);

  // --- Hero Meta List (under Patch highlights) ---
  const [laneFilter, setLaneFilter] = useState('All');
  const [sortBy, setSortBy] = useState('winRate'); // 'tier' | 'winRate' | 'pickRate' | 'banRate' | 'name'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  const laneMap = useMemo(() => ({
    All: [],
    Clash: ['Clash Lane', 'Abyssal Lane'],
    Mid: ['Mid Lane'],
    Farm: ['Farm Lane'],
    Roaming: ['Roam'],
    Jungling: ['Jungle']
  }), []);

  const tierRank = (t) => ({ 'S+': 5, S: 4, A: 3, B: 2, C: 1 }[t] ?? 0);
  const pct = (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '-');

  const filteredSortedHeroes = useMemo(() => {
    const lanesWanted = laneMap[laneFilter] || [];
    let list = Array.isArray(heroes) ? heroes.slice() : [];
    if (lanesWanted.length > 0) {
      list = list.filter(h => (h.lanes || []).some(l => lanesWanted.includes(l)));
    }
    list.sort((a, b) => {
      let av, bv;
      switch (sortBy) {
        case 'tier':
          av = tierRank(a.metaTier); bv = tierRank(b.metaTier);
          break;
        case 'pickRate':
          av = a.pickRate || 0; bv = b.pickRate || 0;
          break;
        case 'banRate':
          av = a.banRate || 0; bv = b.banRate || 0;
          break;
        case 'name':
          av = (a.name || '').localeCompare ? a.name : String(a.name || '');
          bv = (b.name || '').localeCompare ? b.name : String(b.name || '');
          return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        case 'winRate':
        default:
          av = a.winRate || 0; bv = b.winRate || 0;
          break;
      }
      const diff = (av || 0) - (bv || 0);
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [heroes, laneFilter, laneMap, sortBy, sortDir]);

  const SortHeader = ({ label, field }) => {
    const active = sortBy === field;
    const dir = active ? sortDir : undefined;
    return (
      <Box
        component="button"
        onClick={() => {
          if (sortBy === field) setSortDir(dir === 'asc' ? 'desc' : 'asc');
          else { setSortBy(field); setSortDir(field === 'name' ? 'asc' : 'desc'); }
        }}
        sx={{
          all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.5,
          color: active ? 'text.primary' : 'text.secondary', fontWeight: active ? 700 : 600, fontSize: 12
        }}
      >
        {label}
        <Typography component="span" sx={{ fontSize: 12, opacity: active ? 1 : 0.35 }}>
          {active ? (dir === 'asc' ? '▲' : '▼') : '◄'}
        </Typography>
      </Box>
    );
  };

  const topCounters = useMemo(() => {
    const list = (heroes || []).slice();
    if (list.length === 0) return [];

    // Map heroId -> pickRate for weighting
  const pickRateById = new Map(list.map(h => [h._id, h.pickRate || 0]));
  const metaTierById = new Map(list.map(h => [h._id, h.metaTier]));

  const tierScore = (tier) => ({ 'S+': 5, 'S': 4, 'A': 3, 'B': 2, 'C': 1 }[tier] ?? 3);

    const getId = (ref) => {
      if (!ref) return null;
      if (typeof ref === 'string') return ref;
      if (ref.hero && typeof ref.hero === 'string') return ref.hero;
      if (ref.hero && ref.hero._id) return ref.hero._id;
      if (ref._id) return ref._id;
      return null;
    };

    const scored = list.map(h => {
      const goods = Array.isArray(h.goodAgainst) ? h.goodAgainst : [];
      const bads = Array.isArray(h.counters) ? h.counters : [];
      const sumGood = goods.reduce((acc, g) => {
        const id = getId(g);
        if (!id) return acc;
        const pr = pickRateById.get(id) || 0;
        const oppTier = tierScore(metaTierById.get(id));
        const factor = 1 + 0.2 * (oppTier - 3); // boost if opponent is high tier
        return acc + pr * factor;
      }, 0);
      const sumBad = bads.reduce((acc, c) => {
        const id = getId(c);
        if (!id) return acc;
        const pr = pickRateById.get(id) || 0;
        const oppTier = tierScore(metaTierById.get(id));
        const factor = 1 + 0.2 * (oppTier - 3); // penalize more if counter is high tier
        return acc + pr * factor;
      }, 0);
      // Base score: counter popular high-tier picks, penalize being countered by high-tier; small winRate bonus
      let base = 2 * sumGood - 1.5 * sumBad + 0.5 * (h.winRate || 0);
      // Apply hero's own tier as a multiplier (S+ > C)
      const selfTier = tierScore(h.metaTier);
      const selfFactor = 1 + 0.1 * (selfTier - 3); // range ~0.8..1.2
      const score = base * selfFactor;
      return { hero: h, score };
    });

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scored.slice(0, 8).map(s => s.hero);
  }, [heroes]);

  const onSurprise = () => {
    if (!heroes || heroes.length === 0) return;
    const idx = Math.floor(Math.random() * heroes.length);
    navigate(`/heroes/${getHeroSlug(heroes[idx])}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Banner />

      {/* Command Palette Search */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        <TextField
          inputRef={searchRef}
          fullWidth
          placeholder={t('home.searchPlaceholder', 'Search heroes, equipment, news... (/ to focus)')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onSurprise} title={t('home.surprise', 'Surprise me')}>
                  <CasinoIcon size={20} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {query && suggestions.length > 0 && (
          <Box sx={{ position: 'absolute', zIndex: 10, left: 0, right: 0, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 1, maxHeight: 360, overflowY: 'auto', boxShadow: 3 }}>
            {suggestions.map(s => (
              <Box
                key={`${s.type}-${s.id}`}
                component={Link}
                to={s.href}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => setQuery('')}
              >
                {s.image ? (
                  <img src={s.image} alt={s.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                ) : (
                  <Box sx={{ width: 40, height: 40, bgcolor: 'grey.200', borderRadius: 1 }} />
                )}
                <Chip size="small" label={s.type} sx={{ textTransform: 'capitalize' }} />
                <Typography variant="body2" fontWeight={600} noWrap>{s.title}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Quick Links */}
  <Grid container spacing={{ xs: 1, sm: 3 }} sx={{ mb: 4, px: { xs: 0.5, sm: 0 } }}>
        {[{icon:<BoltIcon size={22}/>,label:t('nav.meta','Meta'),href:'/meta'},{icon:<WhatshotIcon size={22}/>,label:t('nav.arcana','Arcana'),href:'/arcana'},{icon:<ConstructionIcon size={22}/>,label:t('nav.equipment','Equipment'),href:'/equipment'},{icon:<ArticleIcon size={22}/>,label:t('nav.news','News'),href:'/news'}].map(link => (
          <Grid item xs={3} sm={3} key={`${link.label}-${link.href}`}>
      <Box
              component={Link}
              to={link.href}
              sx={{
                textDecoration:'none',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:1,
                p:{ xs: 1.5, sm: 2 },
        borderRadius:2,
        transition:'transform .2s ease, box-shadow .2s ease, background-color .2s ease',
        bgcolor:'background.paper',
        boxShadow: 1,
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', bgcolor:'background.default' }
              }}
            >
              <Box sx={{ width:48, height:48, borderRadius:'50%', bgcolor:'grey.100', color:'primary.main', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.04)' }}>
                {link.icon}
              </Box>
              <Typography fontWeight={700} color="text.primary">{link.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Special Trending (moved to top and enlarged) */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={800} noWrap sx={{ minWidth:0, fontSize:{ xs: 18, sm: 'inherit' } }}>
          {t('home.specialTrending', 'Special Trending')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onSurprise}
          startIcon={isMobile ? undefined : <CasinoIcon/>}
          sx={{ px: { xs: 1, sm: 1.5 }, minWidth: { xs: 0, sm: 64 } }}
        >
          {isMobile ? t('home.surprise_short','Surprise') : t('home.surprise','Surprise me')}
        </Button>
      </Box>
      {loadingSpecial ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 3 }).map((_,i)=> (
            <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rectangular" height={220} /></Grid>
          ))}
        </Grid>
      ) : (
        <Swiper modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={1.05} breakpoints={{ 600:{slidesPerView:1.5}, 900:{slidesPerView:2.2}, 1200:{slidesPerView:3} }} pagination={{ clickable: true }} autoplay={{ delay: 4000, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
          {specialTrending.map(item => (
            <SwiperSlide key={item.slug || item.id || item.name}>
              <Card component={Link} to={`/heroes/${getHeroSlug(item)}`} sx={{ textDecoration:'none', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', height:'100%' }}>
                {item.image ? (<CardMedia component="img" height={160} image={item.image} alt={item.name} />) : (<Skeleton variant="rectangular" height={160} />)}
                <CardContent sx={{ p:1.5 }}>
                  <Typography variant="subtitle1" fontWeight={800} noWrap>{item.name}</Typography>
                  <Box sx={{ mt: 0.5, display:'flex', alignItems:'center', gap:1, flexWrap:'wrap' }}>
                    <Chip size="small" label={item.categoryEn || item.categoryVi || item.category || 'Special'} color="warning" />
                    <Chip size="small" label={`Tier ${item.metaTier || '-'}`} />
                    {item.winRate != null && (<Chip size="small" label={`WR ${item.winRate}%`} color={(item.winRate||0) >= 50 ? 'success' : 'default'} />)}
                    {item.pickRate != null && (<Chip size="small" label={`PR ${item.pickRate}%`} color="info" />)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.reasonEn || item.reasonVi || item.reason}
                  </Typography>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Top counters this week (moved up under Special Trending) */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={800} noWrap sx={{ minWidth:0, fontSize:{ xs: 18, sm: 'inherit' } }}>{t('home.topCounters','Top counters this week')}</Typography>
      </Box>
      {loadingHeroes ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 8 }).map((_,i)=>(
            <Grid item xs={6} sm={3} md={3} lg={1.5} key={i}><Skeleton variant="rectangular" height={140} /></Grid>
          ))}
        </Grid>
      ) : (
        isMobile ? (
          <Box sx={{ '& .top-counters-swiper .swiper-pagination-bullets': { bottom: -14 } }}>
            <Swiper className="top-counters-swiper" modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={2.2} pagination={false} autoplay={{ delay: 3500, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
              {topCounters.map(h => (
                <SwiperSlide key={h._id || h.slug || h.name}>
                <Card component={Link} to={`/heroes/${getHeroSlug(h)}`} sx={{ textDecoration:'none', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                  {h.image ? (<CardMedia component="img" height={120} image={h.image} alt={h.name} />) : (<Skeleton variant="rectangular" height={120} />)}
                  <CardContent sx={{ p:1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{h.name}</Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:0.5, flexWrap:'nowrap', overflow:'hidden' }}>
                      <Chip
                        size="small"
                        label={`${h.winRate ?? '-' }% ${t('win_rate','Win Rate')}`}
                        color={(h.winRate||0) >= 50 ? 'success' : 'default'}
            sx={{ flex:1, minWidth:0, '& .MuiChip-label': { px: 0.5, fontSize: 10, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }}
                      />
                      <Chip
                        size="small"
                        label={`${h.pickRate ?? '-' }% ${t('pick_rate','Pick Rate')}`}
                        color="info"
            sx={{ flex:1, minWidth:0, '& .MuiChip-label': { px: 0.5, fontSize: 10, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }}
                      />
                    </Box>
                    {Array.isArray(h.goodAgainst) && h.goodAgainst.length > 0 && (
                      <Box sx={{ mt: 0.5, display:'flex', flexWrap:'wrap', gap:0.5 }}>
                        {(h.goodAgainst.slice(0,3)).map((g, gi) => {
                          const id = typeof g === 'string' ? g : (g.hero?._id || g.hero || g._id);
                          const hero = heroes.find(x => x._id === id);
                          return hero ? (<Chip key={id || `${h._id}-ga-${gi}`} size="small" label={hero.name} />) : null;
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {topCounters.map(h => (
              <Grid item xs={6} sm={3} md={3} lg={1.5} key={h._id || h.slug || h.name}>
                <Card component={Link} to={`/heroes/${getHeroSlug(h)}`} sx={{ textDecoration:'none', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                  {h.image ? (<CardMedia component="img" height={120} image={h.image} alt={h.name} />) : (<Skeleton variant="rectangular" height={120} />)}
                  <CardContent sx={{ p:1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{h.name}</Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:0.5, flexWrap:'nowrap', overflow:'hidden' }}>
                      <Chip
                        size="small"
                        label={`${h.winRate ?? '-' }% ${t('win_rate','Win Rate')}`}
                        color={(h.winRate||0) >= 50 ? 'success' : 'default'}
            sx={{ flex:1, minWidth:0, '& .MuiChip-label': { px: 0.5, fontSize: 10, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }}
                      />
                      <Chip
                        size="small"
                        label={`${h.pickRate ?? '-' }% ${t('pick_rate','Pick Rate')}`}
                        color="info"
            sx={{ flex:1, minWidth:0, '& .MuiChip-label': { px: 0.5, fontSize: 10, maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }}
                      />
                    </Box>
                    {Array.isArray(h.goodAgainst) && h.goodAgainst.length > 0 && (
                      <Box sx={{ mt: 0.5, display:'flex', flexWrap:'wrap', gap:0.5 }}>
                        {(h.goodAgainst.slice(0,3)).map((g, gi) => {
                          const id = typeof g === 'string' ? g : (g.hero?._id || g.hero || g._id);
                          const hero = heroes.find(x => x._id === id);
                          return hero ? (<Chip key={id || `${h._id}-ga-${gi}`} size="small" label={hero.name} />) : null;
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Patch highlights */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1, flexWrap:'nowrap' }}>
        <Typography variant="h5" fontWeight={700} noWrap sx={{ color:'text.primary', minWidth:0, flex:1, fontSize:{ xs: 18, sm: 'inherit' } }}>{t('home.patchHighlights','Patch highlights')}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: '0.75rem' } }}>
          {isMobile ? timeAgoRaw(newsUpdatedAt, t) : `${t('home.updated','Updated')} ${timeAgoRaw(newsUpdatedAt, t)}`}
        </Typography>
      </Box>
  <Grid container columnSpacing={{ xs: 2, md: 7, lg: 8 }} rowSpacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }} alignItems="stretch">
        <Grid item xs={12} md={6}>
          {loadingNews ? (
            <Skeleton variant="rectangular" height={400} />
          ) : patchHighlight ? (
            <Card sx={{ height: { xs: 'auto', md: 400 }, display: 'flex', flexDirection: 'column', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
              {patchHighlight.thumbnail || patchHighlight.image ? (
                <CardMedia
                  component="img"
                  image={patchHighlight.thumbnail || patchHighlight.image}
                  alt={patchHighlight.title}
                  sx={{ height: { xs: 180, md: 240 }, width: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Skeleton variant="rectangular" sx={{ height: { xs: 180, md: 240 } }} />
              )}
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={800}>{patchHighlight.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5 }}>
                  {patchHighlight.excerpt || patchHighlight.description || ''}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Button component={Link} to="/news" size="small">{t('home.viewFull','View full')}</Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Skeleton variant="rectangular" height={400} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Hero Meta panel (fixed height on desktop) */}
          <Box
            sx={{
              height: { xs: 600, md: 400 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              boxShadow: 1,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Filter header */}
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                {Object.keys(laneMap).map(key => (
                  <Chip
                    key={key}
                    size="small"
                    label={key}
                    color={laneFilter === key ? 'warning' : 'default'}
                    onClick={() => setLaneFilter(key)}
                    sx={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>
            {/* Header row */}
            <Box sx={{
              px: 1,
              py: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 36px 56px 56px 56px', md: '1.25fr 52px 72px 72px 72px' },
              alignItems: 'center',
              gap: { xs: 0.75, md: 1 }
            }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 11 }}>{t('nav.heroes','Heroes')}</Typography>
              <SortHeader label={t('heroes.metaTier','Tier')} field="tier" />
              <SortHeader label={t('heroes.winRate','Win')} field="winRate" />
              <SortHeader label={t('heroes.pickRate','Pick')} field="pickRate" />
              <SortHeader label={t('heroes.banRate','Ban')} field="banRate" />
            </Box>
            {/* List (fills remaining height) */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
              {loadingHeroes ? (
                Array.from({ length: 8 }).map((_,i)=>(
                  <Box key={i} sx={{
                    px: 1,
                    py: 1,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 36px 56px 56px 56px', md: '1.25fr 52px 72px 72px 72px' },
                    alignItems: 'center',
                    gap: { xs: 0.75, md: 1 },
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="rectangular" width={{ xs: 42, md: 48 }} height={{ xs: 42, md: 48 }} sx={{ borderRadius: 1 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Skeleton variant="text" width={160} />
                        <Skeleton variant="text" width={100} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width={24} />
                    <Skeleton variant="text" width={48} />
                    <Skeleton variant="text" width={48} />
                    <Skeleton variant="text" width={48} />
                  </Box>
                ))
              ) : (
                filteredSortedHeroes.map(h => (
                  <Box key={h._id || h.slug || h.name} sx={{
                    px: 1,
                    py: 0.75,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 36px 56px 56px 56px', md: '1.25fr 52px 72px 72px 72px' },
                    alignItems: 'center',
                    gap: { xs: 0.75, md: 1 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    {/* Name cell */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      {h.image ? (
                        <Box sx={{ width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee', flex: '0 0 auto', bgcolor: 'grey.50' }}>
                          <img src={h.image} alt={h.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </Box>
                      ) : (
                        <Box sx={{ width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: 1, bgcolor: 'grey.200' }} />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} title={h.name} sx={{ whiteSpace: 'normal', lineHeight: 1.2 }}>{h.name}</Typography>
                        {Array.isArray(h.lanes) && h.lanes.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display:'block', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
                            {(h.lanes[0] === 'Abyssal Lane') ? 'Clash Lane' : h.lanes[0]}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Tier */}
                    <Typography variant="subtitle2" fontWeight={800} color="warning.main" sx={{ textAlign: 'center' }}>{h.metaTier || '-'}</Typography>
                    {/* Win */}
                    <Typography variant="body2" fontWeight={400} sx={{ color: (h.winRate||0) >= 50 ? 'success.main' : 'text.primary', textAlign: 'right' }}>{pct(h.winRate)}</Typography>
                    {/* Pick */}
                    <Typography variant="body2" fontWeight={400} sx={{ color: 'info.main', textAlign: 'right' }}>{pct(h.pickRate)}</Typography>
                    {/* Ban */}
                    <Typography variant="body2" fontWeight={400} sx={{ color: 'error.main', textAlign: 'right' }}>{pct(h.banRate)}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>


      {/* Magazine grid of latest news */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={800} noWrap sx={{ minWidth:0, fontSize:{ xs: 18, sm: 'inherit' } }}>{t('home.latestNews','Latest news')}</Typography>
      </Box>
      {loadingNews ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 8 }).map((_,i)=>(
            <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rectangular" height={180} /></Grid>
          ))}
        </Grid>
      ) : (
        isMobile ? (
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={2.1} pagination={false} autoplay={{ delay: 3500, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
            {latestNews.map((item, i) => (
              <SwiperSlide key={item.slug || item._id || i}>
                <Card component={Link} to={item.slug ? `/news/${item.slug}` : (item._id ? `/news/${item._id}` : '/news')} sx={{ position:'relative', textDecoration:'none', border:'1px solid', borderColor:'divider', boxShadow:1 }}>
                  <Box sx={{ height: 3, bgcolor: 'primary.main', opacity: 0.3 }} />
                  {item.thumbnail || item.image ? (<CardMedia component="img" height={140} image={item.thumbnail || item.image} alt={item.title} />) : (<Skeleton variant="rectangular" height={140} />)}
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Typography>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {latestNews.map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={item.slug || item._id || i}>
                <Card component={Link} to={item.slug ? `/news/${item.slug}` : (item._id ? `/news/${item._id}` : '/news')} sx={{ position:'relative', textDecoration:'none', border:'1px solid', borderColor:'divider', boxShadow:1 }}>
                  <Box sx={{ height: 3, bgcolor: 'primary.main', opacity: 0.3 }} />
                  {item.thumbnail || item.image ? (<CardMedia component="img" height={140} image={item.thumbnail || item.image} alt={item.title} />) : (<Skeleton variant="rectangular" height={140} />)}
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      
    </Container>
  );
};

export default Home;