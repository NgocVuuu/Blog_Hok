"use client";
import React, { memo } from 'react';
import { Card, CardContent, CardMedia, Chip, Box, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

function getHeroSlug(item: any) {
  return item?.slug || item?._id || (item?.name || '').toLowerCase().replace(/\s+/g, '-');
}

const SpecialTrending = memo(function SpecialTrending({ items = [] }: { items: any[] }) {
  const { t } = useTranslation();
  
  if (!Array.isArray(items) || items.length === 0) return null;
  
  return (
    <Box sx={{ pb: 2 }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={8}
        slidesPerView={1.6}
        breakpoints={{
          600: { slidesPerView: 2 },
          900: { slidesPerView: 3 },
          // On large screens (>=1200px) show slightly more than 4 slides: 4.2
          1200: { slidesPerView: 4.6 }
        }}
        pagination={{ clickable: true, el: '.special-trending-pagination' }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        style={{ marginBottom: 18 }}
      >
        {items.map(item => (
          <SwiperSlide key={item.slug || item.id || item.name}>
            <Card 
              component={Link} 
              prefetch={false}
              href={`/heroes/${getHeroSlug(item)}`}
              aria-label={`Open ${item.name} details`}
              sx={{ 
                textDecoration: 'none',
                border: '1px solid rgba(0,0,0,0.06)', 
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)', 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textAlign: 'left',
                px: 0,
                py: 0,
                borderRadius: 2, 
                bgcolor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              {item.image ? (
                <CardMedia 
                  component="img" 
                  image={item.image} 
                  alt={item.name} 
                  loading="lazy"
                  sx={{ 
                    width: '100%',
                    height: 96, 
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }} 
                />
              ) : (
                <Box sx={{ height: 96, bgcolor: 'grey.100', width: '100%' }} />
              )}
              <CardContent sx={{ p: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.9rem', mb: 0.25 }}>
                  {item.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.35, 
                  flexWrap: 'nowrap'
                }}>
                  <Chip 
                    size="small" 
                    label={item.categoryEn || item.categoryVi || item.category || 'Special'} 
                    color="warning" 
                    sx={{ 
                      fontSize: 10,
                      px: 0.25,
                      py: 0.15,
                      minHeight: 20,
                      '& .MuiChip-label': { 
                        px: 0.4
                      } 
                    }}
                  />
                  <Chip 
                    size="small" 
                    label={`Tier ${item.metaTier || '-'}`} 
                    sx={{ 
                      fontSize: 10,
                      px: 0.25,
                      py: 0.15,
                      minHeight: 20,
                      '& .MuiChip-label': { 
                        px: 0.4
                      } 
                    }}
                  />
                  {item.winRate != null && (
                    <Chip 
                      size="small" 
                      label={`WR ${(item.winRate || 0).toFixed(2)}%`} 
                      color={(item.winRate || 0) >= 50 ? 'success' : 'default'} 
                      sx={{ 
                        fontSize: 10,
                        px: 0.25,
                        py: 0.15,
                        minHeight: 20,
                        '& .MuiChip-label': { 
                          px: 0.4
                        } 
                      }}
                    />
                  )}
                  {item.pickRate != null && (
                    <Chip 
                      size="small" 
                      label={`PR ${(item.pickRate || 0).toFixed(2)}%`} 
                      color="info" 
                      sx={{ 
                        fontSize: 10,
                        px: 0.25,
                        py: 0.15,
                        minHeight: 20,
                        '& .MuiChip-label': { 
                          px: 0.4
                        } 
                      }}
                    />
                  )}
                </Box>
                {(item.reasonEn || item.reason || item.reasonVi) && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontSize: '0.7rem',
                      mt: 0.5,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.reasonEn || item.reason || item.reasonVi}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
      <Box 
        className="special-trending-pagination" 
        sx={{ 
          mt: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          '& .swiper-pagination-bullet': { background: '#c9a063' } 
        }} 
      />
    </Box>
  );
});

export default SpecialTrending;
