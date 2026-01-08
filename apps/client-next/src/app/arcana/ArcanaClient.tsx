"use client";
import React, { useEffect, useState, useMemo, useTransition, useCallback, memo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';
import CalculatorButton from '@/components/CalculatorButton';

// Helper function to get color chip colors
const getColorChipColor = (color: string) => {
  switch (color) {
    case 'red': return '#d32f2f';
    case 'blue': return '#1976d2';
    case 'green': return '#388e3c';
    default: return '#757575';
  }
};

// Memoized ArcanaCard component
const ArcanaCard = memo(({ item, index, t }: any) => {
  // Try multiple data sources for attributes
  const mainAttributes = Object.entries(item.attributes || {})
    .filter(([key, value]) => (value as number) > 0)
    .slice(0, 3)
    .map(([key, value]) => `${key} +${value}`)
    .join('\n');

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${getColorChipColor(item.color)}40`,
        contentVisibility: 'auto',
        containIntrinsicSize: { xs: '0 120px', sm: '0 160px', md: '0 200px' }
      }}
    >
      {item.image && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: `${getColorChipColor(item.color)}10`,
            p: { xs: 0.5, sm: 0.5 },
            height: { xs: '60px', sm: '80px', md: '90px' }
          }}
        >
          <Box
            component="img"
            src={item.image}
            alt={item.name}
            loading={index < 8 ? 'eager' : 'lazy'}
            sx={{
              maxHeight: { xs: '50px', sm: '70px', md: '80px' },
              maxWidth: { xs: '50px', sm: '70px', md: '80px' },
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: 1, textAlign: 'center' }}>
        <Typography
          variant="caption"
          component="h3"
          fontWeight={600}
          mb={0.5}
          sx={{
            fontSize: '0.7rem',
            color: getColorChipColor(item.color),
            lineHeight: 1.2,
            minHeight: '28px'
          }}
        >
          {item.name}
        </Typography>

        {/* Show attributes or description */}
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: 'text.secondary',
            lineHeight: 1.3,
            whiteSpace: 'pre-line',
            display: 'block'
          }}
        >
          {mainAttributes || item.description || ''}
        </Typography>
      </CardContent>
    </Card>
  );
});

ArcanaCard.displayName = 'ArcanaCard';

export default function ArcanaClient() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [arcana, setArcana] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [visibleColors, setVisibleColors] = useState<string[]>(['red']); // Lazy render colors

  // Color options
  const colors = [
    { value: 'all', label: t('arcana.colors.all', 'Tất cả màu') },
    { value: 'red', label: t('arcana.colors.red', 'Đỏ') },
    { value: 'blue', label: t('arcana.colors.blue', 'Xanh dương') },
    { value: 'green', label: t('arcana.colors.green', 'Xanh lá') }
  ];

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchArcana = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const res = await axios.get(`${API_URL}/api/arcana`, {
          signal: abortController.signal
        });
        const data = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (mounted) {
          startTransition(() => {
            setArcana(data);
            setLoading(false);
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return;
        }
        console.error(err);
        if (mounted) {
          startTransition(() => {
            setArcana([]);
            setLoading(false);
          });
        }
      }
    };

    // Deferred fetch - allow initial render first
    const timerId = setTimeout(() => {
      setLoading(true);
      fetchArcana();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timerId);
      abortController.abort();
    };
  }, []);

  // Progressive loading of color sections to reduce initial render time
  useEffect(() => {
    if (arcana.length === 0 || colorFilter !== 'all' || searchTerm) {
      // Show all when filtering/searching
      setVisibleColors(['red', 'blue', 'green']);
      return;
    }

    // Progressive loading: red → blue → green
    const timer1 = setTimeout(() => {
      setVisibleColors(['red', 'blue']);
    }, 100);

    const timer2 = setTimeout(() => {
      setVisibleColors(['red', 'blue', 'green']);
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [arcana.length, colorFilter, searchTerm]);

  // Optimized filtering with useMemo
  const filteredArcana = useMemo(() => {
    // Color filter first (cheapest)
    let result = colorFilter !== 'all'
      ? arcana.filter((item: any) => item.color === colorFilter)
      : arcana;

    // Then search if needed
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item: any) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    return result;
  }, [arcana, colorFilter, searchTerm]);

  // Simplified quick search - just check starts with, then includes
  const quickMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const startsWith: any[] = [];
    const includes: any[] = [];

    for (const item of arcana) {
      const name = (item.name || '').toLowerCase();
      if (name.startsWith(term)) {
        startsWith.push(item);
        if (startsWith.length >= 8) break;
      } else if (name.includes(term) && includes.length < 8) {
        includes.push(item);
      }
    }

    return [...startsWith, ...includes].slice(0, 8);
  }, [arcana, searchTerm]);

  // Pre-compute grouped arcana by color to avoid filtering in render
  const groupedByColor = useMemo(() => {
    const groups: Record<string, any[]> = {
      red: [],
      blue: [],
      green: []
    };

    filteredArcana.forEach((item: any) => {
      if (groups[item.color]) {
        groups[item.color].push(item);
      }
    });

    return groups;
  }, [filteredArcana]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          {t('arcana.title', 'Arcana')}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <CalculatorButton size="medium" />
        </Box>
      </Box>

      {/* Search and Filter Controls */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4, mt: 2 }}>
        {/* Search Field */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={t('arcana.search', 'Tìm kiếm arcana...')}
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <IconButton size="small" onClick={() => startTransition(() => setSearchTerm(''))}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null
            }}
          />
          {searchFocused && searchTerm && quickMatches.length > 0 && (
            <Paper elevation={6} sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, zIndex: 20, maxHeight: 320, overflowY: 'auto' }}>
              <List dense disablePadding>
                {quickMatches.map(item => (
                  <ListItemButton
                    key={item._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      startTransition(() => {
                        setSearchTerm(item.name);
                        setSearchFocused(false);
                      });
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {item.image && (
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{ width: 32, height: 32, borderRadius: '4px', objectFit: 'cover' }}
                        />
                      )}
                      <ListItemText
                        primary={<Typography variant="body2" noWrap>{item.name}</Typography>}
                        secondary={item.color ? (
                          <Chip
                            label={String(t(`arcana.colors.${item.color}`, item.color))}
                            size="small"
                            sx={{
                              bgcolor: getColorChipColor(item.color),
                              color: 'white',
                              height: 16,
                              fontSize: '0.65rem',
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                        ) : null}
                      />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Color Filter */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="color-filter-label">
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('arcana.filter', 'Lọc theo màu')}
          </InputLabel>
          <Select
            labelId="color-filter-label"
            value={colorFilter}
            onChange={(e) => startTransition(() => setColorFilter(e.target.value))}
            label={t('arcana.filter', 'Lọc theo màu')}
          >
            {colors.map((color) => (
              <MenuItem key={color.value} value={color.value}>
                {color.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Arcana Grid - Grouped by Color */}
      {filteredArcana.length > 0 ? (
        <>
          {['red', 'blue', 'green'].map((color) => {
            // Only render visible colors for progressive loading
            if (!visibleColors.includes(color)) return null;

            const colorArcana = groupedByColor[color];
            if (!colorArcana || colorArcana.length === 0) return null;

            return (
              <Box key={color} mb={4}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  mb={2}
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

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(4, 1fr)',
                      md: 'repeat(4, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 1
                  }}
                >
                  {colorArcana.map((item: any, idx: number) => (
                    <ArcanaCard
                      key={item._id}
                      item={item}
                      index={idx}
                      t={t}
                    />
                  ))}
                </Box>
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
    </Container>
  );
}
