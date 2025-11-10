import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

interface NewsCardProps {
  item: any;
}

const NewsCard = memo(function NewsCard({ item }: NewsCardProps) {
  return (
    <Card
      component={Link}
      prefetch={false}
      href={item.slug ? `/news/${item.slug}` : (item._id ? `/news/${item._id}` : '/news')}
      sx={{
        textDecoration: 'none',
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Responsive aspect-ratio container for images: square on mobile, 16:9 on larger screens */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        // Use modern aspect-ratio where supported; provide a conservative minHeight fallback for older browsers
  // Mobile: 3.8:2 (~1.9:1). Desktop: 16:9
  aspectRatio: { xs: '1.9 / 1', sm: '16 / 9' },
  minHeight: { xs: 120, sm: 'auto' },
        bgcolor: 'grey.200',
        overflow: 'hidden',
        // Fallback for browsers without aspect-ratio support: use padding-top technique
        '@supports not (aspect-ratio: 1 / 1)': {
          // padding-top is height/width * 100% -> (2 / 3.8) * 100% ≈ 52.63%
          paddingTop: { xs: '52.63%', sm: '56.25%' },
          minHeight: 'auto'
        }
      }}>
        {item.thumbnail || item.image ? (
          <CardMedia
            component="img"
            image={item.thumbnail || item.image}
            alt={item.title}
            loading="lazy"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : null}
      </Box>
      
      <CardContent sx={{ p: 1.2, flex: '1 1 auto' }}>
        <Typography 
          variant="subtitle2" 
          fontWeight={800} 
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.25,
            minHeight: '2.5em' // Reserve space for 2 lines
          }}
        >
          {item.title}
        </Typography>
        {item.createdAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

export default NewsCard;
