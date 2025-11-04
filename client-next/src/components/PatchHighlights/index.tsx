"use client";
import React from 'react';
import { Card, CardContent, CardMedia, Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PatchHighlights({ item, loading }:{item:any, loading?:boolean}){
  const { t } = useTranslation();
  if (loading) return <div style={{height: '100%'}}>Loading...</div>;
  if (!item) return <div style={{height: '100%'}}>No highlights</div>;

  return (
    <Card sx={{ height: { xs: 'auto', md: 400 }, display: 'flex', flexDirection: 'column', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
      {item.thumbnail || item.image ? (
        <CardMedia component="img" image={item.thumbnail || item.image} alt={item.title} sx={{ height: { xs: 180, md: 300 }, width: '100%', objectFit: 'cover' }} />
      ) : (
        <Box sx={{ height: { xs: 180, md: 300 }, bgcolor: 'grey.100' }} />
      )}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={800}>{item.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5 }}>
          {item.excerpt || item.description || ''}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Button component={Link} href="/news" size="small">{t('home.viewFull','View full')}</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
