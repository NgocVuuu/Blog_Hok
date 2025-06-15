import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAllHeroes } from '../services/heroService';
import LazyImage from './LazyImage';

const Heroes = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const data = await getAllHeroes();
        // Ensure data is always an array
        const heroesData = Array.isArray(data) ? data : [];
        setHeroes(heroesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setError(err.message);
        setHeroes([]);
        setLoading(false);
      }
    };

    fetchHeroes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Ensure heroes is an array and group by role
  const heroesArray = Array.isArray(heroes) ? heroes : [];
  const heroesByRole = heroesArray.reduce((acc, hero) => {
    if (hero && hero.roles && Array.isArray(hero.roles)) {
      hero.roles.forEach((role) => {
        if (!acc[role]) acc[role] = [];
        acc[role].push(hero);
      });
    }
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('heroes.title', 'Danh sách Tướng')}
      </Typography>
      {Object.keys(heroesByRole).length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <Typography variant="h6" color="text.secondary">
            {t('heroes.noData', 'No heroes available')}
          </Typography>
        </Box>
      ) : (
        Object.keys(heroesByRole).map((role) => (
        <Box key={role} sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            {t(`roles.${role}`, role)}
          </Typography>
          <Grid container spacing={2}>
            {heroesByRole[role].map((hero) => (
              <Grid item xs={3} sm={4} md={2} key={hero._id}>
                <Card
                  component={Link}
                  to={`/heroes/${hero.slug}`}
                  sx={{
                    height: { xs: 90, sm: 180, md: 220 },
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      transition: 'transform 0.2s',
                    },
                  }}
                >
                  <LazyImage
                    src={hero.image}
                    alt={hero.name}
                    height={{ xs: "80px", sm: "90px", md: "110px" }}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{
                    p: { xs: '2px 4px', sm: 0.75, md: 1 },
                    flexGrow: 1,
                    minHeight: 'auto',
                    '&:last-child': { pb: '2px' }
                  }}>
                    <Typography
                      variant="subtitle1"
                      component="h2"
                      noWrap
                      sx={{
                        fontSize: { xs: '0.6rem', sm: '0.8rem', md: '1rem' },
                        mb: { xs: '1px', sm: 0.5, md: 1 },
                        lineHeight: 1.1,
                        fontWeight: 600
                      }}
                    >
                      {hero.name}
                    </Typography>

                    {/* Mobile: Show roles and lanes compactly */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Stack direction="row" spacing={0.25} flexWrap="wrap" gap={0.25}>
                        {hero.roles.slice(0, 1).map((role) => (
                          <Chip
                            key={role}
                            label={t(`roles.${role}`, role)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: '0.45rem',
                              height: '14px',
                              minWidth: 'auto',
                              '& .MuiChip-label': { px: 0.4, py: 0 }
                            }}
                          />
                        ))}
                        {hero.lanes && hero.lanes.slice(0, 1).map((lane) => (
                          <Chip
                            key={lane}
                            label={t(`lanes.${lane}`, lane)}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{
                              fontSize: '0.45rem',
                              height: '14px',
                              minWidth: 'auto',
                              '& .MuiChip-label': { px: 0.4, py: 0 }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Desktop: Show title and all roles */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.875rem' }
                      }}
                    >
                      {hero.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      gap={0.5}
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                      {hero.roles.map((role) => (
                        <Chip
                          key={role}
                          label={t(`roles.${role}`, role)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: '20px' }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        ))
      )}
    </Container>
  );
};

export default Heroes; 