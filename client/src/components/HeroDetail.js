import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './SwiperCustom.css';
import { asDangerousHtml } from '../utils/sanitizeHtml';

// Import lane icons, effect images, and role icons
import farmLaneIcon from '../assets/images/lanes/Farm_Lane.png';
import jungleIcon from '../assets/images/lanes/Jungle.png';
import midLaneIcon from '../assets/images/lanes/Mid_Lane.png';
import roamIcon from '../assets/images/lanes/Roam.png';
import abyssalLaneIcon from '../assets/images/lanes/Abyssal_Lane.png';
import ef1Image from '../assets/images/ef1.jpg';
import ef2Image from '../assets/images/ef2.jpg';
import marksmanIcon from '../assets/images/roles/Marksman.png';
import mageIcon from '../assets/images/roles/Mage.png';
import tankIcon from '../assets/images/roles/Tank.png';
import supportIcon from '../assets/images/roles/Support.png';
import assassinIcon from '../assets/images/roles/Assassin.png';
import fighterIcon from '../assets/images/roles/Fighter.png';



const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

// Client-side slugify to mirror server logic
function slugify(input) {
  if (!input) return '';
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const SkillTabs = ({ skills }) => {
  const [selected, setSelected] = useState(0);
  if (!skills || skills.length === 0) return null;
  return (
    <>
      <Box display="flex" gap={{ xs: 2, md: 4 }} mb={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
        {skills.map((skill, idx) => (
          <Box key={idx} onClick={() => setSelected(idx)} sx={{
            cursor: 'pointer',
            border: selected === idx ? { xs: '2px solid #C9A063', md: '4px solid #C9A063' } : { xs: '2px solid transparent', md: '4px solid transparent' },
            borderRadius: '50%',
            transition: 'border 0.2s',
            p: { xs: 0.5, md: 1 },
            bgcolor: 'none',
            boxShadow: selected === idx ? '0 0 0 4px #fff6, 0 2px 8px #C9A06344' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={skill.icon}
              alt={skill.name}
              style={{
                width: window.innerWidth < 600 ? 48 : 72,
                height: window.innerWidth < 600 ? 48 : 72,
                borderRadius: '50%'
              }}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{
        minHeight: { xs: 60, md: 80 },
        transition: 'opacity 0.4s, transform 0.4s',
        opacity: 1,
        transform: 'translateY(0)',
      }}>
        <Typography fontWeight={600} fontSize={{ xs: 18, md: 24 }} sx={{ mt: { xs: 1, md: 2 } }}>{skills[selected].name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>{skills[selected].description}</Typography>
      </Box>
    </>
  );
};

const HeroDetail = () => {
  const { slug } = useParams();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedEqBuild, setSelectedEqBuild] = useState(1);
  const [selectedArcanaIdx, setSelectedArcanaIdx] = useState(0);
  const [sameRoleHeroes, setSameRoleHeroes] = useState([]);
  const [topWinHeroes, setTopWinHeroes] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${API_URL}/api/heroes/slug/${slug}`);
        if (!res.ok) throw new Error(t('hero.not_found'));
        const response = await res.json();
        // Handle new API response format
        const heroData = response.success ? response.data : response;
        setHero(heroData);
      } catch (err) {
        console.error('Error fetching hero:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, [slug, t]);

  // After loading hero, redirect to canonical slug if needed
  useEffect(() => {
    if (!hero || !hero.name) return;
    const canonical = slugify(hero.name);
    if (canonical && canonical !== slug) {
      navigate(`/heroes/${canonical}`, { replace: true });
    }
  }, [hero, slug, navigate]);

  // Ensure selected build indices are valid after hero loads
  useEffect(() => {
    if (!hero) return;
    const availableEqBuilds = [1,2,3].filter(b => (hero.suggestedEquipment||[]).some(e => (e.build||1) === b));
    if (availableEqBuilds.length > 0) {
      setSelectedEqBuild(prev => availableEqBuilds.includes(prev) ? prev : availableEqBuilds[0]);
    }
    if (Array.isArray(hero.arcanaBuilds) && hero.arcanaBuilds.length > 0) {
      setSelectedArcanaIdx(prev => (prev >= 0 && prev < hero.arcanaBuilds.length) ? prev : 0);
    }
  }, [hero]);

  // Sidebar data: same-role heroes and top win-rate heroes
  useEffect(() => {
    const abort = new AbortController();
    if (!hero) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;
    const role = Array.isArray(hero.roles) && hero.roles.length > 0 ? hero.roles[0] : undefined;
    const fetchData = async () => {
      try {
        // Always fetch same-role heroes (used on mobile row and desktop sidebar)
        if (role) {
          const sameUrl = `${API_URL}/api/heroes?role=${encodeURIComponent(role)}&sort=winRate&limit=10`;
          const sameRes = await fetch(sameUrl, { signal: abort.signal }).then(r => r.ok ? r.json() : null).catch(() => null);
          const normalize = (json) => {
            const raw = json && json.success ? json.data : json;
            return Array.isArray(raw) ? raw : [];
          };
          const data = normalize(sameRes);
          setSameRoleHeroes(data.filter(h => h && h.slug !== hero.slug));
        }
        // Only fetch top win-rate list on desktop/tablet (sidebar visible)
        if (!isMobile) {
          const topUrl = `${API_URL}/api/heroes?sort=winRate&limit=10`;
          const topRes = await fetch(topUrl, { signal: abort.signal }).then(r => r.ok ? r.json() : null).catch(() => null);
          const rawTop = topRes && topRes.success ? topRes.data : topRes;
          const topData = Array.isArray(rawTop) ? rawTop : [];
          setTopWinHeroes(topData.filter(h => h && h.slug !== hero.slug));
        }
      } catch (_) {
        // ignore
      }
    };
    fetchData();
    return () => abort.abort();
  }, [hero]);

  // Latest news row
  useEffect(() => {
    const abort = new AbortController();
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news?sort=latest&limit=6`, { signal: abort.signal });
        const json = await res.json();
        const data = json && json.success ? json.data : json;
        setLatestNews(Array.isArray(data) ? data : []);
      } catch (_) {
        // ignore
      }
    };
    fetchNews();
    return () => abort.abort();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  if (!hero) return null;

  const roleIcons = {
    Marksman: <img src={marksmanIcon} alt="Marksman" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Mage: <img src={mageIcon} alt="Mage" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Tank: <img src={tankIcon} alt="Tank" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Support: <img src={supportIcon} alt="Support" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Assassin: <img src={assassinIcon} alt="Assassin" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Fighter: <img src={fighterIcon} alt="Fighter" style={{ width: 16, height: 16, marginRight: 4 }} />,
  };
  const laneIcons = {
    'Farm Lane': <img src={farmLaneIcon} alt="Farm Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Jungle': <img src={jungleIcon} alt="Jungle" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Mid Lane': <img src={midLaneIcon} alt="Mid Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Roam': <img src={roamIcon} alt="Abyssal Dragon Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Abyssal Lane': <img src={abyssalLaneIcon} alt="Dark Slayer Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
  };

  return (
    <>
  <Box sx={{ position: 'relative', px: { xs: 2, md: 4 } }}>
      {/* Decorative Background Elements */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* ef1 - Top Right Decoration */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          backgroundImage: `url(${ef1Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.15,
          transform: 'rotate(15deg)',
          animation: 'float 6s ease-in-out infinite'
        }} />

        {/* ef2 - Bottom Left Decoration */}
        <Box sx={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: '350px',
          height: '350px',
          backgroundImage: `url(${ef2Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.12,
          transform: 'rotate(-10deg)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        {/* ef1 - Middle Right (smaller) */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          width: '200px',
          height: '200px',
          backgroundImage: `url(${ef1Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.08,
          transform: 'rotate(-25deg)',
          animation: 'float 10s ease-in-out infinite'
        }} />


      </Box>

      {/* Hero Banner Section */}
      <Box sx={{
        position: 'relative',
        minHeight: { xs: 200, md: 320 },
  background: `linear-gradient(180deg, rgba(60,20,20,0.7) 0%, rgba(60,20,20,0.2) 60%, #fff 100%), url(${hero.image}) left center/cover no-repeat`,
        borderRadius: { xs: 0, md: 6 },
        overflow: 'hidden',
        mb: { xs: 2, md: 3 },
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        pt: { xs: 3, md: 6 },
        mt: { xs: 3, md: 6 },
        width: { xs: '100%', md: '66%' },
        mr: { xs: 0, md: 'auto' },
        ml: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '120px',
          height: '120px',
          backgroundImage: `url(${ef1Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.2,
          transform: 'rotate(25deg)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'float 8s ease-in-out infinite'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '80px',
          height: '80px',
          backgroundImage: `url(${ef2Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          transform: 'rotate(-15deg)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'float 6s ease-in-out infinite reverse'
        }
      }}>
        <Box sx={{
          position: 'absolute',
          left: { xs: 12, md: 48 },
          bottom: { xs: 16, md: 48 },
          zIndex: 2,
          color: '#fff',
        }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ textShadow: '0 2px 12px #000', fontSize: { xs: '1.3rem', md: '2.2rem' } }}
          >
            {hero.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{ textShadow: '0 2px 8px #000', mb: 1, fontSize: { xs: '0.85rem', md: '1rem' } }}
          >
            {hero.title}
          </Typography>
          <Box display="flex" gap={{ xs: 0.5, md: 1 }} flexWrap="wrap" mb={1}>
            {hero.roles && hero.roles.map((role) => (
              <Chip
                key={role}
                icon={roleIcons[role] || null}
                label={t(`roles.${role}`, role)}
                sx={{
                  bgcolor: '#C9A063',
                  color: '#7b2ff2',
                  fontWeight: 600,
                  fontSize: { xs: 10, md: 16 },
                  height: { xs: 20, md: 32 }
                }}
              />
            ))}
            {hero.lanes && hero.lanes.map((lane) => (
              <Chip
                key={lane}
                icon={laneIcons[lane] || null}
                label={t(`lanes.${lane}`, lane)}
                sx={{
                  bgcolor: '#C9A063',
                  color: '#00796b',
                  fontWeight: 600,
                  fontSize: { xs: 10, md: 16 },
                  height: { xs: 20, md: 32 }
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
      {/* Stats Section with Diamond separator */}
  <Box display="flex" justifyContent="flex-start" alignItems="center" gap={0} mb={{ xs: 2, md: 3 }} flexWrap="wrap" sx={{
        borderRadius: 12,
        background: 'none',
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 2 },
        width: '100%',
      }}>
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>Meta Tier</Typography>
          <Typography variant="h5" fontWeight={700} color="#ff9800" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>{hero.metaTier || '-'}</Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>Win Rate</Typography>
          <Typography variant="h5" fontWeight={700} color="#43a047" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>{hero.winRate ? `${hero.winRate}%` : '-'}</Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>Pick Rate</Typography>
          <Typography variant="h5" fontWeight={700} color="#1976d2" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>{hero.pickRate ? `${hero.pickRate}%` : '-'}</Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>Ban Rate</Typography>
          <Typography variant="h5" fontWeight={700} color="#d32f2f" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>{hero.banRate ? `${hero.banRate}%` : '-'}</Typography>
        </Box>
      </Box>
  {/* Main content + Sidebar */}
      <Box
        display={{ xs: 'block', md: 'grid' }}
        gridTemplateColumns={{ md: 'minmax(0, 2fr) minmax(0, 1fr)' }}
        columnGap={{ md: 3 }}
        alignItems="stretch"
        sx={{ width: '100%', mb: { xs: 2, md: 4 } }}
      >
        {/* LEFT: Main content */}
        <Box>
      {/* Allies & Counters */}
  <Box mb={{ xs: 2, md: 3 }} sx={{
        background: 'none',
        borderRadius: { xs: 3, md: 6 },
        border: '1.5px solid rgba(201,160,99,0.35)',
        boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
        backdropFilter: 'blur(12px)',
        p: { xs: 2, md: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          backgroundImage: `url(${ef2Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          transform: 'rotate(45deg)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={{ xs: 2, md: 4 }}>
          {/* Allies */}
          <Box flex={1}>
            <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#43a047', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('heroes.allies', 'Allies')}</Typography>
            <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap" alignItems="center">
              {hero.allies && hero.allies.map((ally) => (
                <Box
                  key={ally._id || ally.id}
                  onClick={() => navigate(`/heroes/${ally.slug}`)}
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      '& .hero-image': {
                        boxShadow: '0 12px 24px rgba(67, 160, 71, 0.4)',
                        borderColor: '#43a047'
                      },
                      '& .hero-name': {
                        color: '#43a047'
                      }
                    }
                  }}
                >
                  <Box
                    className="hero-image"
                    sx={{
                      width: { xs: 50, md: 70 },
                      height: { xs: 50, md: 70 },
                      borderRadius: { xs: 1, md: '50%' },
                      overflow: 'hidden',
                      border: { xs: '2px solid rgba(67, 160, 71, 0.3)', md: '3px solid rgba(67, 160, 71, 0.3)' },
                      boxShadow: '0 4px 12px rgba(67, 160, 71, 0.2)',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(67, 160, 71, 0.1), rgba(67, 160, 71, 0.05))',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        borderRadius: { xs: 1, md: '50%' },
                        zIndex: 1
                      }
                    }}
                  >
                    <img
                      src={ally.image}
                      alt={ally.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Typography
                    className="hero-name"
                    fontWeight={600}
                    fontSize={{ xs: 10, md: 13 }}
                    sx={{
                      mt: { xs: 0.5, md: 1 },
                      maxWidth: { xs: 50, md: 70 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.3s ease',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {ally.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {/* Counters (Khắc chế bởi) */}
          <Box flex={1}>
            <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#d32f2f', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('counter', 'Countered by')}</Typography>
            <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap" alignItems="center">
              {hero.counters && hero.counters.map((counter) => (
                <Box
                  key={counter._id || counter.id}
                  onClick={() => navigate(`/heroes/${counter.slug}`)}
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      '& .hero-image': {
                        boxShadow: '0 12px 24px rgba(211, 47, 47, 0.4)',
                        borderColor: '#d32f2f'
                      },
                      '& .hero-name': {
                        color: '#d32f2f'
                      }
                    }
                  }}
                >
                  <Box
                    className="hero-image"
                    sx={{
                      width: { xs: 50, md: 70 },
                      height: { xs: 50, md: 70 },
                      borderRadius: { xs: 1, md: '50%' },
                      overflow: 'hidden',
                      border: { xs: '2px solid rgba(211, 47, 47, 0.3)', md: '3px solid rgba(211, 47, 47, 0.3)' },
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.05))',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        borderRadius: { xs: 1, md: '50%' },
                        zIndex: 1
                      }
                    }}
                  >
                    <img
                      src={counter.image}
                      alt={counter.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Typography
                    className="hero-name"
                    fontWeight={600}
                    fontSize={{ xs: 10, md: 13 }}
                    sx={{
                      mt: { xs: 0.5, md: 1 },
                      maxWidth: { xs: 50, md: 70 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.3s ease',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {counter.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Good Against */}
          {hero.goodAgainst && hero.goodAgainst.length > 0 && (
            <Box mt={{ xs: 2, md: 0 }} flex={1}>
              <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#43a047', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('heroes.goodAgainst', 'Good Against')}</Typography>
              <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap" alignItems="center">
                {hero.goodAgainst.map((ga) => (
                  <Box
                    key={ga._id || ga.id}
                    onClick={() => navigate(`/heroes/${ga.slug}`)}
                    sx={{ cursor: 'pointer', textAlign: 'center' }}
                  >
                    <Box sx={{ width: { xs: 50, md: 70 }, height: { xs: 50, md: 70 }, borderRadius: { xs: 1, md: '50%' }, overflow: 'hidden', border: { xs: '2px solid rgba(67, 160, 71, 0.3)', md: '3px solid rgba(67, 160, 71, 0.3)' } }}>
                      <img src={ga.image} alt={ga.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Typography fontWeight={600} fontSize={{ xs: 10, md: 13 }} sx={{ mt: { xs: 0.5, md: 1 }, maxWidth: { xs: 50, md: 70 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ga.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

        </Box>
      </Box>
  {/* Skills */}
  <Box mb={{ xs: 2, md: 3 }} sx={{
        background: 'none',
        borderRadius: { xs: 3, md: 6 },
        border: '1.5px solid rgba(201,160,99,0.35)',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
        backdropFilter: 'blur(12px)',
        p: { xs: 2, md: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '60px',
          height: '60px',
          backgroundImage: `url(${ef1Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
          transform: 'rotate(-30deg)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        <Typography variant="h5" sx={{ mt: { xs: 1, md: 2 }, mb: 1, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>{t('hero.skills', 'Skills')}</Typography>
        {/* Skills Horizontal Selector */}
        <SkillTabs skills={hero.skills} />
      </Box>
  {/* Suggested Equipment */}
      {hero.suggestedEquipment && hero.suggestedEquipment.length > 0 && (
  <Box mb={{ xs: 2, md: 3 }} sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>{t('hero.suggestedEquipment', 'Trang bị gợi ý')}</Typography>
          {/* Build toggle */}
          {(() => {
            const availableEqBuilds = [1,2,3].filter(b => (hero.suggestedEquipment||[]).some(e => (e.build||1) === b));
            if (availableEqBuilds.length <= 1) return null;
            return (
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={selectedEqBuild}
                onChange={(e, v) => v && setSelectedEqBuild(v)}
                sx={{ mb: 1, flexWrap: 'wrap' }}
              >
                {availableEqBuilds.map(b => (
                  <ToggleButton key={b} value={b} sx={{ px: 1.5 }}>{t('hero.equipmentSet', { number: b, defaultValue: `Bộ ${b}` })}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            );
          })()}

          {/* Only render selected build */}
          {(() => {
            const group = (hero.suggestedEquipment||[]).filter(e => (e.build||1) === selectedEqBuild);
            if (group.length === 0) return null;
            return (
              <Box key={`build-${selectedEqBuild}`} sx={{ mb:0 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                  {t('hero.equipmentSet', { number: selectedEqBuild, defaultValue: `Bộ ${selectedEqBuild}` })}
                </Typography>
                <Box sx={{
                  display:'flex',
                  flexDirection:'row',
                  gap:{ xs: 1, md: 1.5 },
                  flexWrap:{ xs: 'nowrap', md: 'wrap' },
                  alignItems:'stretch',
                  overflowX:{ xs: 'auto', md: 'visible' },
                  pb: { xs: 0.5, md: 0 }
                }}>
                  {group.map((eq, idx) => (
                    <Box key={eq._id || idx} sx={{ width:{ xs: 56, md: 90 }, textAlign:'center', flex: '0 0 auto' }}>
                      <Box sx={{ width:'100%', aspectRatio:'1/1', borderRadius: 2, overflow:'hidden', border:'1px solid rgba(201,160,99,0.25)', mb:0.5 }}>
                        <img src={eq.image} alt={eq.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight:700, fontSize:{ xs:10, md:13 }, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={eq.name}>{eq.name}</Typography>
                      {typeof eq.price === 'number' && (
                        <Typography variant="caption" color="text.secondary">{eq.price}</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </Box>
      )}
  {/* ...existing code... */}
  {/* Arcana Builds section below */}
  {hero.arcanaBuilds && hero.arcanaBuilds.length > 0 && (
  <Box mb={{ xs: 2, md: 3 }} sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
  <Typography variant="h5" sx={{ mb: 1.5 }}>{t('hero.suggestedArcanaBuilds', 'Arcana gợi ý')}</Typography>
          {/* Arcana build toggle */}
          {hero.arcanaBuilds.length > 1 && (
            <Box sx={{ mb: 1, overflowX: 'auto' }}>
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={selectedArcanaIdx}
                onChange={(e, v) => (v !== null) && setSelectedArcanaIdx(v)}
                sx={{ flexWrap: 'nowrap' }}
              >
                {hero.arcanaBuilds.map((b, idx) => (
                  <ToggleButton key={idx} value={idx} sx={{ px: 1.5 }}>
                    {b.name || `${t('build','Build')} ${idx+1}`}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Only selected arcana build */}
          {(() => {
            const build = hero.arcanaBuilds[selectedArcanaIdx] || hero.arcanaBuilds[0];
            if (!build) return null;
            return (
              <Box key={selectedArcanaIdx} sx={{ mb:0, p:2, border:'1px solid rgba(201,160,99,0.25)', borderRadius:2 }}>
                <Typography variant="h6" sx={{ fontSize:{ xs:'1rem', md:'1.25rem' }, mb:1 }}>{build.name}</Typography>
                <Box sx={{ display:'flex', flexDirection:{ xs:'column', md:'row' }, gap:2, alignItems:{ xs:'stretch', md:'flex-start' } }}>
                  <Box sx={{
                    flex:1,
                    display:'flex',
                    flexDirection:'row',
                    gap:{ xs: 1, md: 2 },
                    flexWrap:{ xs: 'nowrap', md: 'wrap' },
                    justifyContent:'flex-start',
                    alignItems:'flex-end',
                    overflowX:{ xs: 'auto', md: 'visible' },
                    pb: { xs: 0.5, md: 0 }
                  }}>
                {build.items && build.items.length > 0 ? build.items.map((it, iIdx) => {
                  // Prefer flattened fields returned by API; fallback to nested arcana object
                  const arc = it._id ? it : (it.arcana || {});
                  const name = arc.name;
                  const image = arc.image;
                  const color = arc.color;
                  const colorLabel = color ? t(`arcana.colors.${color}`, color) : '';
                  return (
                    <Box key={iIdx} sx={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:{ xs: 50, md: 70 }, flex: '0 0 auto' }}>
                      {image ? (
                        <>
                          <img src={image} alt={name || 'Arcana'} style={{ width: (typeof window !== 'undefined' && window.innerWidth < 600) ? 36 : 48, height: (typeof window !== 'undefined' && window.innerWidth < 600) ? 36 : 48, objectFit:'cover', borderRadius: (typeof window !== 'undefined' && window.innerWidth < 600) ? 6 : 8, marginBottom:4 }} />
                          {name && <Typography variant="body2" sx={{ fontWeight:600, textAlign:'center' }}>{name}</Typography>}
                          {color && <Chip label={colorLabel} size="small" sx={{ bgcolor: color === 'red' ? '#ffcccc' : color === 'green' ? '#ccffcc' : '#cce5ff', color: '#333', mb:0.5 }} />}
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ fontStyle:'italic', color:'text.secondary', py:2 }}>{t('no_data','Không có dữ liệu')}</Typography>
                      )}
                      <Typography variant="caption" sx={{ textAlign:'center', color:'#C9A063', fontWeight:700 }}>x{it.count}</Typography>
                    </Box>
                  );
                }) : (
                  <Typography variant="body2" sx={{ fontStyle:'italic', color:'text.secondary', py:2 }}>{t('no_data','Không có dữ liệu')}</Typography>
                )}
                  </Box>
                  {build.description && (
                    <Box sx={{ minWidth:{ md: 260 }, maxWidth:{ md: 320 }, borderLeft:{ md:'1px solid rgba(201,160,99,0.25)' }, pl:{ md:2 }, pt:{ xs:1, md:0 } }}>
                      <Typography variant="subtitle2" sx={{ mb:0.5 }}>{t('description','Mô tả')}</Typography>
                      <Typography variant="body2" sx={{ color:'text.secondary' }} dangerouslySetInnerHTML={asDangerousHtml(build.description)} />
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })()}
        </Box>
      )}
  {/* Combo Kill */}
      {hero.combo && hero.combo.length > 0 && (
  <Box mb={{ xs: 2, md: 3 }} sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
          <Typography variant="h5" sx={{ mb: 2 }}>{t('heroes.combo', 'Combo Kill')}</Typography>
          {hero.combo.map((step, idx) => (
            <Box key={idx} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2}>
              <Typography variant="subtitle2" sx={{ minWidth: 72 }}>
                Combo {idx + 1}
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                {step.skills && step.skills.length > 0 ? step.skills.map((skillIdx, sidx) => {
                  const BASIC_ATTACK_INDEX = 5; // must match form constant
                  const isBasic = skillIdx === BASIC_ATTACK_INDEX;
                  const skill = !isBasic ? hero.skills[skillIdx] : null;
                  const skillOrderLabels = ['Nội tại', 'Chiêu 1', 'Chiêu 2', 'Chiêu 3', 'Chiêu 4'];
                  const orderLabel = isBasic ? 'Đánh thường' : (skillOrderLabels[skillIdx] || `Skill ${skillIdx+1}`);
                  return (
                    <React.Fragment key={sidx}>
                      <Box sx={{ textAlign: 'center', mr: 0.5 }}>
                        {isBasic ? (
                          <Box title={orderLabel} sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,160,99,0.12)', fontSize: 22 }}>
                            🗡️
                          </Box>
                        ) : skill ? (
                          <img
                            src={skill.icon}
                            alt={skill.name}
                            title={skill.name || orderLabel}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'none' }}
                          />
                        ) : (
                          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>?</Box>
                        )}
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.3, fontSize: 10, lineHeight: 1.1 }}>
                          {isBasic ? 'BA' : (skillIdx === 0 ? 'P' : skillIdx)}
                        </Typography>
                      </Box>
                      {sidx < step.skills.length - 1 && (
                        <Typography component="span" sx={{ mx: 0.5, fontWeight: 600 }}>+</Typography>
                      )}
                    </React.Fragment>
                  );
                }) : (
                  <Typography variant="body2" color="text.secondary">(Không có kỹ năng)</Typography>
                )}
              </Box>
              {step.description && (
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {step.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
  {/* Skins Slider - SwiperJS */}
  <Box mb={{ xs: 2, md: 3 }} sx={{
        background: 'none',
        borderRadius: { xs: 3, md: 6 },
        boxShadow: '0 8px 32px 0 rgba(139, 115, 85, 0.15)',
        backdropFilter: 'blur(12px)',
        p: { xs: 2, md: 3 },
        position: 'relative',
        overflow: 'visible',
        border: '1px solid rgba(139, 115, 85, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '100px',
          backgroundImage: `url(${ef2Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        <Typography variant="h5" sx={{ mt: { xs: 1, md: 2 }, mb: 1, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>{t('hero.skins', 'Skins')}</Typography>
        <Swiper
          modules={[EffectCoverflow, Navigation, Pagination]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={window.innerWidth < 600 ? 1 : 3}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2.5,
            slideShadows: false,
          }}
          navigation={window.innerWidth >= 600}
          pagination={{ clickable: true }}
          style={{ width: '100%', paddingBottom: window.innerWidth < 600 ? 20 : 40 }}
        >
          {hero.skins && hero.skins.map((skin, idx) => (
            <SwiperSlide key={idx}>
              {({ isActive, isPrev, isNext }) => {
                const show = isActive || isPrev || isNext;
                return (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1, md: 2 },
                    opacity: show ? 1 : 0,
                    pointerEvents: show ? 'auto' : 'none',
                    visibility: show ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s, visibility 0.3s',
                  }}>
                    <img
                      src={skin.image}
                      alt={skin.name}
                      style={{
                        width: window.innerWidth < 600 ? 280 : 400,
                        height: window.innerWidth < 600 ? 175 : 250,
                        objectFit: 'cover',
                        borderRadius: window.innerWidth < 600 ? 12 : 18,
                        boxShadow: isActive ? '0 8px 24px rgba(139, 115, 85, 0.3)' : '0 4px 12px rgba(139, 115, 85, 0.15)',
                        marginBottom: window.innerWidth < 600 ? 8 : 16,
                        opacity: isActive ? 1 : 0.2,
                        transition: 'opacity 0.3s, box-shadow 0.3s'
                      }}
                    />
                    <Box
                      className="skin-name-swiper"
                      sx={{
                        mt: { xs: 1, md: 2 },
                        fontWeight: 700,
                        fontSize: { xs: 18, md: 28 },
                        color: isActive ? '#C9A063' : '#bbb',
                        textAlign: 'center',
                        opacity: isActive ? 1 : 0.5,
                        transition: 'opacity 0.3s, color 0.3s'
                      }}
                    >
                      {skin.name}
                    </Box>
                  </Box>
                );
              }}
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
  {/* Lore & Origin */}
  <Box mb={{ xs: 2, md: 3 }} sx={{
        background: `
          none
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backdropFilter: 'blur(10px)',
        borderRadius: { xs: 3, md: 6 },
        p: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative elements for lore section */}
        <Box sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '40px',
          height: '40px',
          backgroundImage: `url(${ef1Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.06,
          transform: 'rotate(45deg)',
          animation: 'gentleRotate 12s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <Box sx={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '35px',
          height: '35px',
          backgroundImage: `url(${ef2Image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.05,
          transform: 'rotate(-30deg)',
          animation: 'decorativePulse 10s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-line',
            color: '#333',
            fontSize: { xs: 14, md: 18 },
            lineHeight: 1.8,
            position: 'relative',
            zIndex: 10,
            fontWeight: 400
          }}
        >
          {hero.lore}
        </Typography>
        {hero.origin && (
          <Typography
            variant="subtitle1"
            sx={{
              mt: 2,
              color: '#7b2ff2',
              fontWeight: 600,
              position: 'relative',
              zIndex: 10
            }}
          >
            {t('hero.origin', 'Origin')}: {hero.origin}
          </Typography>
        )}
      </Box>
        </Box>

  {/* RIGHT: Sidebar (hidden on mobile) */}
  <Box sx={{ display: { xs: 'none', md: 'block' }, mt: { xs: 2, md: '-490px' }, mb: { xs: 2, md: 2 } }}>
          <Box sx={{
            background: 'none',
            borderRadius: 3,
            border: '1.5px solid rgba(201,160,99,0.35)',
            boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
            backdropFilter: 'blur(12px)',
            p: 2,
            pt: { xs: 2, md: '10px' },
            display: 'block'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Same-role heroes */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{t('heroes.sameRole', 'Tướng cùng vai trò')}</Typography>
                {sameRoleHeroes && sameRoleHeroes.length > 0 ? sameRoleHeroes.map(h => (
                  <Box
                    key={h.slug}
                    onClick={() => navigate(`/heroes/${h.slug}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1,
                      cursor: 'pointer',
                      p: 1,
                      pr: 1.5,
                      border: '1px solid rgba(201,160,99,0.35)',
                      background: 'rgba(201,160,99,0.06)',
                      borderRadius: 3,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(201,160,99,0.2)' }
                    }}
                  >
                    <Box sx={{ width: 52, height: 52, borderRadius: 2, overflow: 'hidden', flex: '0 0 auto' }}>
                      <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</Typography>
                      {Array.isArray(h.roles) && h.roles.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.roles.join(', ')}</Typography>
                      )}
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">{t('no_data','Không có dữ liệu')}</Typography>
                )}
              </Box>

              {/* Top win-rate heroes */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{t('heroes.topWinRate', 'Tướng tỉ lệ thắng cao')}</Typography>
                {topWinHeroes && topWinHeroes.length > 0 ? (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1
                  }}>
                    {topWinHeroes.map(h => (
                      <Box
                        key={h.slug}
                        onClick={() => navigate(`/heroes/${h.slug}`)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          p: 1,
                          pr: 1.5,
                          border: '1px solid rgba(201,160,99,0.35)',
                          background: 'rgba(201,160,99,0.06)',
                          borderRadius: 3,
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(201,160,99,0.2)' }
                        }}
                      >
                        <Box sx={{ width: 52, height: 52, borderRadius: 2, overflow: 'hidden', flex: '0 0 auto' }}>
                          <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{h.winRate ? `${h.winRate}% ${t('winRate','Win Rate')}` : '-'}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">{t('no_data','Không có dữ liệu')}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

    </Box>

    {/* Mobile: Same-role heroes horizontal list (above news) */}
    {sameRoleHeroes && sameRoleHeroes.length > 0 && (
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, md: 6 },
        mb: { xs: 2, md: 0 },
        display: { xs: 'block', md: 'none' }
      }}>
        <Box sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{t('heroes.sameRole', 'Tướng cùng vai trò')}</Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            pb: 1
          }}>
            {sameRoleHeroes.slice(0, 8).map(h => (
              <Box key={h.slug} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/heroes/${h.slug}`)}>
                <Box sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(201,160,99,0.25)', mb: 0.5 }}>
                  <img src={h.image} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.15, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    )}

    {/* Latest News Row (full width) */}
    {latestNews && latestNews.length > 0 && (
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, md: 6 },
        mb: { xs: 2, md: 3 },
      }}>
        <Box sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
          <Typography variant="h5" sx={{ mb: 1.5 }}>{t('news.latest', 'Bài viết mới nhất')}</Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, overflowX: 'auto', pb: 1 }}>
            {latestNews.map(n => (
              <Box key={n.slug} sx={{ width: { xs: 160, sm: 200, md: 280 }, flex: '0 0 auto', cursor: 'pointer' }} onClick={() => navigate(`/news/${n.slug}`)}>
                <Box sx={{ width: '100%', aspectRatio: '16/9', borderRadius: { xs: 2, md: 3 }, overflow: 'hidden', border: '1px solid rgba(201,160,99,0.25)', mb: { xs: 0.5, md: 1 } }}>
                  <img src={n.image} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25, fontSize: { xs: '0.85rem', md: '1rem' } }}>{n.title}</Typography>
                {n.publishedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{new Date(n.publishedAt).toLocaleDateString()}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    )}

    </>
  );
};

export default HeroDetail;