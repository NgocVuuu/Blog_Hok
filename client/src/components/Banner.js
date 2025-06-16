import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LazyImage from './LazyImage';

const Banner = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '2000px',
        mx: 'auto',
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        mb: 4,
        minHeight: 420,
      }}
    >
      {/* Background image with lazy loading */}
      <LazyImage
        src="/banner.jpg"
        alt="Banner"
        sx={{
          position: 'absolute',
          inset: 0,
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Gradient overlays */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.95) 100%),
            linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.9) 100%)
          `,
          zIndex: 1,
        }}
      />
      {/* Overlay làm mờ viền ngoài */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          // Hiệu ứng blur viền ngoài bằng mask-image
          WebkitMaskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)`,
          maskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)`,
          backdropFilter: 'blur(16px)',
        }}
      />
      {/* Nội dung chữ */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          textAlign: 'center',
          py: { xs: 4, md: 6 },
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          height: '100%',
          paddingBottom: { xs: 6, md: 8 },
        }}
      >
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            textShadow: '0 2px 16px rgba(0,0,0,0.8)',
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            mb: 1
          }}
        >
          {t('home.welcome.title')}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.25rem' },
            opacity: 0.95
          }}
        >
          {t('home.welcome.subtitle')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Banner; 