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
      {/* Fixed aspect ratio container for images */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        bgcolor: 'grey.200'
      }}>
        {item.thumbnail || item.image ? (
          <CardMedia
            component="img"
            image={item.thumbnail || item.image}
            alt={item.title}
            loading="lazy"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
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
