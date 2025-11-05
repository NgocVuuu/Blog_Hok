"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdBolt as BoltIcon, MdWhatshot as WhatshotIcon, MdConstruction as ConstructionIcon, MdArticle as ArticleIcon } from 'react-icons/md';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const links = [
  { icon: <BoltIcon size={20} />, labelKey: 'nav.meta', href: '/meta' },
  { icon: <WhatshotIcon size={20} />, labelKey: 'nav.arcana', href: '/arcana' },
  { icon: <ConstructionIcon size={20} />, labelKey: 'nav.equipment', href: '/equipment' },
  { icon: <ArticleIcon size={20} />, labelKey: 'nav.news', href: '/news' }
];

export default function QuickLinks(){
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: { xs: 1, sm: 3 }, mb: 4, px: { xs: 0.5, sm: 0 } }}>
      {links.map(l => (
        <Box 
          key={l.href} 
          component={Link} 
          prefetch={false}
          href={l.href} 
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
            boxShadow:1, 
            '&:hover':{ 
              boxShadow:4, 
              transform: 'translateY(-2px)', 
              bgcolor:'background.default' 
            } 
          }}
        >
          <Box sx={{ width:48, height:48, borderRadius:'50%', bgcolor:'grey.100', color:'primary.main', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 0 0 0 2px rgba(0,0,0,0.04)' }}>{l.icon}</Box>
          <Typography fontWeight={700} color="text.primary">{t(l.labelKey)}</Typography>
        </Box>
      ))}
    </Box>
  );
}
