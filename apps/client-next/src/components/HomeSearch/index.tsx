"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, Chip, Typography } from '@mui/material';
import { MdSearch as SearchIcon, MdCasino as CasinoIcon } from 'react-icons/md';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type Suggestion = { type: string; id?: string; title: string; image?: string; href: string };

export default function HomeSearch({ heroes = [], news = [] }:{heroes:any[];news:any[]}){
  const { t } = useTranslation();
  const [query,setQuery] = useState('');
  const [open,setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement|null>(null);

  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  const suggestions = React.useMemo(()=>{
    const term = (query||'').trim().toLowerCase();
    if (!term) return [] as Suggestion[];
    const heroMatches = (heroes||[]).filter(h=> (h.name||'').toLowerCase().includes(term)).slice(0,5).map(h=>({ type:'hero', id:h._id, title:h.name, image:h.image, href:`/heroes/${h.slug||h._id||(h.name||'').toLowerCase().replace(/\s+/g,'-')}` }));
    const newsMatches = (news||[]).filter(n=> (n.title||'').toLowerCase().includes(term)).slice(0,5).map(n=>({ type:'news', id:n._id, title:n.title, image:n.thumbnail||n.image, href:`/news/${n.slug||n._id}` }));
    return [...heroMatches, ...newsMatches].slice(0,10);
  },[query,heroes,news]);

  return (
    <Box sx={{ position:'relative', mb:3 }}>
      <TextField
        inputRef={searchRef}
        fullWidth
        placeholder={t('home.searchPlaceholder','Search heroes, equipment, news... (/ to focus)')}
        value={query}
        onChange={(e)=>{ setQuery(e.target.value); setOpen(Boolean(e.target.value)); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={()=>{ if (!heroes || heroes.length===0) return; const idx = Math.floor(Math.random()*heroes.length); const h = heroes[idx]; window.location.href = `/heroes/${h.slug||h._id||(h.name||'').toLowerCase().replace(/\s+/g,'-')}`; }} title={t('home.surprise','Surprise me')}>
                <CasinoIcon size={18} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      {open && suggestions.length>0 && (
        <Box sx={{ position:'absolute', zIndex:10, left:0, right:0, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', borderRadius:1, mt:1, maxHeight:360, overflowY:'auto', boxShadow:3 }}>
          {suggestions.map(s=> (
            <Box key={`${s.type}-${s.id}`} component={Link} href={s.href} onClick={()=>{ setQuery(''); setOpen(false); }} sx={{ display:'flex', gap:1, alignItems:'center', p:1, textDecoration:'none', color:'inherit' }}>
              {s.image ? <img src={s.image} alt={s.title} style={{ width:40,height:40,objectFit:'cover',borderRadius:6,border:'1px solid #eee' }} /> : <Box sx={{ width:40,height:40,bgcolor:'grey.200',borderRadius:1 }} />}
              <Chip size='small' label={s.type} sx={{ textTransform:'capitalize' }} />
              <Typography noWrap sx={{ fontWeight:600 }}>{s.title}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
