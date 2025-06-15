import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Card, CardContent, CardMedia,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

const Arcana = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [arcana, setArcana] = useState([]);
  const [filteredArcana, setFilteredArcana] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL;

  // Color options
  const colors = [
    { value: 'all', label: t('arcana.colors.all', 'Tất cả màu') },
    { value: 'red', label: t('arcana.colors.red', 'Đỏ') },
    { value: 'blue', label: t('arcana.colors.blue', 'Xanh dương') },
    { value: 'green', label: t('arcana.colors.green', 'Xanh lá') }
  ];

  // Tier options
  const tiers = [
    { value: 'all', label: t('arcana.tiers.all', 'Tất cả cấp') },
    { value: '1', label: t('arcana.tiers.1', 'Cấp 1') },
    { value: '2', label: t('arcana.tiers.2', 'Cấp 2') },
    { value: '3', label: t('arcana.tiers.3', 'Cấp 3') }
  ];

  useEffect(() => {
    const fetchArcana = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/arcana`);
        if (!res.ok) throw new Error('Failed to fetch arcana');
        const response = await res.json();
        // Handle new API response format
        const arcanaData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setArcana(arcanaData);
        setFilteredArcana(arcanaData);
      } catch (err) {
        console.error('Error fetching arcana:', err);
        setArcana([]);
        setFilteredArcana([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArcana();
  }, [API_URL]);

  // Apply filters
  useEffect(() => {
    let result = [...arcana];

    // Apply color filter
    if (colorFilter !== 'all') {
      result = result.filter(item => item.color === colorFilter);
    }

    // Apply tier filter
    if (tierFilter !== 'all') {
      result = result.filter(item => item.tier === parseInt(tierFilter));
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(term) || 
          (item.description && item.description.toLowerCase().includes(term))
      );
    }

    setFilteredArcana(result);
  }, [arcana, searchTerm, colorFilter, tierFilter]);

  const getColorChipColor = (color) => {
    switch (color) {
      case 'red': return '#f44336';
      case 'blue': return '#2196f3';
      case 'green': return '#4caf50';
      default: return '#757575';
    }
  };

  // renderAttributes function removed - not used in compact design

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
          {t('arcana.title', 'Arcana')}
        </Typography>
        
        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('arcana.search', 'Tìm kiếm arcana...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Color Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="color-filter-label">
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('arcana.filter', 'Lọc theo màu')}
              </InputLabel>
              <Select
                labelId="color-filter-label"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                label={t('arcana.filter', 'Lọc theo màu')}
              >
                {colors.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    {color.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tier Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="tier-filter-label">Cấp độ</InputLabel>
              <Select
                labelId="tier-filter-label"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                label="Cấp độ"
              >
                {tiers.map((tier) => (
                  <MenuItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Arcana Grid - Grouped by Color */}
        {filteredArcana.length > 0 ? (
          <>
            {['red', 'blue', 'green'].map((color) => {
              const colorArcana = filteredArcana.filter(item => item.color === color);
              if (colorArcana.length === 0) return null;

              return (
                <Box key={color} mb={4}>
                  <Typography variant="h5" fontWeight={700} mb={2}
                    sx={{
                      color: getColorChipColor(color),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Chip
                      label={t(`arcana.colors.${color}`, color)}
                      sx={{
                        bgcolor: getColorChipColor(color),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        height: '32px'
                      }}
                    />
                    ({colorArcana.length} arcana)
                  </Typography>

                  <Grid container spacing={1}>
                    {colorArcana.map((item) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={item._id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            border: `1px solid ${getColorChipColor(item.color)}40`
                          }}
                        >
                          {item.image && (
                            <CardMedia
                              component="img"
                              height="60"
                              image={item.image}
                              alt={item.name}
                              sx={{
                                objectFit: 'contain',
                                bgcolor: `${getColorChipColor(item.color)}10`,
                                p: 0.5
                              }}
                            />
                          )}
                          <CardContent sx={{ flexGrow: 1, p: 1, textAlign: 'center' }}>
                            <Typography
                              variant="caption"
                              component="h3"
                              fontWeight={600}
                              mb={0.5}
                              sx={{
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.6rem',
                                lineHeight: 1.1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.description}
                            </Typography>
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
              {t('arcana.noResults', 'Không tìm thấy arcana nào')}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Arcana;
