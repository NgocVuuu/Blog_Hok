"use client";
import React, { useState, useEffect, useMemo, useTransition, memo } from 'react';
import { 
  Container, Typography, Box,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, FormControl, InputLabel, Select, MenuItem, Pagination,
  CircularProgress, Chip, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Memoized Mobile Post Card
const MobilePostCard = memo(function MobilePostCard({ 
  post, 
  onClick, 
  pressedId, 
  setPressedId,
  formatDate,
  t 
}: any) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      onPointerDown={() => setPressedId(post._id)}
      onPointerUp={() => setPressedId(null)}
      onPointerCancel={() => setPressedId(null)}
      onPointerLeave={() => setPressedId(null)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        cursor: 'pointer',
        transition: 'transform 180ms, box-shadow 180ms, background-color 120ms',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        contentVisibility: 'auto',
        containIntrinsicSize: '0 80px',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          bgcolor: 'action.hover'
        },
        '&:active': { transform: 'translateY(-2px)', boxShadow: 3 },
        ...(pressedId === post._id ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          bgcolor: 'action.selected'
        } : {})
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
        {post.image ? (
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 1, 
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box 
              component="img" 
              src={post.image} 
              alt={post.title} 
              loading="lazy" 
              sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                position: 'absolute',
                top: '11px',
                left: 0,
                transform: { xs: 'scale(1.9)' }
              }} 
            />
          </Box>
        ) : (
          <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'grey.200', flexShrink: 0 }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={500} color="text.primary" sx={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {post.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            <Box component="span" sx={{ color: '#C9A063', mr: 0.5 }}>{post.author || 'BlogHok'}</Box>
            <Box component="span">• {formatDate(post.createdAt)}</Box>
          </Typography>
        </Box>
      </Box>
      {post.category && (
        <Chip 
          label={String(t(`news.categories.${post.category}`, post.category))} 
          size="small" 
          sx={{ 
            bgcolor: '#C9A063', 
            color: 'white', 
            fontWeight: 500,
            fontSize: '0.7rem',
            flexShrink: 0,
            ml: 1
          }} 
        />
      )}
    </Box>
  );
});

// Memoized Desktop Post Row
const DesktopPostRow = memo(function DesktopPostRow({ post, onClick, formatDate, t }: any) {
  return (
    <TableRow 
      hover 
      sx={{ cursor: 'pointer', contentVisibility: 'auto', containIntrinsicSize: '0 60px' }} 
      onClick={onClick}
    >
      <TableCell sx={{ p: 1 }}>
          {post.image && (
            <Box component="img" src={post.image} alt={post.title} loading="lazy" sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }} />
          )}
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" fontWeight={500}>{post.title}</Typography>
      </TableCell>
      <TableCell align="center">
        {post.category && (
          <Chip 
            label={String(t(`news.categories.${post.category}`, post.category))} 
            size="small" 
            sx={{ bgcolor: '#C9A063', color: 'white', fontWeight: 500 }} 
          />
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="#C9A063" noWrap>{post.author || 'BlogHok'}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary" noWrap>{formatDate(post.createdAt)}</Typography>
      </TableCell>
    </TableRow>
  );
});

export default function NewsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isMobile, setIsMobile] = useState(false);

  const postsPerPage = 10;

  // Categories for filter dropdown
  const categories = [
    { value: 'all', label: t('news.categories.all', 'Tất cả') },
    { value: 'guides', label: t('news.categories.guides', 'Hướng dẫn') },
    { value: 'updates', label: t('news.categories.updates', 'Cập nhật') },
    { value: 'events', label: t('news.categories.events', 'Sự kiện') },
    { value: 'esports', label: t('news.categories.esports', 'Thể thao điện tử') }
  ];

  // CSS media query for responsive (client-side only)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Deferred fetch with startTransition
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    
    const fetchPosts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
        const res = await axios.get(`${API_URL}/api/news`, {
          signal: abortController.signal
        });
        
        if (!mounted) return;
        
        const postsData = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        
        startTransition(() => {
          setPosts(postsData);
          setLoading(false);
        });
      } catch (err: any) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return;
        }
        if (mounted) {
          startTransition(() => {
            setPosts([]);
            setLoading(false);
          });
        }
      }
    };

    // Defer fetch to avoid blocking initial render
    setTimeout(() => {
      setLoading(true);
      fetchPosts();
    }, 0);
    
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Debounce search (optimized)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 150);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Optimized filtering with useMemo
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }

    // Search term
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        post => 
          post.title?.toLowerCase().includes(term) || 
          post.summary?.toLowerCase().includes(term) ||
          post.content?.toLowerCase().includes(term)
      );
    }

    // Sort in-place
    if (sortBy === 'latest') {
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'title') {
      return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [posts, debouncedSearch, sortBy, categoryFilter]);

  // Auto reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filteredPosts.length]);

  // Quick suggestions (optimized)
  const quickMatches = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term || term.length < 2) return [];
    
    const matches = posts.filter(p =>
      p.title?.toLowerCase().includes(term) ||
      p.summary?.toLowerCase().includes(term)
    );
    
    return matches
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [searchTerm, posts]);

  // Pagination
  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const pageCount = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (event: unknown, value: number) => {
    startTransition(() => {
      setPage(value);
    });
    window.scrollTo({ top: 0 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 } }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        {t('news.latestNews', 'Tin Tức Mới Nhất')}
      </Typography>
      
      {/* Search and Filter Controls */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, 
        gap: { xs: 1.5, md: 2 }, 
        mb: 3, 
        mt: 2 
      }}>
        {/* Search Field */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={t('news.search', 'Tìm kiếm bài viết...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredPosts.length > 0) {
                const first = filteredPosts[0];
                router.push(`/news/${first.slug || first._id}`);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton aria-label={t('common.clear','Xóa')} size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              )
            }}
          />

          {searchTerm && quickMatches.length > 0 && (
            <Box sx={{ 
              position:'absolute', 
              left:0, 
              right:0, 
              zIndex:5, 
              mt:0.5, 
              bgcolor:'background.paper', 
              border:'1px solid', 
              borderColor:'divider', 
              borderRadius:1, 
              boxShadow:3, 
              maxHeight: 300, 
              overflowY:'auto' 
            }}>
              {quickMatches.map(p => (
                <Box
                  key={p._id}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    router.push(`/news/${p.slug || p._id}`); 
                  }}
                  sx={{ 
                    display:'flex', 
                    alignItems:'center', 
                    gap:1, 
                    p:1, 
                    cursor:'pointer', 
                    '&:hover':{ bgcolor:'action.hover' } 
                  }}
                >
                  {p.thumbnail || p.image ? (
                    <Box component="img" src={p.thumbnail || p.image} alt={p.title} sx={{ width:36, height:36, objectFit:'cover', borderRadius:1, border:'1px solid', borderColor:'divider' }} />
                  ) : (
                    <Box sx={{ width:36, height:36, bgcolor:'grey.200', borderRadius:1 }} />
                  )}
                  <Typography variant="body2" noWrap sx={{ flex:1 }}>{p.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Category Filter */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="category-filter-label">{t('news.filter', 'Phân loại')}</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            onChange={(e) => {
              startTransition(() => {
                setCategoryFilter(e.target.value);
              });
            }}
            label={t('news.filter', 'Phân loại')}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Options */}
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="sort-by-label">{t('news.sort', 'Sắp xếp')}</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={(e) => {
              startTransition(() => {
                setSortBy(e.target.value);
              });
            }}
            label={t('news.sort', 'Sắp xếp')}
          >
            <MenuItem value="latest">{t('news.sort.latest', 'Mới nhất')}</MenuItem>
            <MenuItem value="oldest">{t('news.sort.oldest', 'Cũ nhất')}</MenuItem>
            <MenuItem value="title">{t('news.sort.title', 'Tiêu đề (A-Z)')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
            {currentPosts.map((post) => (
              <MobilePostCard
                key={post._id}
                post={post}
                onClick={() => router.push(`/news/${post.slug || post._id}`)}
                pressedId={pressedId}
                setPressedId={setPressedId}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: '52px' }}></TableCell>
                    <TableCell>{t('news.title', 'Tiêu đề')}</TableCell>
                  <TableCell align="center" sx={{ width: '140px' }}>{t('news.category', 'Phân loại')}</TableCell>
                  <TableCell sx={{ width: '120px' }}>{t('news.author', 'Tác giả')}</TableCell>
                  <TableCell sx={{ width: '120px' }}>{t('news.publishDate', 'Published on')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPosts.map((post) => (
                  <DesktopPostRow
                    key={post._id}
                    post={post}
                    onClick={() => router.push(`/news/${post.slug || post._id}`)}
                    formatDate={formatDate}
                    t={t}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        <Box py={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            {t('news.noResults', 'Không tìm thấy bài viết nào')}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={4} mb={2}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size={isMobile ? 'medium' : 'large'}
          />
        </Box>
      )}
    </Container>
  );
}
