import { useMemo, useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShieldIcon from '@mui/icons-material/Shield';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { GiBroadsword } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import LazyImage from '../components/LazyImage';
import { asDangerousHtml } from '../utils/sanitizeHtml';
import { List, ListItemButton, ListItemText, Paper, InputAdornment } from '@mui/material';

// Import lane icons (from public/img/lanes via absolute paths for movement)
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
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
  const [searchFocused, setSearchFocused] = useState(false);



  // Category options - add Roaming; Movement uses shoe icon
  const categories = [
    {
      value: 'all',
      label: t('equipment.categories.all', 'Tất cả'),
      icon: roamIcon,
      color: '#666'
    },
    {
      value: 'Physical',
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
  icon: '/Img/lanes/movement.png',
      color: '#ff9800'
    },
    {
      value: 'Roaming',
      label: t('equipment.categories.roaming', 'Roaming'),
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

  // Helpers to normalize stat labels
  const normalizeQuickStatLabel = (raw) => {
    if (!raw) return '';
    let s = String(raw).trim();
    // strip headings
    s = s.replace(/^passive\s*:\s*/i, '').replace(/^active\s*:\s*/i, '');
    // take last segment after common separators
    const parts = s.split(/[-–:]/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) s = parts[parts.length - 1];
    // convert snake_case and kebab-case to spaces
    s = s.replace(/[_.-]+/g, ' ');
    // insert spaces between camelCase boundaries: criticalRate -> critical Rate
    s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
    // collapse whitespace
    return s.replace(/\s+/g, ' ').trim();
  };

  // Map a stat label/type to an icon and color (prefer explicit type)
  const getQuickStatVisual = (rawLabel, rawType) => {
    const label = normalizeQuickStatLabel(rawLabel).toLowerCase();
    const tNorm = String(rawType || '').trim().toLowerCase().replace(/\s+/g, '');
    const has = (s) => label.includes(s);

    // Prefer explicit type mapping
    switch (tNorm) {
      case 'healthper5s':
      case 'health/5s':
      case 'hp/5s':
      case 'hp5':
        return { type: 'healthPer5s', Icon: FavoriteIcon, color: '#43a047', reactIcon: false, overlayPlus: true };
      case 'maxhealth':
        return { type: 'maxHealth', Icon: FavoriteIcon, color: '#43a047', reactIcon: false };
      case 'movementspeed':
        return { type: 'movementSpeed', Icon: DirectionsRunIcon, color: '#43a047', reactIcon: false };
      case 'attackspeed':
        return { type: 'attackSpeed', Icon: GiBroadsword, color: '#43a047', reactIcon: true };
      case 'cooldownreduction':
        return { type: 'cooldownReduction', Icon: AccessTimeIcon, color: '#43a047', reactIcon: false };
      case 'physicallifesteal':
      case 'lifesteal':
        return { type: 'physicalLifeSteal', Icon: LocalFireDepartmentIcon, color: '#ff7a00', reactIcon: false };
      case 'magicarmor':
      case 'magicresist':
        return { type: 'magicArmor', Icon: ShieldIcon, color: '#7b2ff2', reactIcon: false };
      case 'physicalarmor':
      case 'armor':
        return { type: 'physicalArmor', Icon: ShieldIcon, color: '#ff7a00', reactIcon: false };
      case 'magicattack':
        return { type: 'magicAttack', Icon: GiBroadsword, color: '#7b2ff2', reactIcon: true };
      case 'physicalattack':
      case 'attack':
        return { type: 'physicalAttack', Icon: GiBroadsword, color: '#ff7a00', reactIcon: true };
      case 'criticalrate':
      case 'crit':
        return { type: 'criticalRate', Icon: GpsFixedIcon, color: '#C9A063', reactIcon: false };
      case 'manaregen':
      case 'mana':
        return { type: 'manaRegen', Icon: LocalFireDepartmentIcon, color: '#7b2ff2', reactIcon: false };
      default:
        break;
    }
    // Health/5s (regen) – green with tiny plus overlay
    if (
      has('health/5s') || has('hp/5s') || has('health per 5') || has('health regen') || has('health regeneration') ||
      has('hồi máu/5s') || has('hoi mau/5s') || has('hoi mau') || has('regeneration') || has('regen') || has('hp5')
    ) {
      return { type: 'healthPer5s', Icon: FavoriteIcon, color: '#43a047', reactIcon: false, overlayPlus: true };
    }
    // Max Health (new) – green, same icon style as mana regen
    if (has('max health') || label === 'maxhealth') {
      return { type: 'maxHealth', Icon: FavoriteIcon, color: '#43a047', reactIcon: false };
    }
    // Movement Speed
    if (has('movement speed') || label === 'movementspeed' || has('tốc chạy')) {
      return { type: 'movementSpeed', Icon: DirectionsRunIcon, color: '#43a047', reactIcon: false };
    }
    // Attack Speed
    if (has('attack speed') || label === 'attackspeed' || has('tốc đánh')) {
      return { type: 'attackSpeed', Icon: GiBroadsword, color: '#43a047', reactIcon: true };
    }
    // Cooldown Reduction
    if (has('cooldown') || has('giảm hồi chiêu')) {
      return { type: 'cooldownReduction', Icon: AccessTimeIcon, color: '#43a047', reactIcon: false };
    }
    // Life Steal (generic) -> Treat as Physical Life Steal
    if ((has('life steal') || has('lifesteal') || has('hút máu')) && !has('vật lý')) {
      return { type: 'physicalLifeSteal', Icon: LocalFireDepartmentIcon, color: '#ff7a00', reactIcon: false };
    }
    // Physical Life Steal (new): Hút máu vật lý
    if (has('hút máu vật lý') || (has('life') && has('steal') && has('physical'))) {
      return { type: 'physicalLifeSteal', Icon: LocalFireDepartmentIcon, color: '#ff7a00', reactIcon: false };
    }
  // Magical Defense (formerly Magic Armor / Resist)
  if (has('magical defense') || has('magic armor') || has('magic resist') || has('kháng phép')) {
      return { type: 'magicArmor', Icon: ShieldIcon, color: '#7b2ff2', reactIcon: false };
    }
  // Physical Defense (formerly Physical Armor / Armor)
  if (has('physical defense') || has('physical armor') || (has('armor') && !has('magic')) || has('giáp vật lý')) {
      return { type: 'physicalArmor', Icon: ShieldIcon, color: '#ff7a00', reactIcon: false };
    }
    // Magic Attack
    if ((has('magic attack') || (has('phép') && !has('kháng'))) && !has('resist')) {
      return { type: 'magicAttack', Icon: GiBroadsword, color: '#7b2ff2', reactIcon: true };
    }
    // Physical Attack / Attack
    if (has('physical attack') || (has('attack') && !has('magic')) || has('vật lý')) {
      return { type: 'physicalAttack', Icon: GiBroadsword, color: '#ff7a00', reactIcon: true };
    }
    // Critical Rate
    if (
      has('critical rate') || has('critical chance') || has('crit chance') || has('crit rate') ||
      has('crit') || has('tỉ lệ chí mạng') || has('ti le chi mang')
    ) {
      return { type: 'criticalRate', Icon: GpsFixedIcon, color: '#C9A063', reactIcon: false };
    }
    // Mana Regen
    if (has('mana') || has('hồi mana')) {
      return { type: 'manaRegen', Icon: LocalFireDepartmentIcon, color: '#7b2ff2', reactIcon: false };
    }
    // Default
    return { type: 'unknown', Icon: GiBroadsword, color: '#C9A063', reactIcon: true };
  };

  // Translate label by detected type; fallback to normalized raw label
  const getDisplayLabel = (type, rawFallback) => {
    switch (type) {
      case 'magicArmor':
        return t('equipment.stats.magicArmor', { lng: 'en', defaultValue: 'Magical Defense' });
      case 'physicalArmor':
        return t('equipment.stats.physicalArmor', { lng: 'en', defaultValue: 'Physical Defense' });
      case 'lifeSteal':
        return t('equipment.stats.lifeSteal', { lng: 'en', defaultValue: 'Physical Life Steal' });
      case 'physicalLifeSteal':
        return t('equipment.stats.physicalLifeSteal', { lng: 'en', defaultValue: 'Physical Life Steal' });
      case 'criticalRate':
        return t('equipment.stats.criticalRate', { lng: 'en', defaultValue: 'Critical Rate' });
      case 'movementSpeed':
        return t('equipment.stats.movementSpeed', { lng: 'en', defaultValue: 'Movement Speed' });
      case 'attackSpeed':
        return t('equipment.stats.attackSpeed', { lng: 'en', defaultValue: 'Attack Speed' });
      case 'cooldownReduction':
        return t('equipment.stats.cooldownReduction', { lng: 'en', defaultValue: 'Cooldown Reduction' });
      case 'magicAttack':
        return t('equipment.stats.magicAttack', { lng: 'en', defaultValue: 'Magic Attack' });
      case 'physicalAttack':
        return t('equipment.stats.physicalAttack', { lng: 'en', defaultValue: 'Physical Attack' });
      case 'manaRegen':
        return t('equipment.stats.manaRegen', { lng: 'en', defaultValue: 'Mana Regen' });
      case 'maxHealth':
        return t('equipment.stats.maxHealth', { lng: 'en', defaultValue: 'Max Health' });
      case 'healthPer5s':
        return t('equipment.stats.healthPer5s', { lng: 'en', defaultValue: 'Health/5s' });
      default:
        return normalizeQuickStatLabel(rawFallback || '');
    }
  };

  // Derive quick stats from available fields (quickStats | stats | attributes | parsed text)
  const deriveQuickStats = (item) => {
    // Preferred: quickStats array from backend
    if (Array.isArray(item?.quickStats) && item.quickStats.length) {
      return item.quickStats
        .filter(q => q && (q.value || q.description || q.type))
        .slice(0, 5)
        .map(q => ({ label: normalizeQuickStatLabel(q.label || q.type || ''), value: q.value || '', desc: q.description || '', type: q.type || '' }));
    }
    // Next: stats object
    if (item?.stats && typeof item.stats === 'object') {
      return Object.entries(item.stats)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .slice(0, 5)
        .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    // Fallback: attributes object from model (only non-zero)
    if (item?.attributes && typeof item.attributes === 'object') {
      return Object.entries(item.attributes)
        .filter(([, v]) => typeof v === 'number' && v !== 0)
        .slice(0, 5)
        .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    // Last resort: parse from description/passive/active text
    const text = [item?.description, item?.passive?.description, item?.active?.description]
      .filter(Boolean)
      .join('\n');
    const parsed = parseQuickStatsFromText(text);
    return parsed.slice(0, 5);
  };

  // Parse simple "+50 Attack" or "Movement Speed +60" style lines from text
  const stripHtmlToText = (html) => {
    if (!html) return '';
    const el = document.createElement('div');
    el.innerHTML = html
      .replace(/<br\s*\/?>(?=[^\n])/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n');
    return (el.textContent || '').replace(/\u00A0/g, ' ');
  };

  const parseQuickStatsFromText = (htmlOrText) => {
    if (!htmlOrText) return [];
    const text = stripHtmlToText(htmlOrText);
    const lines = text
      .split(/\n|[.;•]/)
      .map(s => s.trim())
      .filter(Boolean)
      // drop passive/active heading lines
      .filter(s => !/^passive\s*:/i.test(s) && !/^active\s*:/i.test(s));
    const out = [];
    for (const line of lines) {
      // value first: +15% Movement Speed OR 50 Attack Speed
      let m = line.match(/^([+\-–]?\d+(?:\.\d+)?%?)\s+(.{2,40})$/u);
      if (m) {
        const value = m[1];
        const label = m[2].trim();
        if (label && value) out.push({ label, value });
        continue;
      }
      // label first: Movement Speed +60 OR Attack +50%
      m = line.match(/^(.{2,40}?)\s+([+\-–]?\d+(?:\.\d+)?%?)$/u);
      if (m) {
        const label = m[1].trim();
        const value = m[2];
        if (label && value) out.push({ label, value });
      }
      if (out.length >= 5) break;
    }
    return out;
  };

  // Helpers to decide if passive/active have meaningful content
  const hasPassive = (p) => {
    if (!p) return false;
    const name = (p.name || '').trim();
    const descText = stripHtmlToText(p.description || '').trim();
    return !!(name || descText);
  };

  const hasActive = (a) => {
    if (!a) return false;
    const name = (a.name || '').trim();
    const descText = stripHtmlToText(a.description || '').trim();
    const cd = typeof a.cooldown === 'number' && a.cooldown > 0;
    return !!(name || descText || cd);
  };

  const renderQuickStats = (item) => {
    const qs = deriveQuickStats(item);
    if (!qs.length) return null;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, mt: -0.5 }}>
  {qs.map((s, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: 'rgba(201,160,99,0.08)',
              border: '1px solid rgba(201,160,99,0.25)',
              color: 'text.primary',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}
            title={s.desc || ''}
          >
            {(() => {
              const v = getQuickStatVisual(s.label, s.type);
              const IconComp = v.Icon;
              if (v.overlayPlus) {
                return (
                  <Box sx={{ position: 'relative', width: 16, height: 16, display: 'inline-flex' }}>
                    {v.reactIcon ? (
                      <IconComp style={{ color: v.color, fontSize: 16 }} />
                    ) : (
                      <IconComp sx={{ color: v.color, fontSize: 16 }} />
                    )}
                    <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: 8, height: 8, bgcolor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                      <Box component="span" sx={{ fontSize: 8, lineHeight: 1, color: '#43a047', fontWeight: 700 }}>+</Box>
                    </Box>
                  </Box>
                );
              }
              return v.reactIcon ? (
                <IconComp style={{ color: v.color, fontSize: 14 }} />
              ) : (
                <IconComp sx={{ color: v.color, fontSize: 14 }} />
              );
            })()}
            {(() => {
              const v = getQuickStatVisual(s.label, s.type);
              return `${s.value} ${getDisplayLabel(v.type, s.label)}`;
            })()}
          </Typography>
        ))}
      </Box>
    );
  };

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

  // Quick search suggestions (top 8)
  const quickMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    const scored = (Array.isArray(equipment) ? equipment : [])
      .map(it => {
        const name = (it.name || '').toLowerCase();
        const desc = (it.description || '').toLowerCase();
        const idxName = name.indexOf(term);
        const idxDesc = desc.indexOf(term);
        let score = -1;
        if (idxName !== -1) score = Math.max(score, (idxName === 0 ? 100 : 50) - idxName);
        if (idxDesc !== -1) score = Math.max(score, 10 - idxDesc);
        return { it, score };
      })
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.it);
    return scored;
  }, [equipment, searchTerm]);

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
      <Grid item xs={4} sm={4} md={4} key={category.value}>
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
                        {typeof category.icon === 'string' ? (
                          <img
                            src={category.icon}
                            alt={category.label}
                            style={{
                              width: 48,
                              height: 48,
                              filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
                            }}
                          />
                        ) : (
                          (() => {
                            const IconComp = category.icon;
                            return <IconComp style={{ color: category.color, fontSize: 48 }} />;
                          })()
                        )}
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
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('equipment.search', 'Tìm kiếm trang bị...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickMatches.length > 0) {
                    const first = quickMatches[0];
                    // Navigate to equipment details if exists; otherwise just scroll to card
                    const anchorId = `equipment-${first._id}`;
                    const el = document.getElementById(anchorId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    setSearchFocused(false);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    searchTerm ? (
                      <IconButton size="small" aria-label={t('common.clear', 'Clear')} onClick={() => setSearchTerm('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  )
                }}
              />
              {searchFocused && searchTerm && quickMatches.length > 0 && (
                <Paper elevation={6} sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, zIndex: 20, maxHeight: 320, overflowY: 'auto' }}>
                  <List dense disablePadding>
                    {quickMatches.map(it => (
                      <ListItemButton
                        key={it._id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const anchorId = `equipment-${it._id}`;
                          const el = document.getElementById(anchorId);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                          setSearchFocused(false);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          {it.image ? (
                            <LazyImage src={it.image} alt={it.name} width={{ xs: '28px' }} height={{ xs: '28px' }} sx={{ borderRadius: '4px', objectFit: 'cover' }} />
                          ) : null}
                          <ListItemText
                            primary={<Typography variant="body2" noWrap>{it.name}</Typography>}
                            secondary={
                              it.category ? (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {t(`equipment.categories.${String(it.category).toLowerCase()}`, it.category)}
                                </Typography>
                              ) : null
                            }
                          />
                        </Box>
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
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
                    {typeof category.icon === 'string' ? (
                      <img
                        src={category.icon}
                        alt={category.label}
                        style={{
                          width: 20,
                          height: 20,
                          filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
                        }}
                      />
                    ) : (
                      (() => {
                        const IconComp = category.icon;
                        return <IconComp style={{ color: category.color, fontSize: 20 }} />;
                      })()
                    )}
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
                            id={`equipment-${item._id}`}
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

                              {/* Quick Stats under price */}
                              {renderQuickStats(item)}

                              {/* Passive Effect */}
                              {hasPassive(item.passive) && (
                                <Box mb={2}>
                                  {item.passive.name && (
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      mb={1}
                                      sx={{ color: category.color }}
                                    >
                                      {item.passive.name}
                                    </Typography>
                                  )}
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.75rem',
                                      lineHeight: 1.4,
                                      color: 'inherit',
                                      display: 'block'
                                    }}
                                  >
                                    <span dangerouslySetInnerHTML={asDangerousHtml(item.passive.description)} />
                                  </Typography>
                                </Box>
                              )}

                              {/* Active Effect */}
                              {hasActive(item.active) && (
                                <Box mb={2}>
                                  {(item.active.name || stripHtmlToText(item.active.description || '')) && (
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      mb={1}
                                      sx={{ color: '#ff4500' }}
                                    >
                                      {t('equipment.active', 'Kích hoạt')}{item.active.name ? `: ${item.active.name}` : ''}
                                    </Typography>
                                  )}
                                      {stripHtmlToText(item.active.description || '').trim() && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: '0.75rem',
                                            lineHeight: 1.4,
                                            color: 'inherit',
                                            display: 'block'
                                          }}
                                        >
                                          <span dangerouslySetInnerHTML={asDangerousHtml(item.active.description)} />
                                        </Typography>
                                      )}
                                      {Number(item.active?.cooldown) > 0 && (
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
                              {/* Bottom small description removed as requested */}
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
                      id={`equipment-${item._id}`}
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
                              // Remove inner border to avoid double border when filtered
                              border: 'none',
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

                        {/* Quick Stats under price (filtered grid) */}
                        {renderQuickStats(item)}

                        {/* Passive Effect */}
                        {hasPassive(item.passive) && (
                          <Box mb={2}>
                            {item.passive.name && (
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={1}
                                sx={{ color: category.color }}
                              >
                                {item.passive.name}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                                color: 'inherit',
                                display: 'block'
                              }}
                            >
                              <span dangerouslySetInnerHTML={asDangerousHtml(item.passive.description)} />
                            </Typography>
                          </Box>
                        )}

                        {/* Active Effect */}
                        {hasActive(item.active) && (
                          <Box mb={2}>
                            {(item.active.name || stripHtmlToText(item.active.description || '')) && (
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={1}
                                sx={{ color: '#ff6b35' }}
                              >
                                {t('equipment.active', 'Kích hoạt')}{item.active.name ? `: ${item.active.name}` : ''}
                              </Typography>
                            )}
                            {stripHtmlToText(item.active.description || '').trim() && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4,
                                  color: 'inherit',
                                  display: 'block'
                                }}
                              >
                                <span dangerouslySetInnerHTML={asDangerousHtml(item.active.description)} />
                              </Typography>
                            )}
                            {Number(item.active?.cooldown) > 0 && (
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

                        {/* Bottom description removed for filtered view to avoid showing parsed passive/active lines */}
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
