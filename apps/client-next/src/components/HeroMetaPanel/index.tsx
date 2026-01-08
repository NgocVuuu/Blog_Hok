"use client";
import React, { useMemo, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Link from 'next/link';

function getHeroSlug(hero: any) {
  return hero?.slug || (hero?.name ? hero.name.toLowerCase().replace(/\s+/g, '-') : '');
}

export default function HeroMetaPanel({ heroes = [], loading = false, lastUpdated = null }: { heroes: any[]; loading?: boolean; lastUpdated?: Date | null }) {
  const [laneFilter, setLaneFilter] = useState('All');
  const [sortBy, setSortBy] = useState('winRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const laneMap = useMemo<Record<string, string[]>>(() => ({ All: [], Clash: ['Clash Lane', 'Abyssal Lane'], Mid: ['Mid Lane'], Farm: ['Farm Lane'], Roaming: ['Roam'], Jungling: ['Jungle'] }), []);

  const pct = (v: any) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '-');

  const filteredSortedHeroes = useMemo(() => {
    const lanesWanted = (laneMap as Record<string, string[]>)[laneFilter] || [];
    let list = Array.isArray(heroes) ? heroes.slice() : [];
    if (lanesWanted.length > 0) {
      list = list.filter(h => (h.lanes || []).some((l: any) => lanesWanted.includes(l)));
    }
    list.sort((a: any, b: any) => {
      let av: any, bv: any;
      switch (sortBy) {
        case 'name': av = a.name || ''; bv = b.name || ''; return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        case 'pickRate': av = a.pickRate || 0; bv = b.pickRate || 0; break;
        case 'banRate': av = a.banRate || 0; bv = b.banRate || 0; break;
        case 'tier':
          const tierMap: any = { S: 4, A: 3, B: 2, C: 1 };
          av = tierMap[a.metaTier] || 0;
          bv = tierMap[b.metaTier] || 0;
          break;
        case 'winRate':
        default: av = a.winRate || 0; bv = b.winRate || 0; break;
      }
      const diff = (av || 0) - (bv || 0);
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [heroes, laneFilter, sortBy, sortDir, laneMap]);

  const lanes = Object.keys(laneMap);

  const SortHeader = ({ label, field }: { label: string; field: string }) => {
    const active = sortBy === field;
    const dir = sortDir;
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

  return (
    <Box sx={{
      height: { xs: 500, md: 400 },
      border: '1px solid',
      borderColor: 'primary.main',
      borderRadius: 2,
      boxShadow: 3,
      overflow: 'hidden',
      bgcolor: 'grey.50',
      display: 'flex',
      flexDirection: 'column',
      color: 'text.primary'
    }}>
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 1 }}>
          {lanes.map(key => (
            <Chip key={key} size="small" label={key} color={laneFilter === key ? 'warning' : 'default'} onClick={() => setLaneFilter(key)} sx={{ width: '100%', justifyContent: 'center', fontWeight: 600 }} />
          ))}
        </Box>
        {lastUpdated && (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              {`Updated ${new Date(lastUpdated).toLocaleDateString()}`}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr 36px 56px 56px 56px', md: '1.25fr 52px 72px 72px 72px' }, alignItems: 'center', gap: { xs: 0.75, md: 1 } }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 11 }}>Heroes</Typography>
        <SortHeader label="Tier" field="tier" />
        <SortHeader label="Win" field="winRate" />
        <SortHeader label="Pick" field="pickRate" />
        <SortHeader label="Ban" field="banRate" />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>Loading heroes...</Box>
        ) : (
          filteredSortedHeroes.map((h: any) => (
            <Box key={h._id || h.slug} component={Link} href={`/heroes/${getHeroSlug(h)}`} prefetch={false} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 36px 56px 56px 56px', md: '1.25fr 52px 72px 72px 72px' }, gap: { xs: 0.75, md: 1 }, alignItems: 'center', px: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                {h.image ? (
                  // Use a positioned img that absolutely fills the wrapper to
                  // guarantee it covers the box on all viewports (esp. mobile)
                  <Box sx={{ width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #eee', flex: '0 0 auto', bgcolor: 'grey.50', position: 'relative', pt: { xs: '30px', md: 0 } }}>
                    <Box
                      component="img"
                      src={h.image}
                      alt={h.name}
                      loading="lazy"
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: { xs: '10px', md: 0 },
                        width: '100% !important',
                        height: { xs: 'calc(100% - 10px) !important', md: '100% !important' },
                        objectFit: 'cover',
                        display: 'block',
                        transform: { xs: 'scale(1.9)', md: 'scale(1)' },
                        transformOrigin: 'center',
                        transition: 'transform 180ms ease'
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: 1, bgcolor: 'grey.200' }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} title={h.name} sx={{ whiteSpace: 'normal', lineHeight: 1.2 }}>{h.name}</Typography>
                  {Array.isArray(h.lanes) && h.lanes.length > 0 && (
                    <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ display: 'block', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2, mt: 0.25 }}>
                      {h.lanes[0] === 'Abyssal Lane' ? 'Clash Lane' : h.lanes[0]}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ textAlign: 'center', color: '#FFD600', fontSize: 13 }}>{h.metaTier || '-'}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: (h.winRate || 0) >= 50 ? '#43a047' : '#d32f2f', textAlign: 'right', boxShadow: 'none', fontSize: 13 }}>{pct(h.winRate)}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#1976d2', textAlign: 'right', boxShadow: 'none', fontSize: 13 }}>{pct(h.pickRate)}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#d32f2f', textAlign: 'right', fontSize: 13 }}>{pct(h.banRate)}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
