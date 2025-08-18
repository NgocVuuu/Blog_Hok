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
  const [heroesUpdatedAt, setHeroesUpdatedAt] = useState(null);
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
    (async () => {
      try {
        setLoadingHeroes(true);
        const list = await getAllHeroesAll({ page: 1, limit: 100, sort: 'name' });
        if (!cancelled) { setHeroes(list || []); setHeroesUpdatedAt(new Date()); }
      } finally { if (!cancelled) setLoadingHeroes(false); }
    })();
    (async () => {
      try {
        setLoadingNews(true);
        const res = await getNews();
        const items = Array.isArray(res) ? res : (res?.data || []);
        if (!cancelled) { setNews(items); setNewsUpdatedAt(new Date()); }
      } finally { if (!cancelled) setLoadingNews(false); }
    })();
    return () => { cancelled = true; };
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

  const trendingHeroes = useMemo(() => {
    const list = (heroes || []).slice();
    // Sort by winRate desc then pickRate desc
    list.sort((a, b) => (b.winRate||0) - (a.winRate||0) || (b.pickRate||0) - (a.pickRate||0));
    return list.slice(0, 12);
  }, [heroes]);

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

  const topCounters = useMemo(() => {
    // Heuristic: top heroes by winRate, annotate with goodAgainst list
    const list = (heroes || []).slice().sort((a,b) => (b.winRate||0) - (a.winRate||0) || (b.pickRate||0) - (a.pickRate||0));
    return list.slice(0, 8);
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[{icon:<BoltIcon size={22}/>,label:t('nav.meta','Meta'),href:'/meta'},{icon:<WhatshotIcon size={22}/>,label:t('nav.arcana','Arcana'),href:'/arcana'},{icon:<ConstructionIcon size={22}/>,label:t('nav.equipment','Equipment'),href:'/equipment'},{icon:<ArticleIcon size={22}/>,label:t('nav.news','News'),href:'/news'}].map(link => (
          <Grid item xs={3} sm={3} key={link.label}>
      <Box
              component={Link}
              to={link.href}
              sx={{
                textDecoration:'none',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:1,
                p:2,
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

      {/* Trending Heroes + Surprise Me and timestamp */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color:'text.primary' }}>{t('home.trending', 'Trending Heroes')}</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Typography variant="caption" color="text.secondary">{t('home.updated', 'Updated')} {timeAgoRaw(heroesUpdatedAt, t)}</Typography>
          <Button variant="outlined" size="small" onClick={onSurprise} startIcon={<CasinoIcon/>}>{t('home.surprise','Surprise me')}</Button>
        </Box>
      </Box>
      {loadingHeroes ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 6 }).map((_,i)=>(
            <Grid item xs={6} sm={4} md={2} key={i}><Skeleton variant="rectangular" height={140} /></Grid>
          ))}
        </Grid>
      ) : (
        <Swiper modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={2} breakpoints={{ 600:{slidesPerView:3}, 900:{slidesPerView:5}, 1200:{slidesPerView:6} }} pagination={{ clickable: true }} autoplay={{ delay: 3000, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
          {trendingHeroes.map(h => (
            <SwiperSlide key={h._id}>
              <Card component={Link} to={`/heroes/${getHeroSlug(h)}`} sx={{ textDecoration:'none', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                {h.image ? <CardMedia component="img" height="120" image={h.image} alt={h.name} /> : <Skeleton variant="rectangular" height={120} />}
                <CardContent sx={{ p:1 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>{h.name}</Typography>
                  <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.5 }}>
                    {h.winRate!=null && (
                      <Chip size="small" label={`${t('win_rate','Win Rate')} ${h.winRate}%`} color={h.winRate>=50?'success':'default'} sx={{ '& .MuiChip-label': { px: 0.5, fontSize: 11 } }} />
                    )}
                    {h.pickRate!=null && (
                      <Chip size="small" label={`${t('pick_rate','Pick Rate')} ${h.pickRate}%`} sx={{ '& .MuiChip-label': { px: 0.5, fontSize: 11 } }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Patch highlights */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color:'text.primary' }}>{t('home.patchHighlights','Patch highlights')}</Typography>
  <Typography variant="caption" color="text.secondary">{t('home.updated','Updated')} {timeAgoRaw(newsUpdatedAt, t)}</Typography>
      </Box>
      {loadingNews ? (
        <Skeleton variant="rectangular" height={160} sx={{ mb: 3 }} />
      ) : patchHighlight ? (
  <Card sx={{ mb: 3, border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <Grid container>
            <Grid item xs={12} sm={4}>
              {patchHighlight.thumbnail || patchHighlight.image ? (
                <CardMedia component="img" height="100%" image={patchHighlight.thumbnail || patchHighlight.image} alt={patchHighlight.title} sx={{ height: { xs: 160, sm: '100%' }, objectFit: 'cover' }} />
              ) : (<Skeleton variant="rectangular" height={160} />)}
            </Grid>
            <Grid item xs={12} sm={8}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>{patchHighlight.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {patchHighlight.excerpt || patchHighlight.description || ''}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button component={Link} to="/news" size="small">{t('home.viewFull','View full')}</Button>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      ) : null}

      {/* Magazine grid of latest news */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={800}>{t('home.latestNews','Latest news')}</Typography>
      </Box>
      {loadingNews ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 8 }).map((_,i)=>(
            <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rectangular" height={180} /></Grid>
          ))}
        </Grid>
      ) : (
        isMobile ? (
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={2.1} pagination={{ clickable: true }} autoplay={{ delay: 3500, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
            {latestNews.map(item => (
              <SwiperSlide key={item._id}>
                <Card component={Link} to="/news" sx={{ position:'relative', textDecoration:'none', border:'1px solid', borderColor:'divider', boxShadow:1 }}>
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
            {latestNews.map(item => (
              <Grid item xs={12} sm={6} md={3} key={item._id}>
                <Card component={Link} to="/news" sx={{ position:'relative', textDecoration:'none', border:'1px solid', borderColor:'divider', boxShadow:1 }}>
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

      {/* Top counters this week */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h5" fontWeight={800}>{t('home.topCounters','Top counters this week')}</Typography>
      </Box>
      {loadingHeroes ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {Array.from({ length: 8 }).map((_,i)=>(
            <Grid item xs={6} sm={3} md={3} lg={1.5} key={i}><Skeleton variant="rectangular" height={140} /></Grid>
          ))}
        </Grid>
      ) : (
        isMobile ? (
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={12} slidesPerView={2.2} pagination={{ clickable: true }} autoplay={{ delay: 3500, disableOnInteraction: false }} style={{ marginBottom: 24 }}>
            {topCounters.map(h => (
              <SwiperSlide key={h._id}>
                <Card sx={{ border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                  {h.image ? (<CardMedia component="img" height={120} image={h.image} alt={h.name} />) : (<Skeleton variant="rectangular" height={120} />)}
                  <CardContent sx={{ p:1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{h.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{t('win_rate','Win Rate')} {h.winRate ?? '-'}% • {t('pick_rate','Pick Rate')} {h.pickRate ?? '-' }%</Typography>
                    {Array.isArray(h.goodAgainst) && h.goodAgainst.length > 0 && (
                      <Box sx={{ mt: 0.5, display:'flex', flexWrap:'wrap', gap:0.5 }}>
                        {(h.goodAgainst.slice(0,3)).map(g => {
                          const id = typeof g === 'string' ? g : (g.hero?._id || g.hero || g._id);
                          const hero = heroes.find(x => x._id === id);
                          return hero ? (<Chip key={id} size="small" label={hero.name} />) : null;
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Grid container spacing={2} sx={{ mb: 6 }}>
            {topCounters.map(h => (
              <Grid item xs={6} sm={3} md={3} lg={1.5} key={h._id}>
                <Card sx={{ border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                  {h.image ? (<CardMedia component="img" height={120} image={h.image} alt={h.name} />) : (<Skeleton variant="rectangular" height={120} />)}
                  <CardContent sx={{ p:1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{h.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{t('win_rate','Win Rate')} {h.winRate ?? '-'}% • {t('pick_rate','Pick Rate')} {h.pickRate ?? '-' }%</Typography>
                    {Array.isArray(h.goodAgainst) && h.goodAgainst.length > 0 && (
                      <Box sx={{ mt: 0.5, display:'flex', flexWrap:'wrap', gap:0.5 }}>
                        {(h.goodAgainst.slice(0,3)).map(g => {
                          const id = typeof g === 'string' ? g : (g.hero?._id || g.hero || g._id);
                          const hero = heroes.find(x => x._id === id);
                          return hero ? (<Chip key={id} size="small" label={hero.name} />) : null;
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
    </Container>
  );
};

export default Home;