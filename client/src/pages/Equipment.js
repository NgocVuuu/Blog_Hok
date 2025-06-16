import { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useTranslation } from 'react-i18next';
import LazyImage from '../components/LazyImage';

// Import lane icons
import roamIcon from '../assets/images/lanes/Roam.png';
import farmLaneIcon from '../assets/images/lanes/Farm_Lane.png';
import midLaneIcon from '../assets/images/lanes/Mid_Lane.png';
import abyssalLaneIcon from '../assets/images/lanes/Abyssal_Lane.png';
import jungleIcon from '../assets/images/lanes/Jungle.png';

const Equipment = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const API_URL = process.env.REACT_APP_API_URL;



  // Category options - 5 main categories with lane icons
  const categories = [
    {
      value: 'all',
      label: t('equipment.categories.all', 'Tất cả'),
      icon: roamIcon,
      color: '#666'
    },
    {
      value: 'Attack',
      label: t('equipment.categories.physical', 'Vật lý'),
      icon: farmLaneIcon,
      color: '#d32f2f'
    },
    {
      value: 'Magic',
      label: t('equipment.categories.magic', 'Phép thuật'),
      icon: midLaneIcon,
      color: '#7b2ff2'
    },
    {
      value: 'Defense',
      label: t('equipment.categories.defense', 'Phòng thủ'),
      icon: abyssalLaneIcon,
      color: '#43a047'
    },
    {
      value: 'Movement',
      label: t('equipment.categories.movement', 'Di chuyển'),
      icon: roamIcon,
      color: '#ff9800'
    },
    {
      value: 'Jungle',
      label: t('equipment.categories.jungle', 'Jungling'),
      icon: jungleIcon,
      color: '#795548'
    }
  ];

  // Remove tier system - not needed

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/equipment`);
        if (!res.ok) throw new Error('Failed to fetch equipment');
        const response = await res.json();
        // Handle new API response format
        const equipmentData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setEquipment(equipmentData);
        setFilteredEquipment(equipmentData);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setEquipment([]);
        setFilteredEquipment([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [API_URL]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...equipment];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Tier filter removed

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(term) || 
          (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredEquipment(result);
  }, [equipment, searchTerm, categoryFilter, sortBy]);

  const formatPrice = (price) => {
    return price ? price.toLocaleString() : '0';
  };

  // Group equipment by category
  const groupEquipmentByCategory = (equipmentList) => {
    const grouped = {};
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        grouped[cat.value] = equipmentList.filter(item => item.category === cat.value);
      }
    });
    return grouped;
  };

  const groupedEquipment = groupEquipmentByCategory(filteredEquipment);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 1, md: 4 } }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {t('equipment.title', 'Trang bị')}
        </Typography>

        {/* Category Summary */}
        {categoryFilter === 'all' && !searchTerm && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {categories.slice(1).map((category) => {
                const count = groupedEquipment[category.value]?.length || 0;
                return (
                  <Grid item xs={6} sm={4} md={2.4} key={category.value}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => setCategoryFilter(category.value)}
                    >
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={category.icon}
                          alt={category.label}
                          style={{
                            width: 48,
                            height: 48,
                            filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
                          }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#C9A063' }}>
                        {count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.label}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
        
        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('equipment.search', 'Tìm kiếm trang bị...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('equipment.filter', 'Lọc theo loại')}
              </InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label={t('equipment.filter', 'Lọc theo loại')}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.value}
                    value={category.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: category.color
                    }}
                  >
                    <img
                      src={category.icon}
                      alt={category.label}
                      style={{
                        width: 20,
                        height: 20,
                        filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
                      }}
                    />
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Options */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">{t('common.sort', 'Sắp xếp')}</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t('common.sort', 'Sắp xếp')}
              >
                <MenuItem value="name">{t('equipment.sortName', 'Tên (A-Z)')}</MenuItem>
                <MenuItem value="price">{t('equipment.sortPrice', 'Giá (Cao → Thấp)')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Equipment Display */}
        {filteredEquipment.length > 0 ? (
          categoryFilter === 'all' && !searchTerm ? (
            // Display by categories when showing all
            <Box>
              {categories.slice(1).map((category) => {
                const categoryItems = groupedEquipment[category.value] || [];
                if (categoryItems.length === 0) return null;

                return (
                  <Box key={category.value} sx={{ mb: 6 }}>
                    {/* Category Header */}
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={3}
                      sx={{
                        background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
                        borderRadius: 3,
                        p: 2,
                        border: `2px solid ${category.color}30`
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                          color: category.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <img
                          src={category.icon}
                          alt={category.label}
                          style={{
                            width: 32,
                            height: 32,
                            filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
                          }}
                        />
                        {category.label}
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            ml: 1,
                            color: 'text.secondary',
                            fontWeight: 400
                          }}
                        >
                          ({categoryItems.length})
                        </Typography>
                      </Typography>
                    </Box>

                    {/* Category Items Grid */}
                    <Grid container spacing={{ xs: 1, md: 3 }}>
                      {categoryItems.map((item) => (
                        <Grid item xs={6} sm={6} md={4} lg={3} key={item._id}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              border: `2px solid ${category.color}20`,
                              borderRadius: 3
                            }}
                          >
                            {item.image && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                                <LazyImage
                                  src={item.image}
                                  alt={item.name}
                                  width={{ xs: "80px", md: "110px" }}
                                  height={{ xs: "80px", md: "110px" }}
                                  sx={{
                                    objectFit: 'contain',
                                    bgcolor: '#f8f9fa',
                                    p: { xs: 0.5, md: 1 },
                                    // border: '2px solid #C9A063',
                                    borderRadius: 1
                                  }}
                                />
                              </Box>
                            )}
                            <CardContent sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
                              {/* Item Name */}
                              <Typography
                                variant="h6"
                                component="h3"
                                fontWeight={700}
                                mb={1}
                                sx={{
                                  fontSize: { xs: '0.8rem', md: '1rem' },
                                  lineHeight: 1.3,
                                  color: category.color
                                }}
                              >
                                {item.name}
                              </Typography>

                              {/* Price */}
                              <Box display="flex" alignItems="center" mb={2}>
                                <AttachMoneyIcon sx={{ fontSize: '1rem', color: '#C9A063', mr: 0.5 }} />
                                <Typography variant="body2" color="#C9A063" fontWeight={700}>
                                  {formatPrice(item.price)} {t('equipment.gold', 'Gold')}
                                </Typography>
                              </Box>

                              {/* Stats */}
                              {item.stats && Object.keys(item.stats).length > 0 && (
                                <Box mb={2}>
                                  <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.primary">
                                    {t('equipment.stats', 'Chỉ số')}:
                                  </Typography>
                                  <Box sx={{ pl: 1 }}>
                                    {Object.entries(item.stats).map(([stat, value]) => (
                                      <Typography
                                        key={stat}
                                        variant="caption"
                                        display="block"
                                        sx={{
                                          fontSize: '0.75rem',
                                          color: 'text.secondary',
                                          mb: 0.3
                                        }}
                                      >
                                        +{value} {stat}
                                      </Typography>
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {/* Passive Effect */}
                              {item.passive && (
                                <Box mb={2}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    mb={1}
                                    sx={{ color: category.color }}
                                  >
                                    {item.passive.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.75rem',
                                      lineHeight: 1.4,
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}
                                  >
                                    {item.passive.description}
                                  </Typography>
                                </Box>
                              )}

                              {/* Active Effect */}
                              {item.active && (
                                <Box mb={2}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    mb={1}
                                    sx={{ color: '#ff6b35' }}
                                  >
                                    {t('equipment.active', 'Kích hoạt')}: {item.active.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.75rem',
                                      lineHeight: 1.4,
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}
                                  >
                                    {item.active.description}
                                  </Typography>
                                  {item.active.cooldown && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: '0.7rem',
                                        color: '#ff6b35',
                                        fontWeight: 600,
                                        display: 'block',
                                        mt: 0.5
                                      }}
                                    >
                                      {t('equipment.cooldown', 'Hồi chiêu')}: {item.active.cooldown}s
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              {/* Description */}
                              {item.description && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      lineHeight: 1.3,
                                      color: 'text.disabled',
                                      fontStyle: 'italic',
                                      display: 'block'
                                    }}
                                  >
                                    {item.description}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Regular grid when filtered
            <Grid container spacing={{ xs: 1, md: 3 }}>
              {filteredEquipment.map((item) => {
                const category = categories.find(cat => cat.value === item.category) || categories[0];
                return (
                  <Grid item xs={6} sm={6} md={4} lg={3} key={item._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: `2px solid ${category.color}20`,
                        borderRadius: 3
                      }}
                    >
                      {item.image && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                          <LazyImage
                            src={item.image}
                            alt={item.name}
                            width={{ xs: "80px", md: "110px" }}
                            height={{ xs: "80px", md: "110px" }}
                            sx={{
                              objectFit: 'contain',
                              bgcolor: '#f8f9fa',
                              p: { xs: 0.5, md: 1 },
                              border: '2px solid #C9A063',
                              borderRadius: 1
                            }}
                          />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
                        {/* Item Name */}
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight={700}
                          mb={1}
                          sx={{
                            fontSize: '1rem',
                            lineHeight: 1.3,
                            color: category.color
                          }}
                        >
                          {item.name}
                        </Typography>

                        {/* Price */}
                        <Box display="flex" alignItems="center" mb={2}>
                          <AttachMoneyIcon sx={{ fontSize: '1rem', color: '#C9A063', mr: 0.5 }} />
                          <Typography variant="body2" color="#C9A063" fontWeight={700}>
                            {formatPrice(item.price)} {t('equipment.gold', 'Gold')}
                          </Typography>
                        </Box>

                        {/* Stats */}
                        {item.stats && Object.keys(item.stats).length > 0 && (
                          <Box mb={2}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.primary">
                              {t('equipment.stats', 'Chỉ số')}:
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <Typography
                                  key={stat}
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    mb: 0.3
                                  }}
                                >
                                  +{value} {stat}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Passive Effect */}
                        {item.passive && (
                          <Box mb={2}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              mb={1}
                              sx={{ color: category.color }}
                            >
                              {item.passive.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                                color: 'text.secondary',
                                display: 'block'
                              }}
                            >
                              {item.passive.description}
                            </Typography>
                          </Box>
                        )}

                        {/* Active Effect */}
                        {item.active && (
                          <Box mb={2}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              mb={1}
                              sx={{ color: '#ff6b35' }}
                            >
                              {t('equipment.active', 'Kích hoạt')}: {item.active.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                                color: 'text.secondary',
                                display: 'block'
                              }}
                            >
                              {item.active.description}
                            </Typography>
                            {item.active.cooldown && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  color: '#ff6b35',
                                  fontWeight: 600,
                                  display: 'block',
                                  mt: 0.5
                                }}
                              >
                                {t('equipment.cooldown', 'Hồi chiêu')}: {item.active.cooldown}s
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Description */}
                        {item.description && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                lineHeight: 1.3,
                                color: 'text.disabled',
                                fontStyle: 'italic',
                                display: 'block'
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              {t('equipment.noResults', 'Không tìm thấy trang bị nào')}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Equipment;
