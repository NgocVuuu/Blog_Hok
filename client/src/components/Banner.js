import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
      {/* Background: ảnh rõ nét, viền ngoài mờ dần bằng gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.95) 100%),
            linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.9) 100%),
            url(/banner.jpg) center/cover no-repeat
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
          py: 12,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h3" fontWeight={700} sx={{ textShadow: '0 2px 16px #000' }}>
          {t('home.welcome.title')}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, textShadow: '0 2px 8px #000' }}>
          {t('home.welcome.subtitle')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Banner; 