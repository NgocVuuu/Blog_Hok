import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './SwiperCustom.css';



const API_URL = process.env.REACT_APP_API_URL;

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

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  if (!hero) return null;

  const roleIcons = {
    Marksman: <img src="/img/roles/Marksman.png" alt="Marksman" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Mage: <img src="/img/roles/Mage.png" alt="Mage" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Tank: <img src="/img/roles/Tank.png" alt="Tank" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Support: <img src="/img/roles/Support.png" alt="Support" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Assassin: <img src="/img/roles/Assassin.png" alt="Assassin" style={{ width: 16, height: 16, marginRight: 4 }} />,
    Fighter: <img src="/img/roles/Fighter.png" alt="Fighter" style={{ width: 16, height: 16, marginRight: 4 }} />,
  };
  const laneIcons = {
    'Farm Lane': <img src="/img/lanes/Farm_Lane.png" alt="Farm Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Jungle': <img src="/img/lanes/Jungle.png" alt="Jungle" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Mid Lane': <img src="/img/lanes/Mid_Lane.png" alt="Mid Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Roam': <img src="/img/lanes/Roam.png" alt="Abyssal Dragon Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
    'Abyssal Lane': <img src="/img/lanes/Abyssal_Lane.png" alt="Dark Slayer Lane" style={{ width: 16, height: 16, marginRight: 4 }} />,
  };

  return (
    <Box maxWidth={{ xs: "100vw", md: "70vw" }} mx="auto" sx={{ position: 'relative', px: { xs: 1, md: 0 } }}>
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
          backgroundImage: 'url(/img/ef1.jpg)',
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
          backgroundImage: 'url(/img/ef2.jpg)',
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
          backgroundImage: 'url(/img/ef1.jpg)',
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
        minHeight: { xs: 250, md: 420 },
        background: `linear-gradient(180deg, rgba(60,20,20,0.7) 0%, rgba(60,20,20,0.2) 60%, #fff 100%), url(${hero.image}) center/cover no-repeat`,
        borderRadius: { xs: 0, md: 6 },
        overflow: 'hidden',
        mb: { xs: 2, md: 4 },
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        pt: { xs: 4, md: 10 },
        mt: { xs: 4, md: 10 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '120px',
          height: '120px',
          backgroundImage: 'url(/img/ef1.jpg)',
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
          backgroundImage: 'url(/img/ef2.jpg)',
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
            sx={{ textShadow: '0 2px 12px #000', fontSize: { xs: '1.5rem', md: '3rem' } }}
          >
            {hero.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{ textShadow: '0 2px 8px #000', mb: 1, fontSize: { xs: '0.9rem', md: '1.25rem' } }}
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
      <Box display="flex" justifyContent="center" alignItems="center" gap={0} mb={{ xs: 2, md: 3 }} flexWrap="wrap" sx={{
        borderRadius: 12,
        background: 'none',
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 2 },
        maxWidth: 900,
        mx: 'auto',
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
      {/* Allies & Counters */}
      <Box maxWidth={900} mx="auto" mb={{ xs: 2, md: 3 }} sx={{
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
          backgroundImage: 'url(/img/ef2.jpg)',
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
          {/* Counters */}
          <Box flex={1}>
            <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#d32f2f', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>{t('heroes.counters', 'Counters')}</Typography>
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
        </Box>
      </Box>
      {/* Skills */}
      <Box maxWidth={900} mx="auto" mb={{ xs: 2, md: 3 }} sx={{
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
          backgroundImage: 'url(/img/ef1.jpg)',
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
      {/* Combo Kill */}
      {hero.combo && hero.combo.length > 0 && (
        <Box maxWidth={900} mx="auto" mb={{ xs: 2, md: 3 }} sx={{
          background: 'none',
          borderRadius: { xs: 3, md: 6 },
          border: '1.5px solid rgba(201,160,99,0.35)',
          boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
          backdropFilter: 'blur(12px)',
          p: { xs: 2, md: 3 },
        }}>
          <Typography variant="h5" sx={{ mb: 2 }}>{t('heroes.combo', 'Combo Kill')}</Typography>
          {hero.combo.map((step, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={2} mb={2}>
              <Box display="flex" gap={1}>
                {step.skills && step.skills.map((skillIdx, sidx) => {
                  const skill = hero.skills[skillIdx];
                  return skill ? (
                    <img key={sidx} src={skill.icon} alt={skill.name} title={skill.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: 'none', marginRight: 4 }} />
                  ) : null;
                })}
              </Box>
              <Typography variant="body2" color="text.secondary">{step.description}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {/* Skins Slider - SwiperJS */}
      <Box maxWidth={900} mx="auto" mb={{ xs: 2, md: 3 }} sx={{
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
          backgroundImage: 'url(/img/ef2.jpg)',
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
      <Box maxWidth={900} mx="auto" mb={{ xs: 2, md: 3 }} sx={{
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
          backgroundImage: 'url(/img/ef1.jpg)',
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
          backgroundImage: 'url(/img/ef2.jpg)',
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
  );
};

export default HeroDetail;