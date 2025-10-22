import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Grid, Typography, Box,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, FormControl, InputLabel, Select, MenuItem, Pagination,
  CircularProgress, Chip, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const News = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  // track pressed card id to show touch feedback on mobile (hover isn't reliable on touch)
  const [pressedId, setPressedId] = useState(null);

  const postsPerPage = 10;
  const API_URL = process.env.REACT_APP_API_URL;

  // Categories for filter dropdown
  const categories = [
    { value: 'all', label: t('news.categories.all', 'Tất cả') },
    { value: 'guides', label: t('news.categories.guides', 'Hướng dẫn') },
    { value: 'updates', label: t('news.categories.updates', 'Cập nhật') },
    { value: 'events', label: t('news.categories.events', 'Sự kiện') },
    { value: 'esports', label: t('news.categories.esports', 'Thể thao điện tử') }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/news`);
        if (!res.ok) throw new Error('Failed to fetch news');
        const response = await res.json();
        // Handle new API response format
        const postsData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setPosts(postsData);
        setFilteredPosts(postsData);
      } catch (err) {
        console.error('Error fetching news:', err);
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [API_URL]);

  // Debounce search for snappier typing
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), isMobile ? 150 : 250);
    return () => clearTimeout(id);
  }, [searchTerm, isMobile]);

  // Apply filters and search whenever these dependencies change
  useEffect(() => {
    let result = [...posts];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }

    // Apply search term
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(term) || 
          (post.summary && post.summary.toLowerCase().includes(term)) ||
          (post.content && post.content.toLowerCase().includes(term))
      );
    }

    // Apply sort
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredPosts(result);
    setPage(1); // Reset to first page when filters change
  }, [posts, debouncedSearch, sortBy, categoryFilter]);

  // Quick suggestions based on current typing (not debounced) for dropdown
  const quickMatches = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return [];
    const list = posts.filter(p =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.summary && p.summary.toLowerCase().includes(term))
    );
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(0, 6);
  }, [searchTerm, posts]);

  // Get current posts for pagination
  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const pageCount = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
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
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 1, md: 4 } }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {t('news.latestNews', 'Tin Tức Mới Nhất')}
        </Typography>
        
        {/* Search and Filter Controls */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3, mt: 2 }}>
          {/* Search Field */}
          <Grid item xs={12} md={5} sx={{ position: 'relative' }}>
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
                  navigate(`/news/${first.slug || first._id}`);
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
              sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
            />

            {searchTerm && quickMatches.length > 0 && (
              <Box sx={{ position:'absolute', left:0, right:0, zIndex:5, mt:0.5, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', borderRadius:1, boxShadow:3, maxHeight: 300, overflowY:'auto' }}>
                {quickMatches.map(p => (
                  <Box
                    key={p._id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/news/${p.slug || p._id}`); }}
                    sx={{ display:'flex', alignItems:'center', gap:1, p:1, cursor:'pointer', textDecoration:'none', color:'inherit', '&:hover':{ bgcolor:'action.hover' } }}
                  >
                    {p.thumbnail || p.image ? (
                      <Box component="img" src={p.thumbnail || p.image} alt={p.title} sx={{ width:36, height:36, objectFit:'cover', borderRadius:1, border:'1px solid', borderColor:'divider' }} />
                    ) : (
                      <Box sx={{ width:36, height:36, bgcolor:'grey.200', borderRadius:1 }} />
                    )}
                    <Typography variant="body2" noWrap sx={{ flex:1, minWidth:0 }}>{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Category Filter */}
          <Grid item xs={6} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="category-filter-label">{t('news.filter', 'Phân loại')}</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label={t('news.filter', 'Phân loại')}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Options */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="sort-by-label">{t('news.sort', 'Sắp xếp')}</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t('news.sort', 'Sắp xếp')}
              >
                <MenuItem value="latest">{t('news.sort.latest', 'Mới nhất')}</MenuItem>
                <MenuItem value="oldest">{t('news.sort.oldest', 'Cũ nhất')}</MenuItem>
                <MenuItem value="title">{t('news.sort.title', 'Tiêu đề (A-Z)')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Posts: desktop uses table, mobile uses stacked cards for clarity and accessibility */}
        {filteredPosts.length > 0 ? (
          isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
              {currentPosts.map((post) => (
                <Box
                  key={post._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/news/${post.slug || post._id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/news/${post.slug || post._id}`); }}
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
                    // Improve touch and hover feedback
                    transition: 'transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms cubic-bezier(.2,.9,.2,1), background-color 120ms ease',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.01)',
                      boxShadow: 8,
                      bgcolor: 'action.hover'
                    },
                    '&:active': { transform: 'translateY(-2px) scale(0.998)', boxShadow: 3 },
                    '&:focus-visible': {
                      outline: '3px solid rgba(201,160,99,0.22)',
                      outlineOffset: '2px'
                    },
                    // On small touch devices, prefer smaller transform to avoid jank
                    '@media (pointer:coarse)': {
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 }
                    },
                    // pressed state via prop so touch taps show immediate feedback
                    ...(pressedId === post._id ? {
                      transform: 'translateY(-2px) scale(0.998)',
                      boxShadow: 3,
                      bgcolor: 'action.selected'
                    } : {})
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    {post.image ? (
                      <Box component="img" src={post.image} alt={post.title} sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, flex: '0 0 auto' }} />
                    ) : (
                      <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'grey.200', flex: '0 0 auto' }} />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={500} color="text.primary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }}>
                        {post.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        <Box component="span" sx={{ color: '#C9A063', mr: 0.5 }}>{post.author || 'BlogHok'}</Box>
                        <Box component="span">• {formatDate(post.createdAt)}</Box>
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ ml: 1, flex: '0 0 auto' }}>
                    {post.category && (
                      <Chip label={t(`news.categories.${post.category}`, post.category)} size="small" sx={{ bgcolor: '#C9A063', color: 'white', fontWeight: 500 }} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
              {/* Use fixed table layout and percentage widths so header and body columns align */}
              <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ width: '6%', p: '6px 1px' }}></TableCell>
                    <TableCell sx={{ width: '56%' }}>{t('news.title', 'Tiêu đề')}</TableCell>
                    <TableCell align="center" sx={{ width: '18%' }}>{t('news.category', 'Phân loại')}</TableCell>
                    <TableCell sx={{ width: '10%', p: 1, textAlign: 'left' }}>{t('news.author', 'Tác giả')}</TableCell>
                    <TableCell sx={{ width: '10%', p: 1, textAlign: 'left' }}>Published on</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPosts.map((post) => (
                    <TableRow key={post._id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }} onClick={() => navigate(`/news/${post.slug || post._id}`)}>
                      <TableCell sx={{ p: 2, verticalAlign: 'middle', width: '6%', textAlign: 'center' }}>
                        {post.image && (
                          <Box component="img" src={post.image} alt={post.title} sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ p: 2, verticalAlign: 'middle', maxWidth: '56%' }}>
                        <Typography variant="subtitle1" fontWeight={500}>{post.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'middle', textAlign: 'center', p: 1, maxWidth: '18%' }}>
                        {post.category && <Chip label={t(`news.categories.${post.category}`, post.category)} size="small" sx={{ bgcolor: '#C9A063', color: 'white', fontWeight: 500 }} />}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'middle', p: 1, maxWidth: '10%' }}>
                        <Typography variant="body2" color="#C9A063" noWrap>{post.author || 'BlogHok'}</Typography>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'middle', p: 1, maxWidth: '10%' }}>
                        <Typography variant="body2" color="text.secondary" noWrap>{formatDate(post.createdAt)}</Typography>
                      </TableCell>
                    </TableRow>
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
              size="large"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default News; 