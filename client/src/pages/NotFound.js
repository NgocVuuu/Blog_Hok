import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: '#C9A063' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('common.notFound', 'Không tìm thấy trang')}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#C9A063',
            '&:hover': { bgcolor: '#B8956B' }
          }}
        >
          {t('common.backToHome', 'Về trang chủ')}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 