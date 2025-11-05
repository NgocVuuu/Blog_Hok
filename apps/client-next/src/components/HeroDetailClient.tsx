'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Card, CardContent, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/i18n'; // Initialize i18n

// Helper function to format date consistently
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Use a consistent format that doesn't depend on locale
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
};

interface HeroDetailClientProps {
  hero: any;
  sameRoleHeroes: any[];
  topWinHeroes: any[];
  latestNews: any[];
}

// Skill Tabs Component
const SkillTabs = ({ skills, isMobile }: { skills: any[], isMobile: boolean }) => {
  const [selected, setSelected] = useState(0);
  if (!skills || skills.length === 0) return null;
  
  return (
    <>
      <Box display="flex" gap={{ xs: 0.75, md: 4 }} mb={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
        {skills.map((skill, idx) => (
          <Box 
            key={idx} 
            onClick={() => setSelected(idx)} 
            sx={{
              cursor: 'pointer',
              border: selected === idx ? { xs: '2px solid #C9A063', md: '4px solid #C9A063' } : { xs: '2px solid transparent', md: '4px solid transparent' },
              borderRadius: '50%',
              transition: 'border 0.2s',
              p: { xs: 0.25, md: 1 },
              bgcolor: 'none',
              boxShadow: selected === idx ? '0 0 0 4px #fff6, 0 2px 8px #C9A06344' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {skill.icon && (
              <img
                src={skill.icon}
                alt={skill.name}
                style={{
                  width: isMobile ? 40 : 72,
                  height: isMobile ? 40 : 72,
                  borderRadius: '50%'
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{
        minHeight: { xs: 56, md: 80 },
        transition: 'opacity 0.4s, transform 0.4s',
        opacity: 1,
        transform: 'translateY(0)',
      }}>
        <Typography fontWeight={600} fontSize={{ xs: 16, md: 24 }} sx={{ mt: { xs: 0.5, md: 2 } }}>
          {skills[selected].name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', md: '0.875rem' } }}>
          {skills[selected].description}
        </Typography>
      </Box>
    </>
  );
};

export default function HeroDetailClient({ hero, sameRoleHeroes, topWinHeroes, latestNews }: HeroDetailClientProps) {
  const { t } = useTranslation();
  const [selectedEqBuild, setSelectedEqBuild] = useState(1);
  const [selectedSkillBuildIdx, setSelectedSkillBuildIdx] = useState(0);
  const [selectedArcanaIdx, setSelectedArcanaIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Debug logs (development only)
  useEffect(() => {
    // Removed verbose dev console logs to keep client console clean.
    // If you need structured telemetry, consider sending to a dev-only logger service.
  }, [hero, sameRoleHeroes, topWinHeroes, latestNews]);

  // Detect mobile with optimized resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let rafId: number;
    
    const handleResize = () => {
      // Cancel previous RAF and timeout
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Debounce resize checks
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          setIsMobile(window.innerWidth < 600);
        });
      }, 150);
    };
    
    // Initial check
    setIsMobile(window.innerWidth < 600);
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
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
        {/* Decorative images can be added here */}
      </Box>

      {/* Hero Banner Section */}
      <Box sx={{
        position: 'relative',
        minHeight: { xs: 200, md: 320 },
        background: hero.image 
          ? `linear-gradient(180deg, rgba(60,20,20,0.7) 0%, rgba(60,20,20,0.2) 60%, #fff 100%), url(${hero.image}) left center/cover no-repeat`
          : 'linear-gradient(180deg, rgba(60,20,20,0.7) 0%, rgba(60,20,20,0.2) 60%, #fff 100%)',
        borderRadius: { xs: 0, md: 6 },
        overflow: 'hidden',
        mb: { xs: 2, md: 3 },
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        pt: { xs: 3, md: 6 },
        mt: { xs: 3, md: 6 },
        width: { xs: '100%', md: '66%' },
        mr: { xs: 0, md: 'auto' },
        ml: 0,
      }}>
        <Box sx={{
          position: 'absolute',
          left: { xs: 12, md: 48 },
          bottom: { xs: 8, md: 24 },
          zIndex: 2,
          color: '#fff',
        }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              color: '#c9a063',
              WebkitTextStroke: '0.8px rgba(20,12,6,0.95)',
              textShadow: `-1px -1px 0 rgba(20,12,6,0.98), 1px -1px 0 rgba(20,12,6,0.98), -1px 1px 0 rgba(20,12,6,0.98), 1px 1px 0 rgba(20,12,6,0.98), 0 4px 18px rgba(0,0,0,0.6)`,
              fontSize: { xs: '1.3rem', md: '2.2rem' }
            }}
          >
            {hero.name}
          </Typography>
          {hero.title && (
            <Typography
              variant="h6"
              sx={{
                color: '#c9a063',
                WebkitTextStroke: '0.5px rgba(20,12,6,0.95)',
                textShadow: `-0.8px -0.8px 0 rgba(20,12,6,0.98), 0.8px -0.8px 0 rgba(20,12,6,0.98), -0.8px 0.8px 0 rgba(20,12,6,0.98), 0.8px 0.8px 0 rgba(20,12,6,0.98), 0 3px 12px rgba(0,0,0,0.55)`,
                mb: 1,
                fontSize: { xs: '0.85rem', md: '1rem' }
              }}
            >
              {hero.title}
            </Typography>
          )}
          <Box display="flex" gap={{ xs: 0.5, md: 1 }} flexWrap="wrap" mb={1}>
            {hero.roles && hero.roles.map((role: string) => (
              <Chip
                key={role}
                label={String(t(`roles.${role}`, role))}
                sx={{
                  bgcolor: '#C9A063',
                  color: '#7b2ff2',
                  fontWeight: 600,
                  fontSize: { xs: 10, md: 16 },
                  height: { xs: 20, md: 32 }
                }}
              />
            ))}
            {hero.lanes && hero.lanes.map((lane: string) => {
              const displayLane = lane === 'Abyssal Lane' ? 'Clash Lane' : lane;
              return (
                <Chip
                  key={lane}
                  label={String(t(`lanes.${displayLane}`, displayLane))}
                  sx={{
                    bgcolor: '#C9A063',
                    color: '#00796b',
                    fontWeight: 600,
                    fontSize: { xs: 10, md: 16 },
                    height: { xs: 20, md: 32 }
                  }}
                />
              );
            })}
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
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            {String(t('hero.metaTier', 'Meta Tier'))}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="#ff9800" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
            {hero.metaTier || '-'}
          </Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            {String(t('hero.winRate', 'Win Rate'))}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="#43a047" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
            {hero.winRate ? `${hero.winRate}%` : '-'}
          </Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            {String(t('hero.pickRate', 'Pick Rate'))}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="#1976d2" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
            {hero.pickRate ? `${hero.pickRate}%` : '-'}
          </Typography>
        </Box>
        <Box sx={{ width: { xs: 3, md: 5 }, height: { xs: 3, md: 5 }, bgcolor: '#C9A063', transform: 'rotate(45deg)', mx: { xs: 1, md: 2 } }} />
        <Box textAlign="center" minWidth={{ xs: 70, md: 110 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            {String(t('hero.banRate', 'Ban Rate'))}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="#d32f2f" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
            {hero.banRate ? `${hero.banRate}%` : '-'}
          </Typography>
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
          {((hero.allies && hero.allies.length > 0) || (hero.counters && hero.counters.length > 0) || (hero.goodAgainst && hero.goodAgainst.length > 0)) && (
            <Box mb={{ xs: 2, md: 3 }} sx={{
              background: 'none',
              borderRadius: { xs: 3, md: 6 },
              border: '1.5px solid rgba(201,160,99,0.35)',
              boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={{ xs: 2, md: 4 }}>
                {/* Allies */}
                {hero.allies && hero.allies.length > 0 && (
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#43a047', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {String(t('heroes.allies', 'Đồng minh tốt'))}
                    </Typography>
                    <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap">
                      {hero.allies.map((ally: any) => (
                        <Link prefetch={false} key={ally._id || ally.id} href={`/heroes/${ally.slug}`} style={{ textDecoration: 'none' }}>
                          <Box sx={{ cursor: 'pointer', textAlign: 'center' }}>
                            <Box sx={{ 
                              width: { xs: 50, md: 70 }, 
                              height: { xs: 48, md: 68 }, 
                              borderRadius: { xs: 1, md: '50%' }, 
                              overflow: 'hidden', 
                              border: { xs: '2px solid rgba(67, 160, 71, 0.3)', md: '3px solid rgba(67, 160, 71, 0.3)' },
                              position: 'relative'
                            }}>
                              <Box
                                component="img"
                                src={ally.image}
                                alt={ally.name}
                                sx={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transform: { xs: 'scale(1.7)', md: 'scale(1)' },
                                  position: 'relative',
                                  top: { xs: '9px', md: '0' }
                                }}
                              />
                            </Box>
                            <Typography fontWeight={600} fontSize={{ xs: 10, md: 13 }} sx={{ mt: { xs: 0.5, md: 1 }, maxWidth: { xs: 50, md: 70 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ally.name}
                            </Typography>
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Counters */}
                {hero.counters && hero.counters.length > 0 && (
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#d32f2f', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {String(t('heroes.counters', 'Khắc chế'))}
                    </Typography>
                    <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap">
                      {hero.counters.map((counter: any) => (
                        <Link prefetch={false} key={counter._id || counter.id} href={`/heroes/${counter.slug}`} style={{ textDecoration: 'none' }}>
                          <Box sx={{ cursor: 'pointer', textAlign: 'center' }}>
                            <Box sx={{ 
                              width: { xs: 50, md: 70 }, 
                              height: { xs: 48, md: 68 }, 
                              borderRadius: { xs: 1, md: '50%' }, 
                              overflow: 'hidden', 
                              border: { xs: '2px solid rgba(211, 47, 47, 0.3)', md: '3px solid rgba(211, 47, 47, 0.3)' },
                              position: 'relative'
                            }}>
                              <Box
                                component="img"
                                src={counter.image}
                                alt={counter.name}
                                sx={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transform: { xs: 'scale(1.7)', md: 'scale(1)' },
                                  position: 'relative',
                                  top: { xs: '9px', md: '0' }
                                }}
                              />
                            </Box>
                            <Typography fontWeight={600} fontSize={{ xs: 10, md: 13 }} sx={{ mt: { xs: 0.5, md: 1 }, maxWidth: { xs: 50, md: 70 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {counter.name}
                            </Typography>
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Good Against */}
                {hero.goodAgainst && hero.goodAgainst.length > 0 && (
                  <Box mt={{ xs: 2, md: 0 }} flex={1}>
                    <Typography variant="h6" sx={{ mb: { xs: 1, md: 2 }, color: '#43a047', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {String(t('heroes.goodAgainst', 'Hiệu quả chống lại'))}
                    </Typography>
                    <Box display="flex" gap={{ xs: 1, md: 2 }} flexWrap="wrap">
                      {hero.goodAgainst.map((ga: any) => (
                        <Link prefetch={false} key={ga._id || ga.id} href={`/heroes/${ga.slug}`} style={{ textDecoration: 'none' }}>
                          <Box sx={{ cursor: 'pointer', textAlign: 'center' }}>
                            <Box sx={{ 
                              width: { xs: 50, md: 70 }, 
                              height: { xs: 48, md: 68 }, 
                              borderRadius: { xs: 1, md: '50%' }, 
                              overflow: 'hidden', 
                              border: { xs: '2px solid rgba(67, 160, 71, 0.3)', md: '3px solid rgba(67, 160, 71, 0.3)' },
                              position: 'relative'
                            }}>
                              <Box
                                component="img"
                                src={ga.image}
                                alt={ga.name}
                                sx={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transform: { xs: 'scale(1.7)', md: 'scale(1)' },
                                  position: 'relative',
                                  top: { xs: '9px', md: '0' }
                                }}
                              />
                            </Box>
                            <Typography fontWeight={600} fontSize={{ xs: 10, md: 13 }} sx={{ mt: { xs: 0.5, md: 1 }, maxWidth: { xs: 50, md: 70 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ga.name}
                            </Typography>
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Skills (support multiple builds) */}
          <Box mb={{ xs: 2, md: 3 }} sx={{
            background: 'none',
            borderRadius: { xs: 3, md: 6 },
            border: '1.5px solid rgba(201,160,99,0.35)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
            backdropFilter: 'blur(12px)',
            p: { xs: 2, md: 3 },
          }}>
            {(() => {
              const builds = (Array.isArray(hero.skillBuilds) && hero.skillBuilds.length > 0)
                ? hero.skillBuilds
                : [{ name: String(t('build.default', 'Bộ 1')), skills: hero.skills || [] }];
              const current = builds[Math.max(0, Math.min(builds.length - 1, selectedSkillBuildIdx))] || builds[0];
              
              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h5" sx={{ mt: { xs: 1, md: 2 }, mb: 1, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                      {String(t('hero.skills', 'Kỹ năng'))}{builds.length > 1 && current?.name ? ` - ${current.name}` : ''}
                    </Typography>
                    {builds.length > 1 && (
                      <ToggleButtonGroup
                        size="small"
                        color="primary"
                        exclusive
                        value={selectedSkillBuildIdx}
                        onChange={(e, v) => (v !== null) && setSelectedSkillBuildIdx(v)}
                        sx={{ 
                          mb: 1, 
                          flexWrap: 'wrap',
                          '& .MuiToggleButton-root': {
                            fontSize: { xs: '0.7rem', md: '0.875rem' },
                            px: { xs: 0.75, md: 1.5 },
                            py: { xs: 0.25, md: 0.5 },
                            minHeight: { xs: 28, md: 32 }
                          }
                        }}
                      >
                        {builds.map((b: any, idx: number) => (
                          <ToggleButton key={idx} value={idx} sx={{ px: 1.5 }}>
                            {b.name || `${String(t('build', 'Build'))} ${idx + 1}`}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    )}
                  </Box>
                  {/* Skills Horizontal Selector */}
                  <SkillTabs skills={current?.skills || []} isMobile={isMobile} />
                </>
              );
            })()}
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
              {(() => {
                const buildLabel = t('hero.equipmentSet', { number: selectedEqBuild, defaultValue: `Bộ ${selectedEqBuild}` });
                return (
                  <Typography variant="h5" sx={{ mb: 1.5, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                    {String(t('hero.suggestedEquipment', 'Trang bị gợi ý'))} - {String(buildLabel)}
                  </Typography>
                );
              })()}
              
              {/* Build toggle: show only available builds */}
              {(() => {
                const availableEqBuilds = [1, 2, 3].filter(b => (hero.suggestedEquipment || []).some((e: any) => (e.build || 1) === b));
                if (availableEqBuilds.length <= 1) return null;
                return (
                  <ToggleButtonGroup
                    size="small"
                    color="primary"
                    exclusive
                    value={selectedEqBuild}
                    onChange={(e, v) => v && setSelectedEqBuild(v)}
                    sx={{ 
                      mb: 1, 
                      flexWrap: 'wrap',
                      '& .MuiToggleButton-root': {
                        fontSize: { xs: '0.7rem', md: '0.875rem' },
                        px: { xs: 0.75, md: 1.5 },
                        py: { xs: 0.25, md: 0.5 },
                        minHeight: { xs: 28, md: 32 }
                      }
                    }}
                  >
                    {availableEqBuilds.map(b => (
                      <ToggleButton key={b} value={b} sx={{ px: 1.5 }}>
                        {b}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                );
              })()}

              {/* Only render selected build */}
              {(() => {
                const group = (hero.suggestedEquipment || []).filter((e: any) => (e.build || 1) === selectedEqBuild);
                if (group.length === 0) return null;
                return (
                  <Box key={`build-${selectedEqBuild}`} sx={{ mb: 0 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: { xs: 0.75, md: 1.5 },
                      flexWrap: { xs: 'nowrap', md: 'wrap' },
                      alignItems: 'stretch',
                      overflowX: { xs: 'auto', md: 'visible' },
                      pb: { xs: 0.5, md: 0 }
                    }}>
                      {group.map((eq: any, idx: number) => (
                        <Box key={eq._id || idx} sx={{ width: { xs: 52, md: 90 }, textAlign: 'center', flex: '0 0 auto' }}>
                          <Box sx={{ width: '100%', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(201,160,99,0.25)', mb: 0.5 }}>
                            <img src={eq.image} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: 10, md: 13 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={eq.name}>
                            {eq.name}
                          </Typography>
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

          {/* Arcana Builds */}
          {hero.arcanaBuilds && Array.isArray(hero.arcanaBuilds) && hero.arcanaBuilds.length > 0 && (
            <Box mb={{ xs: 2, md: 3 }} sx={{
              background: 'none',
              borderRadius: { xs: 3, md: 6 },
              border: '1.5px solid rgba(201,160,99,0.35)',
              boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, md: 3 },
            }}>
              {(() => {
                const current = hero.arcanaBuilds[Math.max(0, Math.min(hero.arcanaBuilds.length - 1, selectedArcanaIdx))];
                return (
                  <Typography variant="h5" sx={{ mb: 1.5, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                    {String(t('hero.suggestedArcanaBuilds', 'Arcana gợi ý'))}{hero.arcanaBuilds.length > 1 && current?.name ? ` - ${current.name}` : ''}
                  </Typography>
                );
              })()}
              
              {/* Arcana build toggle */}
              {hero.arcanaBuilds.length > 1 && (
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  exclusive
                  value={selectedArcanaIdx}
                  onChange={(e, v) => (v !== null) && setSelectedArcanaIdx(v)}
                  sx={{ 
                    mb: 2, 
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                      fontSize: { xs: '0.7rem', md: '0.875rem' },
                      px: { xs: 0.75, md: 1.5 },
                      py: { xs: 0.25, md: 0.5 },
                      minHeight: { xs: 28, md: 32 }
                    }
                  }}
                >
                  {hero.arcanaBuilds.map((build: any, idx: number) => (
                    <ToggleButton key={idx} value={idx} sx={{ px: 1.5 }}>
                      {build.name || `${String(t('build', 'Build'))} ${idx + 1}`}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}

              {/* Only render selected arcana build */}
              {(() => {
                const currentBuild = hero.arcanaBuilds[selectedArcanaIdx];
                if (!currentBuild || !currentBuild.items) return null;
                return (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: { xs: 0.75, md: 1.5 },
                    flexWrap: { xs: 'nowrap', md: 'wrap' },
                    alignItems: 'stretch',
                    overflowX: { xs: 'auto', md: 'visible' },
                    pb: { xs: 0.5, md: 0 }
                  }}>
                    {currentBuild.items.map((arc: any, idx: number) => (
                      <Box key={arc._id || idx} sx={{ width: { xs: 52, md: 90 }, textAlign: 'center', flex: '0 0 auto' }}>
                        <Box sx={{ width: '100%', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(201,160,99,0.25)', mb: 0.5 }}>
                          <img src={arc.image} alt={arc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: 10, md: 13 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={arc.name}>
                          {arc.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          )}

          {/* Combo Kill Section */}
          {(() => {
            const hasBuilds = Array.isArray(hero.comboBuilds) && hero.comboBuilds.length > 0;
            const steps = hasBuilds
              ? ((hero.comboBuilds[Math.max(0, Math.min((hero.comboBuilds.length - 1), selectedSkillBuildIdx))] || {}).steps || [])
              : (hero.combo || []);
            if (!steps || steps.length === 0) return null;

            return (
              <Box mb={{ xs: 2, md: 3 }} sx={{
                background: 'none',
                borderRadius: { xs: 3, md: 6 },
                border: '1.5px solid rgba(201,160,99,0.35)',
                boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
                backdropFilter: 'blur(12px)',
                p: { xs: 2, md: 3 },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                    {String(t('heroes.combo', 'Combo Kill'))}
                  </Typography>
                  {hasBuilds && (hero.comboBuilds.length > 1) && (
                    <ToggleButtonGroup
                      size="small"
                      color="primary"
                      exclusive
                      value={selectedSkillBuildIdx}
                      onChange={(e, v) => (v !== null) && setSelectedSkillBuildIdx(v)}
                      sx={{
                        '& .MuiToggleButton-root': {
                          fontSize: { xs: '0.7rem', md: '0.875rem' },
                          px: { xs: 0.75, md: 1.5 },
                          py: { xs: 0.25, md: 0.5 },
                          minHeight: { xs: 28, md: 32 }
                        }
                      }}
                    >
                      {hero.comboBuilds.map((b: any, idx: number) => (
                        <ToggleButton key={idx} value={idx}>
                          {b.name || `${String(t('build', 'Build'))} ${idx + 1}`}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                </Box>
                {steps.map((step: any, idx: number) => {
                  const currentSkills = (Array.isArray(hero.skillBuilds) && hero.skillBuilds.length > 0)
                    ? (hero.skillBuilds[Math.max(0, Math.min((hero.skillBuilds.length - 1), selectedSkillBuildIdx))]?.skills || [])
                    : (hero.skills || []);

                  return (
                    <Box key={idx} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 1, sm: 2 }} mb={2}>
                      <Typography variant="subtitle2" sx={{ minWidth: { xs: 56, sm: 72 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Combo {idx + 1}
                      </Typography>
                      <Box display="flex" alignItems="center" flexWrap="wrap">
                        {step.skills && step.skills.length > 0 ? step.skills.map((skillIdx: number, sidx: number) => {
                          const BASIC_ATTACK_INDEX = 5;
                          const isBasic = skillIdx === BASIC_ATTACK_INDEX;
                          const skill = !isBasic ? currentSkills[skillIdx] : null;
                          const skillOrderLabels = ['Nội tại', 'Chiêu 1', 'Chiêu 2', 'Chiêu 3', 'Chiêu 4'];
                          const orderLabel = isBasic ? 'Đánh thường' : (skillOrderLabels[skillIdx] || `Skill ${skillIdx + 1}`);

                          return (
                            <React.Fragment key={sidx}>
                              <Box sx={{ textAlign: 'center', mr: { xs: 0.3, sm: 0.5 } }}>
                                {isBasic ? (
                                  <Box title={orderLabel} sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,160,99,0.12)', fontSize: { xs: 18, sm: 22 } }}>
                                    🗡️
                                  </Box>
                                ) : skill ? (
                                  <img
                                    src={skill.icon}
                                    alt={skill.name}
                                    title={skill.name || orderLabel}
                                    style={{ width: isMobile ? 34 : 40, height: isMobile ? 34 : 40, borderRadius: 8, objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Box sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: 2, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>?</Box>
                                )}
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.3, fontSize: 10, lineHeight: 1.1 }}>
                                  {isBasic ? 'BA' : (skillIdx === 0 ? 'P' : skillIdx)}
                                </Typography>
                              </Box>
                              {sidx < step.skills.length - 1 && (
                                <Typography component="span" sx={{ mx: { xs: 0.3, sm: 0.5 }, fontWeight: 600 }}>+</Typography>
                              )}
                            </React.Fragment>
                          );
                        }) : (
                          <Typography variant="body2" color="text.secondary">(Không có kỹ năng)</Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })()}

          {/* Skins Section - Swiper */}
          {hero.skins && hero.skins.length > 0 && (
            <Box mb={{ xs: 2, md: 3 }} sx={{
              background: 'none',
              borderRadius: { xs: 3, md: 6 },
              boxShadow: '0 8px 32px 0 rgba(139, 115, 85, 0.15)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'visible',
              border: '1px solid rgba(139, 115, 85, 0.2)',
              mx: { xs: 0, md: -3 },
                width: { xs: '100%', md: 'calc(100% + 48px)' },
                // Adjust swiper pagination position on mobile to avoid overlap
                '& .swiper-pagination': {
                  bottom: isMobile ? 12 : 32,
                  zIndex: 5
                }
            }}>
              <Typography variant="h5" sx={{ mt: { xs: 1, md: 2 }, mb: 2, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                {String(t('hero.skins', 'Skins'))}
              </Typography>
              <Swiper
                modules={[EffectCoverflow, Navigation, Pagination]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={isMobile ? 1 : 3}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 120,
                  modifier: 2.5,
                  slideShadows: false,
                }}
                navigation={!isMobile}
                pagination={{ clickable: true }}
                // Increase bottom padding on mobile so pagination dots sit lower
                style={{ width: '100%', paddingBottom: isMobile ? 56 : 40 }}
              >
                {hero.skins.map((skin: any, idx: number) => (
                  <SwiperSlide key={idx} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {({ isActive, isPrev, isNext }: any) => {
                      const show = isActive || isPrev || isNext;
                      return (
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: show ? 1 : 0,
                          pointerEvents: show ? 'auto' : 'none',
                          visibility: show ? 'visible' : 'hidden',
                          transition: 'opacity 0.3s, visibility 0.3s',
                        }}>
                          <img
                            src={skin.image}
                            alt={skin.name}
                            style={{
                              width: isMobile ? 280 : 400,
                              height: isMobile ? 175 : 250,
                              minWidth: isMobile ? 280 : 400,
                              maxWidth: isMobile ? 280 : 400,
                              objectFit: 'cover',
                              borderRadius: isMobile ? 12 : 18,
                              boxShadow: isActive ? '0 8px 24px rgba(139, 115, 85, 0.3)' : '0 4px 12px rgba(139, 115, 85, 0.15)',
                              marginBottom: isMobile ? 8 : 16,
                              opacity: isActive ? 1 : 0.2,
                              transition: 'opacity 0.3s, box-shadow 0.3s'
                            }}
                          />
                          <Box
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
          )}

          {/* Lore Section */}
          {hero.lore && (
            <Box mb={{ xs: 2, md: 3 }} sx={{
              background: 'none',
              borderRadius: { xs: 3, md: 6 },
              border: '1.5px solid rgba(201,160,99,0.35)',
              boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, md: 3 },
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {hero.lore}
              </Typography>
            </Box>
          )}

          {/* Bio/Description */}
          {(hero.bio || hero.description || hero.summary) && (
            <Box mb={{ xs: 2, md: 3 }} sx={{
              background: 'none',
              borderRadius: { xs: 3, md: 6 },
              border: '1.5px solid rgba(201,160,99,0.35)',
              boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, md: 3 },
            }}>
              <Typography variant="h5" sx={{ mb: 1.5, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                {String(t('hero.bio', 'Giới thiệu'))}
              </Typography>
              <Box
                dangerouslySetInnerHTML={{ __html: hero.bio || hero.description || hero.summary }}
                sx={{
                  '& p': { mb: 2 },
                  '& img': { maxWidth: '100%', height: 'auto' }
                }}
              />
            </Box>
          )}

          {/* Origin */}
          {hero.origin && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 10
              }}
            >
              {String(t('hero.origin', 'Origin'))}: {hero.origin}
            </Typography>
          )}
        </Box>

        {/* RIGHT: Sidebar */}
        <Box sx={{ mt: { xs: 2, md: '-490px' }, mb: { xs: 2, md: 2 } }}>
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
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  {String(t('heroes.sameRole', 'Tướng cùng vai trò'))}
                </Typography>
                {sameRoleHeroes && sameRoleHeroes.length > 0 ? (
                  <>
                    {/* Mobile: Swiper slider */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Swiper
                        modules={[Pagination]}
                        spaceBetween={6}
                        slidesPerView={3.3}
                        pagination={{ clickable: true }}
                        style={{ paddingBottom: 32 }}
                      >
                        {sameRoleHeroes.slice(0, 14).map((h: any) => (
                          <SwiperSlide key={h.slug}>
                            <Link
                              prefetch={false}
                              href={`/heroes/${h.slug}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.5,
                                  cursor: 'pointer',
                                  p: 0.5,
                                  border: '1px solid rgba(201,160,99,0.35)',
                                  background: 'rgba(201,160,99,0.06)',
                                  borderRadius: 2,
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(201,160,99,0.2)' }
                                }}
                              >
                                <Box sx={{ 
                                  width: '100%', 
                                  paddingTop: 'calc(100% - 4px)',
                                  borderRadius: 1.5, 
                                  overflow: 'hidden', 
                                  background: 'rgba(0,0,0,0.05)',
                                  position: 'relative'
                                }}>
                                  <img src={h.image} alt={h.name} style={{ 
                                    position: 'absolute',
                                    top: '17px',
                                    left: 0,
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    objectPosition: 'center 20%',
                                    transform: 'scale(1.7)'
                                  }} />
                                </Box>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  fontSize: '0.7rem', 
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                  px: 0.25,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  minHeight: '2.4em'
                                }}>
                                  {h.name}
                                </Typography>
                              </Box>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </Box>
                    {/* Desktop: List */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {sameRoleHeroes.slice(0, 14).map((h: any) => (
                        <Link
                          prefetch={false}
                          key={h.slug}
                          href={`/heroes/${h.slug}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
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
                              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {h.name}
                              </Typography>
                              {Array.isArray(h.roles) && h.roles.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {h.roles.join(', ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">{String(t('no_data', 'Không có dữ liệu'))}</Typography>
                )}
              </Box>

              {/* Top win-rate heroes */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  {String(t('heroes.topWinRate', 'Tướng tỉ lệ thắng cao'))}
                </Typography>
                {topWinHeroes && topWinHeroes.length > 0 ? (
                  <>
                    {/* Mobile: Swiper slider */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Swiper
                        modules={[Pagination]}
                        spaceBetween={6}
                        slidesPerView={3.3}
                        pagination={{ clickable: true }}
                        style={{ paddingBottom: 32 }}
                      >
                        {topWinHeroes.slice(0, 14).map((h: any) => (
                          <SwiperSlide key={h.slug}>
                            <Link
                              prefetch={false}
                              href={`/heroes/${h.slug}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.5,
                                  cursor: 'pointer',
                                  p: 0.5,
                                  border: '1px solid rgba(201,160,99,0.35)',
                                  background: 'rgba(201,160,99,0.06)',
                                  borderRadius: 2,
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(201,160,99,0.2)' }
                                }}
                              >
                                <Box sx={{ 
                                  width: '100%', 
                                  paddingTop: 'calc(100% - 4px)',
                                  borderRadius: 1.5, 
                                  overflow: 'hidden', 
                                  background: 'rgba(0,0,0,0.05)',
                                  position: 'relative'
                                }}>
                                  <img src={h.image} alt={h.name} style={{ 
                                    position: 'absolute',
                                    top: '17px',
                                    left: 0,
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    objectPosition: 'center 20%',
                                    transform: 'scale(1.7)'
                                  }} />
                                </Box>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  fontSize: '0.7rem', 
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                  px: 0.25,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  minHeight: '2.4em',
                                  mb: 0
                                }}>
                                  {h.name}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  fontSize: '0.65rem', 
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  color: 'success.main'
                                }}>
                                  {h.winRate ? `${h.winRate}%` : '-'}
                                </Typography>
                              </Box>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </Box>
                    {/* Desktop: Grid */}
                    <Box sx={{ 
                      display: { xs: 'none', md: 'grid' },
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 1
                    }}>
                      {topWinHeroes.slice(0, 14).map((h: any) => (
                        <Link
                          prefetch={false}
                          key={h.slug}
                          href={`/heroes/${h.slug}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
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
                              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {h.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {h.winRate ? `${h.winRate}% ${String(t('winRate', 'Win Rate'))}` : '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">{String(t('no_data', 'Không có dữ liệu'))}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Latest News Section - Full Width (outside sidebar) */}
      {latestNews && latestNews.length > 0 && (
        <Box sx={{ width: '100%', mb: { xs: 2, md: 3 } }}>
          <Box sx={{
            background: 'none',
            borderRadius: { xs: 3, md: 6 },
            border: '1.5px solid rgba(201,160,99,0.35)',
            boxShadow: '0 8px 32px 0 rgba(201,160,99,0.08)',
            backdropFilter: 'blur(12px)',
            p: { xs: 2, md: 3 },
          }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
              {String(t('news.latest', 'Bài viết mới nhất'))}
            </Typography>
            
            {/* Swiper for both mobile and desktop */}
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={isMobile ? 12 : 20}
              slidesPerView={isMobile ? 1.5 : 4}
              navigation={!isMobile}
              pagination={{ clickable: true }}
              style={{ paddingBottom: 40 }}
            >
              {latestNews.map((news: any) => (
                <SwiperSlide key={news._id || news.slug}>
                  <Link prefetch={false} href={`/news/${news.slug || news._id}`} style={{ textDecoration: 'none' }}>
                    <Box sx={{ 
                      cursor: 'pointer', 
                      transition: 'transform 0.2s', 
                      '&:hover': { transform: 'translateY(-4px)' },
                      pb: 1
                    }}>
                      <Box sx={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        borderRadius: { xs: 2, md: 3 }, 
                        overflow: 'hidden', 
                        border: '1px solid rgba(201,160,99,0.25)', 
                        mb: 1 
                      }}>
                        <img src={news.image} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 700, 
                        lineHeight: 1.25, 
                        fontSize: { xs: '0.85rem', md: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {news.title}
                      </Typography>
                      {news.publishedAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                          {formatDate(news.publishedAt)}
                        </Typography>
                      )}
                    </Box>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      )}
    </Box>
  );
}
