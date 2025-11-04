"use client";
import { useMemo, useState, useEffect, useTransition, useCallback, memo, lazy, Suspense } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, InputAdornment, Paper, List, ListItemButton, ListItemText,
  Skeleton
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShieldIcon from '@mui/icons-material/Shield';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { GiBroadsword } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import axios from 'axios';

// Memoized EquipmentCard component to prevent unnecessary re-renders
const EquipmentCard = memo(({ 
  item, 
  category, 
  index,
  formatPrice, 
  renderQuickStats,
  t 
}: any) => {
  // Lazy load images not in viewport
  const shouldPrioritize = index < 6;
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${category.color}20`,
        borderRadius: 3,
        contentVisibility: 'auto',
        containIntrinsicSize: '0 350px',
        contain: 'layout style paint', // CSS containment for performance
        willChange: 'contents'
      }}
    >
      {item.image && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 1,
            minHeight: { xs: '96px', md: '126px' } // Fixed min height to prevent reflow
          }}
        >
          <Box 
            sx={{ 
              position: 'relative', 
              width: { xs: '80px', md: '110px' }, 
              height: { xs: '80px', md: '110px' },
              flexShrink: 0
            }}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 600px) 80px, 110px"
              priority={shouldPrioritize}
              loading={shouldPrioritize ? 'eager' : 'lazy'}
            />
          </Box>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
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

        <Box display="flex" alignItems="center" mb={2}>
          <AttachMoneyIcon sx={{ fontSize: '1rem', color: '#C9A063', mr: 0.5 }} />
          <Typography variant="body2" color="#C9A063" fontWeight={700}>
            {formatPrice(item.price)} {t('equipment.gold', 'Gold')}
          </Typography>
        </Box>

        {renderQuickStats(item)}

        {item.passive?.description && (
          <Box mb={1}>
            {item.passive.name && (
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: category.color, mb: 0.5 }}>
                {item.passive.name}
              </Typography>
            )}
            <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
              <span dangerouslySetInnerHTML={{ __html: item.passive.description }} />
            </Typography>
          </Box>
        )}

        {item.active?.description && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#ff6b35', mb: 0.5 }}>
              {t('equipment.active', 'Active')}{item.active.name ? `: ${item.active.name}` : ''}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
              <span dangerouslySetInnerHTML={{ __html: item.active.description }} />
            </Typography>
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
                {t('equipment.cooldown', 'Cooldown')}: {item.active.cooldown}s
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

EquipmentCard.displayName = 'EquipmentCard';

// Memoized CategorySummaryCard for performance
const CategorySummaryCard = memo(({ 
  category, 
  count, 
  getCategoryIconName,
  onClick 
}: any) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
        py: { xs: 1, md: 1.5 },
        px: { xs: 1, md: 2 },
        background: 'rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        willChange: 'transform',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ mb: { xs: 0.25, md: 0.5 }, display: 'flex', justifyContent: 'center', height: { xs: 28, md: 40 } }}>
        <Box
          component="img"
          src={`/Img/lanes/${getCategoryIconName(category.value)}.png`}
          alt={category.label}
          sx={{
            width: { xs: 28, md: 40 },
            height: { xs: 28, md: 40 },
            filter: 'brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(372%) hue-rotate(21deg) brightness(92%) contrast(86%)'
          }}
        />
      </Box>
      <Typography variant="h6" fontWeight={600} sx={{ color: '#C9A063', fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
        {count}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
        {category.label}
      </Typography>
    </Card>
  );
});

CategorySummaryCard.displayName = 'CategorySummaryCard';

// Create stat visual map outside component to avoid recreation
const createStatVisualMap = () => {
  const map = new Map<string, any>();
  // Type-based lookups
  map.set('healthper5s', { type: 'healthPer5s', Icon: FavoriteIcon, color: '#43a047', reactIcon: false, overlayPlus: true });
  map.set('health/5s', { type: 'healthPer5s', Icon: FavoriteIcon, color: '#43a047', reactIcon: false, overlayPlus: true });
  map.set('hp/5s', { type: 'healthPer5s', Icon: FavoriteIcon, color: '#43a047', reactIcon: false, overlayPlus: true });
  map.set('maxhealth', { type: 'maxHealth', Icon: FavoriteIcon, color: '#43a047', reactIcon: false });
  map.set('movementspeed', { type: 'movementSpeed', Icon: DirectionsRunIcon, color: '#43a047', reactIcon: false });
  map.set('attackspeed', { type: 'attackSpeed', Icon: GiBroadsword, color: '#43a047', reactIcon: true });
  map.set('cooldownreduction', { type: 'cooldownReduction', Icon: AccessTimeIcon, color: '#43a047', reactIcon: false });
  map.set('physicallifesteal', { type: 'physicalLifeSteal', Icon: LocalFireDepartmentIcon, color: '#ff7a00', reactIcon: false });
  map.set('lifesteal', { type: 'physicalLifeSteal', Icon: LocalFireDepartmentIcon, color: '#ff7a00', reactIcon: false });
  map.set('magicarmor', { type: 'magicArmor', Icon: ShieldIcon, color: '#7b2ff2', reactIcon: false });
  map.set('magicresist', { type: 'magicArmor', Icon: ShieldIcon, color: '#7b2ff2', reactIcon: false });
  map.set('physicalarmor', { type: 'physicalArmor', Icon: ShieldIcon, color: '#ff7a00', reactIcon: false });
  map.set('armor', { type: 'physicalArmor', Icon: ShieldIcon, color: '#ff7a00', reactIcon: false });
  map.set('magicattack', { type: 'magicAttack', Icon: GiBroadsword, color: '#7b2ff2', reactIcon: true });
  map.set('physicalattack', { type: 'physicalAttack', Icon: GiBroadsword, color: '#ff7a00', reactIcon: true });
  map.set('attack', { type: 'physicalAttack', Icon: GiBroadsword, color: '#ff7a00', reactIcon: true });
  map.set('criticalrate', { type: 'criticalRate', Icon: GpsFixedIcon, color: '#C9A063', reactIcon: false });
  map.set('crit', { type: 'criticalRate', Icon: GpsFixedIcon, color: '#C9A063', reactIcon: false });
  map.set('manaregen', { type: 'manaRegen', Icon: LocalFireDepartmentIcon, color: '#7b2ff2', reactIcon: false });
  map.set('mana', { type: 'manaRegen', Icon: LocalFireDepartmentIcon, color: '#7b2ff2', reactIcon: false });
  return map;
};

// Create once, reuse everywhere
const STAT_VISUAL_MAP = createStatVisualMap();

const EquipmentPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(12); // Initial batch size

  const categories = useMemo(() => [
    { value: 'all', label: t('equipment.categories.all', 'All'), color: '#666' },
    { value: 'Physical', label: t('equipment.categories.physical', 'Physical'), color: '#d32f2f' },
    { value: 'Magic', label: t('equipment.categories.magic', 'Magic'), color: '#7b2ff2' },
    { value: 'Defense', label: t('equipment.categories.defense', 'Defense'), color: '#43a047' },
    { value: 'Movement', label: t('equipment.categories.movement', 'Movement'), color: '#ff9800' },
    { value: 'Roaming', label: t('equipment.categories.roaming', 'Roaming'), color: '#ff9800' },
    { value: 'Jungle', label: t('equipment.categories.jungle', 'Jungle'), color: '#795548' }
  ], [t]);

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      requestIdleCallback(() => {
        setDebouncedSearchTerm(searchTerm);
        setBatchSize(12); // Reset batch size on search change
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset batch size when category changes
  useEffect(() => {
    setBatchSize(12);
  }, [categoryFilter]);

  // Progressive category loading - optimized
  useEffect(() => {
    // If filtering or searching, show all immediately
    if (categoryFilter !== 'all' || debouncedSearchTerm) {
      setVisibleCategories(['Physical', 'Magic', 'Defense', 'Movement', 'Roaming', 'Jungle']);
      return;
    }

    // Progressive loading - show first 2 immediately
    setVisibleCategories(['Physical', 'Magic']);
    
    // Load rest when browser is idle
    const timer = requestIdleCallback(() => {
      setVisibleCategories(['Physical', 'Magic', 'Defense', 'Movement', 'Roaming', 'Jungle']);
    }, { timeout: 200 });

    return () => {
      if (typeof timer === 'number') cancelIdleCallback(timer);
    };
  }, [equipment.length, categoryFilter, debouncedSearchTerm]);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    
    const fetchEquipment = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const res = await axios.get(`${API_URL}/api/equipment`, {
          signal: abortController.signal,
          timeout: 5000 // Add timeout
        });
        
        if (!mounted || abortController.signal.aborted) return;
        
        const data = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        
        // Use requestIdleCallback to defer state update
        requestIdleCallback(() => {
          if (!mounted || abortController.signal.aborted) return;
          setEquipment(Array.isArray(data) ? data : []);
          setLoading(false);
        }, { timeout: 100 });
      } catch (err: any) {
        if (!mounted || abortController.signal.aborted) return;
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        console.error('Failed to fetch equipment:', err);
        requestIdleCallback(() => {
          if (!mounted) return;
          setEquipment([]);
          setLoading(false);
        });
      }
    };
    
    setLoading(true);
    fetchEquipment();
    
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  const normalizeQuickStatLabel = useCallback((raw: string) => {
    if (!raw) return '';
    let s = String(raw).trim();
    s = s.replace(/^passive\s*:\s*/i, '').replace(/^active\s*:\s*/i, '');
    const parts = s.split(/[-–:]/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) s = parts[parts.length - 1];
    return s.replace(/\s+/g, ' ').trim();
  }, []);

  // Use the pre-created map instead of useMemo
  const getQuickStatVisual = useCallback((rawLabel: string, rawType: string) => {
    const tNorm = String(rawType || '').trim().toLowerCase().replace(/\s+/g, '');
    
    // Try direct type lookup first
    const directMatch = STAT_VISUAL_MAP.get(tNorm);
    if (directMatch) return directMatch;
    
    // Fallback to label matching
    const label = normalizeQuickStatLabel(rawLabel).toLowerCase();
    if (label.includes('health/5s') || label.includes('hp/5s') || label.includes('health regen')) {
      return STAT_VISUAL_MAP.get('healthper5s');
    }
    if (label.includes('max health')) return STAT_VISUAL_MAP.get('maxhealth');
    if (label.includes('movement speed') || label.includes('move speed')) return STAT_VISUAL_MAP.get('movementspeed');
    if (label.includes('attack speed')) return STAT_VISUAL_MAP.get('attackspeed');
    if (label.includes('cooldown')) return STAT_VISUAL_MAP.get('cooldownreduction');
    if (label.includes('life steal') || label.includes('lifesteal')) return STAT_VISUAL_MAP.get('lifesteal');
    if (label.includes('magic armor') || label.includes('magic resist')) return STAT_VISUAL_MAP.get('magicarmor');
    if (label.includes('physical armor') || (label.includes('armor') && !label.includes('magic'))) {
      return STAT_VISUAL_MAP.get('physicalarmor');
    }
    if (label.includes('magic attack')) return STAT_VISUAL_MAP.get('magicattack');
    if (label.includes('physical attack') || (label.includes('attack') && !label.includes('magic'))) {
      return STAT_VISUAL_MAP.get('physicalattack');
    }
    if (label.includes('critical rate') || label.includes('crit rate')) return STAT_VISUAL_MAP.get('criticalrate');
    if (label.includes('mana')) return STAT_VISUAL_MAP.get('mana');
    
    return { type: 'unknown', Icon: GiBroadsword, color: '#C9A063', reactIcon: true };
  }, [normalizeQuickStatLabel]);

  const getDisplayLabel = (type: string, rawFallback: string) => {
    switch (type) {
      case 'magicArmor': return t('equipment.stats.magicArmor', 'Magical Defense');
      case 'physicalArmor': return t('equipment.stats.physicalArmor', 'Physical Defense');
      case 'physicalLifeSteal': return t('equipment.stats.physicalLifeSteal', 'Physical Life Steal');
      case 'criticalRate': return t('equipment.stats.criticalRate', 'Critical Rate');
      case 'movementSpeed': return t('equipment.stats.movementSpeed', 'Movement Speed');
      case 'attackSpeed': return t('equipment.stats.attackSpeed', 'Attack Speed');
      case 'cooldownReduction': return t('equipment.stats.cooldownReduction', 'Cooldown Reduction');
      case 'magicAttack': return t('equipment.stats.magicAttack', 'Magic Attack');
      case 'physicalAttack': return t('equipment.stats.physicalAttack', 'Physical Attack');
      case 'manaRegen': return t('equipment.stats.manaRegen', 'Mana Regen');
      case 'maxHealth': return t('equipment.stats.maxHealth', 'Max Health');
      case 'healthPer5s': return t('equipment.stats.healthPer5s', 'Health/5s');
      default: return normalizeQuickStatLabel(rawFallback || '');
    }
  };

  const deriveQuickStats = useCallback((item: any) => {
    if (Array.isArray(item?.quickStats) && item.quickStats.length) {
      return item.quickStats
        .filter((q: any) => q && (q.value || q.description || q.type))
        .slice(0, 5)
        .map((q: any) => ({ label: q.label || q.type || '', value: q.value || '', type: q.type || '' }));
    }
    if (item?.stats && typeof item.stats === 'object') {
      return Object.entries(item.stats)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .slice(0, 5)
        .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    if (item?.attributes && typeof item.attributes === 'object') {
      return Object.entries(item.attributes)
        .filter(([, v]) => typeof v === 'number' && v !== 0)
        .slice(0, 5)
        .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    return [];
  }, []);

  const renderQuickStats = useCallback((item: any) => {
    const stats = deriveQuickStats(item);
    if (!stats.length) return null;

    return (
      <Box sx={{ 
        display: { xs: 'flex', md: 'grid' },
        flexDirection: { xs: 'column', md: 'initial' },
        gridTemplateColumns: { md: 'repeat(2, 1fr)' },
        gap: 0.5, 
        mb: 2,
        minHeight: { xs: '80px', md: '60px' } // Prevent layout shift
      }}>
        {stats.map((s: any, i: number) => {
          const v = getQuickStatVisual(s.label, s.type);
          const IconComp = v.Icon;
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(201,160,99,0.08)',
                border: '1px solid rgba(201,160,99,0.25)',
                minHeight: '24px' // Fixed height to prevent reflow
              }}
            >
              {v.overlayPlus ? (
                <Box sx={{ position: 'relative', width: 16, height: 16, display: 'flex' }}>
                  {v.reactIcon ? (
                    <IconComp style={{ color: v.color, fontSize: 16 }} />
                  ) : (
                    <IconComp sx={{ color: v.color, fontSize: 16 }} />
                  )}
                  <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: 8, height: 8, bgcolor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                    <Box component="span" sx={{ fontSize: 8, lineHeight: 1, color: '#43a047', fontWeight: 700 }}>+</Box>
                  </Box>
                </Box>
              ) : (
                v.reactIcon ? (
                  <IconComp style={{ color: v.color, fontSize: 14 }} />
                ) : (
                  <IconComp sx={{ color: v.color, fontSize: 14 }} />
                )
              )}
              <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                {s.value} {getDisplayLabel(v.type, s.label)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  }, [deriveQuickStats, getQuickStatVisual, getDisplayLabel, t]);

  const formatPrice = useCallback((price: number) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  // Map category value to icon filename
  const getCategoryIconName = useCallback((categoryValue: string) => {
    const iconMap: Record<string, string> = {
      'Physical': 'Farm_Lane',
      'Magic': 'Mid_Lane', 
      'Defense': 'Abyssal_Lane',
      'Movement': 'movement',
      'Roaming': 'Roam',
      'Jungle': 'Jungle'
    };
    return iconMap[categoryValue] || 'Roam';
  }, []);

  // Optimized filtering with debouncing for search
  const filteredEquipment = useMemo(() => {
    let list = equipment;
    
    // Filter by category first (fastest)
    if (categoryFilter !== 'all') {
      list = list.filter(item => item.category === categoryFilter);
    }
    
    // Then search if needed (using debounced term)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      list = list.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }
    
    // Sort in-place (avoid spread operator)
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'price') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    
    return list;
  }, [equipment, categoryFilter, debouncedSearchTerm, sortBy]);

  // Simplified quick search - just check starts with, then includes
  const quickMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    
    const startsWith: any[] = [];
    const includes: any[] = [];
    
    for (const item of equipment) {
      const name = (item.name || '').toLowerCase();
      if (name.startsWith(term)) {
        startsWith.push(item);
        if (startsWith.length >= 8) break;
      } else if (name.includes(term) && includes.length < 8) {
        includes.push(item);
      }
    }
    
    return [...startsWith, ...includes].slice(0, 8);
  }, [equipment, searchTerm]);

  // Group equipment by category for summary - memoized
  const groupedEquipment = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        grouped[cat.value] = filteredEquipment.filter(item => item.category === cat.value);
      }
    });
    return grouped;
  }, [filteredEquipment, categories]);

  // Limit displayed items for performance
  const displayedEquipment = useMemo(() => {
    if (categoryFilter !== 'all' || debouncedSearchTerm) {
      return filteredEquipment.slice(0, batchSize);
    }
    return filteredEquipment;
  }, [filteredEquipment, batchSize, categoryFilter, debouncedSearchTerm]);

  // Increase batch size when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // Load more when 80% scrolled
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        setBatchSize(prev => Math.min(prev + 12, filteredEquipment.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEquipment.length]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const currentCategory = categories.find(c => c.value === categoryFilter) || categories[0];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, isolation: 'isolate' }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        {t('equipment.title', 'Trang bị')}
      </Typography>

      {/* Category Summary - Show when viewing all and no search */}
      {categoryFilter === 'all' && !debouncedSearchTerm && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(3, 1fr)' },
              gap: { xs: 1, sm: 2 }
            }}
          >
            {categories.slice(1).map((category) => {
              const count = groupedEquipment[category.value]?.length || 0;
              return (
                <CategorySummaryCard
                  key={category.value}
                  category={category}
                  count={count}
                  getCategoryIconName={getCategoryIconName}
                  onClick={() => setCategoryFilter(category.value)}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3 
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <TextField
            size="small"
            placeholder={t('equipment.search', 'Search equipment...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null
            }}
            sx={{ width: '100%' }}
          />
          {searchFocused && searchTerm && quickMatches.length > 0 && (
            <Paper elevation={6} sx={{ position: 'absolute', left: 0, right: 0, mt: 0.5, zIndex: 20, maxHeight: 320, overflowY: 'auto' }}>
              <List dense disablePadding>
                {quickMatches.map(item => (
                  <ListItemButton
                    key={item._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setSearchFocused(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {item.image && (
                        <Box sx={{ position: 'relative', width: 32, height: 32, borderRadius: '4px', overflow: 'hidden' }}>
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="32px" />
                        </Box>
                      )}
                      <ListItemText
                        primary={<Typography variant="body2" noWrap>{item.name}</Typography>}
                        secondary={item.category ? <Typography variant="caption" color="text.secondary" noWrap>{String(t(`equipment.categories.${item.category.toLowerCase()}`, item.category))}</Typography> : null}
                      />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        <FormControl size="small">
          <InputLabel>{t('equipment.category', 'Category')}</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label={t('equipment.category', 'Category')}
          >
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>{t('equipment.sort', 'Sort by')}</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label={t('equipment.sort', 'Sort by')}
          >
            <MenuItem value="name">{t('equipment.sortName', 'Name')}</MenuItem>
            <MenuItem value="price">{t('equipment.sortPrice', 'Price')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <Typography variant="h6" color="text.secondary">
            {t('equipment.noData', 'No equipment found')}
          </Typography>
        </Box>
      ) : categoryFilter === 'all' && !debouncedSearchTerm ? (
        // Display by categories when showing all (with progressive loading)
        <Box>
          {categories.slice(1).map((category) => {
            // Progressive category loading
            if (!visibleCategories.includes(category.value)) return null;

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
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 2,
                    contentVisibility: 'auto',
                    containIntrinsicSize: '0 500px',
                    // Prevent layout thrashing
                    '& > *': {
                      minHeight: { xs: '280px', md: '350px' }
                    }
                  }}
                >
                  {categoryItems.map((item, idx) => (
                    <EquipmentCard
                      key={item._id}
                      item={item}
                      category={category}
                      index={idx}
                      formatPrice={formatPrice}
                      renderQuickStats={renderQuickStats}
                      t={t}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        // Regular grid when filtered
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }, 
            gap: 2,
            // Prevent layout thrashing
            '& > *': {
              minHeight: { xs: '280px', md: '350px' }
            }
          }}
        >
          {displayedEquipment.map((item, idx) => {
            const currentCategory = categories.find(c => c.value === item.category) || categories[0];
            return (
              <EquipmentCard
                key={item._id}
                item={item}
                category={currentCategory}
                index={idx}
                formatPrice={formatPrice}
                renderQuickStats={renderQuickStats}
                t={t}
              />
            );
          })}
        </Box>
      )}
      
      {/* Load more indicator */}
      {(categoryFilter !== 'all' || debouncedSearchTerm) && displayedEquipment.length < filteredEquipment.length && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            {t('equipment.showingCount', 'Showing {{count}} of {{total}}', { 
              count: displayedEquipment.length, 
              total: filteredEquipment.length 
            })}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default EquipmentPage;
