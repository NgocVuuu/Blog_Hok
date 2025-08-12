import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import { getAllHeroes } from '../services/heroService';
import LazyImage from './LazyImage';

const Heroes = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
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
    const fetchGuides = async () => {
      if (!API_URL) return;
      try {
        setLoadingGuides(true);
        const res = await fetch(`${API_URL}/api/news?category=guides&limit=5&sort=latest`);
        if (!res.ok) throw new Error('Failed to fetch guides');
        const json = await res.json();
        const posts = json.success ? json.data : (Array.isArray(json) ? json : []);
        setGuides(posts);
      } catch (e) {
        console.error('Fetch guides error', e);
        setGuides([]);
      } finally {
        setLoadingGuides(false);
      }
    };
    fetchHeroes();
    fetchGuides();
  }, [API_URL]);

  // NOTE: Removed early returns to keep hooks order consistent (eslint react-hooks/rules-of-hooks)

  // Filter + search
  const filteredHeroes = useMemo(() => {
    let list = Array.isArray(heroes) ? heroes : [];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(h =>
        (h.name && h.name.toLowerCase().includes(term)) ||
        (h.title && h.title.toLowerCase().includes(term))
      );
    }
    if (selectedRole !== 'all') {
      list = list.filter(h => Array.isArray(h.roles) && h.roles.includes(selectedRole));
    }
    return list;
  }, [heroes, searchTerm, selectedRole]);

  // Group by role after filtering
  const heroesByRole = useMemo(() => {
    return filteredHeroes.reduce((acc, hero) => {
      if (hero && Array.isArray(hero.roles)) {
        hero.roles.forEach(role => {
          if (!acc[role]) acc[role] = [];
          acc[role].push(hero);
        });
      }
      return acc;
    }, {});
  }, [filteredHeroes]);

  // Distinct roles for filter dropdown
  const allRoles = useMemo(() => {
    const set = new Set();
    heroes.forEach(h => Array.isArray(h.roles) && h.roles.forEach(r => set.add(r)));
    return Array.from(set).sort();
  }, [heroes]);

  // Precompute main heroes section content based on loading/error states
  let heroesSection;
  if (loading) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  } else if (Object.keys(heroesByRole).length === 0) {
    heroesSection = (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <Typography variant="h6" color="text.secondary">
          {t('heroes.noData', 'No heroes available')}
        </Typography>
      </Box>
    );
  } else {
    heroesSection = Object.keys(heroesByRole).sort().map((role) => (
      <Box key={role} sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2, fontWeight: 400 }}>
          {t(`roles.${role}`, role)}
        </Typography>
        <Grid container spacing={2}>
          {heroesByRole[role].map((hero) => (
            <Grid item xs={3} sm={4} md={2} key={hero._id}>
              <Card
                component={Link}
                to={`/heroes/${hero.slug}`}
                sx={{
                  height: { xs: 120, sm: 180, md: 220 },
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  borderRadius: { xs: 1, md: 2 },
                  overflow: 'hidden',
                  minHeight: { xs: 120, sm: 180, md: 220 },
                  '&:hover': {
                    transform: 'scale(1.03)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                <LazyImage
                  src={hero.image}
                  alt={hero.name}
                  height={{ xs: '85px', sm: '90px', md: '110px' }}
                  sx={{
                    objectFit: 'cover',
                    borderRadius: 0,
                    width: '100%',
                    minHeight: { xs: '85px', sm: '90px', md: '110px' }
                  }}
                  priority={false}
                  rootMargin="500px 0px"
                />
                <CardContent sx={{
                  p: { xs: '4px 6px', sm: 0.75, md: 1 },
                  flexGrow: 1,
                  minHeight: { xs: '35px', sm: 'auto', md: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:last-child': { pb: { xs: '4px', sm: '6px', md: '8px' } }
                }}>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    noWrap
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.8rem', md: '1rem' },
                      mb: { xs: '2px', sm: 0.5, md: 1 },
                      lineHeight: { xs: 1.2, sm: 1.1, md: 1.1 },
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {hero.name}
                  </Typography>
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
    ));
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={9}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            Hero List Honor Of King
          </Typography>
          {/* Controls */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder={t('heroes.search', 'Search heroes...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} displayEmpty>
                <MenuItem value="all">{t('heroes.roleAll', 'All Roles')}</MenuItem>
                {allRoles.map(r => (
                  <MenuItem key={r} value={r}>{t(`roles.${r}`, r)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedRole !== 'all' && (
              <Chip label={t(`roles.${selectedRole}`, selectedRole)} color="primary" onDelete={() => setSelectedRole('all')} />
            )}
          </Box>

          {heroesSection}
        </Grid>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: { xs: 0, md: 80 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              {t('heroes.guidesSidebar', 'Latest Guides')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {loadingGuides ? (
              <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
            ) : guides.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('heroes.noGuides', 'No guide posts')}
              </Typography>
            ) : (
              <List dense disablePadding>
                {guides.map(post => (
                  <ListItemButton
                    key={post._id}
                    component={Link}
                    to={`/news/${post.slug || post._id}`}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Heroes; 