"use client";
import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Skeleton } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Link from 'next/link';

function getHeroSlug(hero:any){
  return hero?.slug || (hero?.name ? hero.name.toLowerCase().replace(/\s+/g,'-') : '');
}

const TopCounters = memo(function TopCounters({ heroes = [], loading = false }:{heroes:any[]; loading?: boolean}){
  const top = useMemo(()=>{
    if (loading || !Array.isArray(heroes) || heroes.length === 0) return [];

    // Pre-calculate maps once
    const pickRateById = new Map(heroes.map(h=>[h._id, h.pickRate||0]));
    const metaTierById = new Map(heroes.map(h=>[h._id, h.metaTier]));
    const tierMap: Record<string, number> = { 'S+':5, 'S':4, 'A':3, 'B':2, 'C':1 };
    const tierScore = (tier:any) => tierMap[String(tier)] ?? 3;

    const getId = (ref:any) => {
      if (!ref) return null;
      if (typeof ref === 'string') return ref;
      if (ref.hero && typeof ref.hero === 'string') return ref.hero;
      if (ref.hero && ref.hero._id) return ref.hero._id;
      if (ref._id) return ref._id;
      return null;
    };

    // Calculate scores in a single pass
    const scored = heroes.map((h:any) => {
      const goods: any[] = Array.isArray(h.goodAgainst) ? h.goodAgainst : [];
      const bads: any[] = Array.isArray(h.counters) ? h.counters : [];
      
      const sumGood = goods.reduce((acc: number, g: any) => { 
        const id = getId(g); 
        if (!id) return acc; 
        const pr = pickRateById.get(id) || 0; 
        const oppTier = tierScore(metaTierById.get(id)); 
        const factor = 1 + 0.2 * (oppTier - 3); 
        return acc + pr * factor; 
      }, 0);
      
      const sumBad = bads.reduce((acc: number, c: any) => { 
        const id = getId(c); 
        if (!id) return acc; 
        const pr = pickRateById.get(id) || 0; 
        const oppTier = tierScore(metaTierById.get(id)); 
        const factor = 1 + 0.2 * (oppTier - 3); 
        return acc + pr * factor; 
      }, 0);
      
      const base = 2*sumGood - 1.5*sumBad + 0.5*(h.winRate||0);
      const selfTier = tierScore(h.metaTier);
      const selfFactor = 1 + 0.1*(selfTier-3);
      const score = base * selfFactor;
      
      return { hero: h, score };
    });
    
    // Sort and return top 8
    scored.sort((a,b)=> (b.score||0)-(a.score||0));
    return scored.slice(0,8).map(s=>s.hero);
  },[heroes, loading]);

  if (loading) {
    return (
      <Box sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
          {Array.from({ length: 8 }).map((_,i)=> (
            <Skeleton key={i} variant="rectangular" width={160} height={140} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!top || top.length === 0) return null;
  return (
    <Box sx={{ pb:2 }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={8}
        slidesPerView={'auto'}
        pagination={{ clickable: true, el: '.top-counters-pagination' }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        style={{ marginBottom: 18 }}
      >
        {top.map(h => (
            <SwiperSlide key={h._id || h.slug || h.name} style={{ width: 'auto' }}>
            <Card component={Link} prefetch={false} href={`/heroes/${getHeroSlug(h)}`} sx={{ textDecoration:'none', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'inline-block', width:{ xs: 160, sm: 'auto' }, textAlign:'left', px:0, py:0, borderRadius:2, bgcolor:'background.paper', overflow:'hidden' }}>
              {h.image ? (
                <CardMedia component="img" image={h.image} alt={h.name} sx={{ width: '100%', maxWidth:{ xs: '100%', sm: 160 }, height:{ xs: 96, sm: 96 }, objectFit: 'cover', borderRadius:'8px 8px 0 0', display:'block' }} />
              ) : (
                <Skeleton variant="rectangular" height={96} sx={{ width:'100%', maxWidth:{ xs: '100%', sm: 160 } }} />
              )}
              <CardContent sx={{ p:0.5, display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize:'0.9rem', mb:0.25 }}>{h.name}</Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:0.35, flexWrap:'nowrap' }}>
                  <Chip size="small" label={`Tier ${h.metaTier||'-'}`} sx={{ fontSize:10, px:0.25, py:0.15, minHeight:20, '& .MuiChip-label':{ px:0.4 } }} />
                  {h.winRate != null && (<Chip size="small" label={`WR ${(h.winRate||0).toFixed(2)}%`} color={(h.winRate||0)>=50?'success':'default'} sx={{ fontSize:10, px:0.25, py:0.15, minHeight:20, '& .MuiChip-label':{ px:0.4 } }} />)}
                  {h.pickRate != null && (<Chip size="small" label={`PR ${(h.pickRate||0).toFixed(2)}%`} color="info" sx={{ fontSize:10, px:0.25, py:0.15, minHeight:20, '& .MuiChip-label':{ px:0.4 } }} />)}
                </Box>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
      <Box className="top-counters-pagination" sx={{ mt: 1, display: 'flex', justifyContent: 'center', '& .swiper-pagination-bullet': { background: '#c9a063' } }} />
    </Box>
  );
});

export default TopCounters;
