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
        willChange: 'transform'
      }}
    >
      {/* Background image with lazy loading */}
      <LazyImage
        src="/banner.jpg"
        alt="Banner"
        priority
        rootMargin="600px 0px"
        threshold={0}
        width={2000}
        height={420}
        sx={{
          position: 'absolute',
          inset: 0,
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Gradient overlays + blur: show on mobile and desktop; milder on mobile for perf */}
      <Box
        sx={{
          display: 'block',
          position: 'absolute',
          inset: 0,
          background: {
            xs: `linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 82%, rgba(255,255,255,0.92) 100%), linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.88) 100%)`,
            md: `linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.95) 100%), linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.9) 100%)`
          },
          zIndex: 1,
        }}
      />
      {/* Overlay blur viền ngoài */}
      <Box
        sx={{
          display: 'block',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          WebkitMaskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)`,
          maskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)`,
          backdropFilter: { xs: 'blur(8px)', md: 'blur(16px)' },
          opacity: { xs: 0.85, md: 1 }
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
        <Box
          sx={{
            background: 'rgba(255,255,255,0.55)',
            borderRadius: 2,
            px: 2,
            py: 1,
            display: 'inline-block',
            backdropFilter: { xs: 'none', sm: 'blur(4px)' },
            boxShadow: { xs: 'none', sm: '0 2px 16px 0 rgba(0,0,0,0.08)' },
            mb: 1,
            mt: { xs: 6, md: 10 },
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              textShadow: '0 2px 16px rgba(0,0,0,0.8)',
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {t('home.welcome.title')}
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'rgba(255,255,255,0.55)',
            borderRadius: 2,
            px: 2,
            py: 1,
            display: 'inline-block',
            backdropFilter: { xs: 'none', sm: 'blur(4px)' },
            boxShadow: { xs: 'none', sm: '0 2px 16px 0 rgba(0,0,0,0.08)' },
            mt: 2,
          }}
        >
          <Typography
            component="p"
            fontWeight={600}
            color="text.secondary"
            sx={{
              mb: 0,
              fontSize: { xs: 14, sm: 18 },
              lineHeight: 1.5,
              maxWidth: { xs: '100%', sm: 700, md: 900 },
              mx: 'auto',
              textAlign: 'center',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
            }}
          >
            {t('home.welcome.subtitle')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Banner; 