import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Card, CardContent, CardMedia,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Chip, Tabs, Tab, Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Meta = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL;

  // Role options for tabs
  const roles = [
    { value: 'all', label: t('meta.roles.all', 'Tất cả') },
    { value: 'Marksman', label: t('roles.Marksman', 'Xạ thủ') },
    { value: 'Mage', label: t('roles.Mage', 'Pháp sư') },
    { value: 'Tank', label: t('roles.Tank', 'Đỡ đòn') },
    { value: 'Support', label: t('roles.Support', 'Hỗ trợ') },
    { value: 'Assassin', label: t('roles.Assassin', 'Sát thủ') },
    { value: 'Fighter', label: t('roles.Fighter', 'Đấu sĩ') }
  ];

  // Tier options
  const tiers = [
    { value: 'all', label: t('meta.tiers.all', 'Tất cả tier') },
    { value: 'S', label: t('meta.tiers.S', 'S Tier') },
    { value: 'A', label: t('meta.tiers.A', 'A Tier') },
    { value: 'B', label: t('meta.tiers.B', 'B Tier') },
    { value: 'C', label: t('meta.tiers.C', 'C Tier') }
  ];

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/heroes`);
        if (!res.ok) throw new Error('Failed to fetch heroes');
        const response = await res.json();
        // Handle new API response format
        const heroesData = response.success ? response.data : (Array.isArray(response) ? response : []);
        // Filter only heroes with meta tier A or S
        const metaHeroes = heroesData.filter(hero =>
          hero.metaTier && ['S', 'A', 'B'].includes(hero.metaTier)
        );
        setHeroes(metaHeroes);
        setFilteredHeroes(metaHeroes);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setHeroes([]);
        setFilteredHeroes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, [API_URL]);

  // Apply filters
  useEffect(() => {
    let result = [...heroes];

    // Apply role filter
    if (selectedRole !== 'all') {
      result = result.filter(hero =>
        hero.roles && hero.roles.includes(selectedRole)
      );
    }

    // Apply tier filter
    if (tierFilter !== 'all') {
      result = result.filter(hero => hero.metaTier === tierFilter);
    }

    // Sort by tier (S > A > B > C)
    result.sort((a, b) => {
      const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
      return tierOrder[b.metaTier] - tierOrder[a.metaTier];
    });

    setFilteredHeroes(result);
  }, [heroes, selectedRole, tierFilter]);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'S': return '#ff4444';
      case 'A': return '#ff8800';
      case 'B': return '#ffcc00';
      case 'C': return '#88cc00';
      default: return '#757575';
    }
  };

  const getTierLabel = (tier) => {
    return t(`meta.tierLabels.${tier}`, tier);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {t('meta.title', 'Meta Tướng')}
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          {t('meta.description', 'Danh sách các tướng đang mạnh trong meta hiện tại, được xếp hạng từ S đến C tier')}
        </Typography>

        {/* Role Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedRole}
            onChange={(_, newValue) => setSelectedRole(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2
              }
            }}
          >
            {roles.map((role) => (
              <Tab
                key={role.value}
                value={role.value}
                label={role.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tier Filter */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="tier-filter-label">{t('meta_tier', 'Meta Tier')}</InputLabel>
            <Select
              labelId="tier-filter-label"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              label={t('meta_tier', 'Meta Tier')}
            >
              {tiers.map((tier) => (
                <MenuItem key={tier.value} value={tier.value}>
                  {tier.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Heroes Grid - Grouped by Tier */}
        {filteredHeroes.length > 0 ? (
          <>
            {['S', 'A', 'B', 'C'].map((tier) => {
              const tierHeroes = filteredHeroes.filter(hero => hero.metaTier === tier);
              if (tierHeroes.length === 0) return null;

              return (
                <Box key={tier} mb={4}>
                  <Typography variant="h5" fontWeight={700} mb={2}
                    sx={{
                      color: getTierColor(tier),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Chip
                      label={getTierLabel(tier)}
                      sx={{
                        bgcolor: getTierColor(tier),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        height: '32px'
                      }}
                    />
                    ({tierHeroes.length} {t('meta.heroCount')})
                  </Typography>

                  <Grid container spacing={1}>
                    {tierHeroes.map((hero) => (
                      <Grid item xs={4} sm={3} md={2} lg={1.5} key={hero._id}>
                        <Card
                          component={Link}
                          to={`/heroes/${hero.slug || hero.name.toLowerCase().replace(/\s+/g, '-')}`}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            textDecoration: 'none',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: `1px solid ${getTierColor(tier)}40`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 2,
                              border: `1px solid ${getTierColor(tier)}`
                            }
                          }}
                        >
                          {hero.image ? (
                            <CardMedia
                              component="img"
                              height="80"
                              image={hero.image}
                              alt={hero.name}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Avatar
                              sx={{
                                width: '100%',
                                height: 80,
                                bgcolor: getTierColor(tier),
                                fontSize: '2rem',
                                borderRadius: 0
                              }}
                            >
                              {hero.name.charAt(0)}
                            </Avatar>
                          )}
                          <CardContent sx={{ flexGrow: 1, p: 1, textAlign: 'center' }}>
                            <Typography
                              variant="caption"
                              component="h3"
                              fontWeight={600}
                              color="text.primary"
                              sx={{
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {hero.name}
                            </Typography>

                            {/* Stats - Win Rate and Pick Rate */}
                            <Box>
                              {hero.winRate && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: hero.winRate >= 50 ? '#4caf50' : '#f44336',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    display: 'block'
                                  }}
                                >
                                  {t('win_rate', 'WR')}: {hero.winRate}%
                                </Typography>
                              )}
                              {hero.pickRate && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.6rem',
                                    display: 'block'
                                  }}
                                >
                                  {t('pick_rate', 'PR')}: {hero.pickRate}%
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              {t('meta.noHeroes', 'Không tìm thấy tướng nào trong meta')}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Meta; 