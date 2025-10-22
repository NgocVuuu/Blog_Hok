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

        {/* Table View of Posts */}
        {filteredPosts.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
            <Table sx={{ width: '100%', tableLayout: isMobile ? 'fixed' : 'auto' }}>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow sx={isMobile ? { display: 'flex', alignItems: 'center', gap: 1, px: 1 } : undefined}>
                  <TableCell sx={isMobile ? { flex: '0 0 56px', p: '6px 4px' } : { width: '48px', p: '6px 1px' }}></TableCell>
                  <TableCell sx={isMobile ? { flex: '1 1 auto', p: '6px 8px', whiteSpace: 'normal' } : { minWidth: 80, p: isMobile ? '6px 2px' : undefined }}>{t('news.title', 'Tiêu đề')}</TableCell>
                  <TableCell align="center" sx={isMobile ? { flex: '0 0 88px', p: '6px 4px', whiteSpace: 'normal' } : { minWidth: 60, p: isMobile ? '6px 2px' : undefined }}>{t('news.category', 'Phân loại')}</TableCell>
                  {!isMobile && <TableCell sx={{ width: '13vw', maxWidth: '13vw', p: 1 }}>{t('news.author', 'Tác giả')}</TableCell>}
                  {!isMobile && <TableCell sx={{ width: '13vw', maxWidth: '13vw', p: 1 }}>Published on</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPosts.map((post) => (
                  <TableRow
                    key={post._id}
                    hover
                    sx={isMobile ? { display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' }, px: 1 } : { cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }}
                    onClick={() => navigate(`/news/${post.slug || post._id}`)}
                  >
                    <TableCell sx={isMobile ? { flex: '0 0 56px', p: '6px 4px', verticalAlign: 'middle', textAlign: 'center' } : { p: 2, verticalAlign: 'middle', width: '48px', maxWidth: '3.5vw', textAlign: 'center' }}>
                      {post.image && (
                        <Box
                          component="img"
                          src={post.image}
                          alt={post.title}
                          sx={{
                            width: isMobile ? 36 : 44,
                            height: isMobile ? 36 : 44,
                            objectFit: 'cover',
                            borderRadius: 1,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            background: '#eee',
                            ml: isMobile ? 0.5 : 0
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={isMobile ? { flex: '1 1 auto', p: '6px 8px', verticalAlign: 'top' } : { p: 2, verticalAlign: 'middle' }}>
                      <Box sx={{ width: '100%', minWidth: 0 }}>
                        <Typography
                          variant={isMobile ? 'subtitle2' : 'subtitle1'}
                          color="text.primary"
                          fontWeight={500}
                          sx={{
                            fontSize: isMobile ? 13 : undefined,
                            lineHeight: 1.25,
                            maxWidth: isMobile ? '54vw' : '100%',
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            whiteSpace: 'normal',
                            minHeight: 27 // Đảm bảo chiều cao bằng ảnh
                          }}
                        >
                          {post.title}
                        </Typography>
                        {isMobile && (
                          <Box display="flex" alignItems="center" gap={1} mt={0.5} sx={{ width: '100%' }}>
                            <Typography variant="caption" color="#C9A063" sx={{ fontSize: 11 }} noWrap>
                              {post.author || 'BlogHok'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }} noWrap>
                              {formatDate(post.createdAt)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={isMobile ? { flex: '0 0 88px', p: '6px 4px', verticalAlign: 'middle', textAlign: 'right' } : { width: isMobile ? '28vw' : undefined, maxWidth: isMobile ? '28vw' : undefined, verticalAlign: 'middle', textAlign: 'center', p: isMobile ? '6px 2px' : undefined }}>
                      {post.category && (
                        <Chip
                          label={t(`news.categories.${post.category}`, post.category)}
                          size="small"
                          sx={{
                              bgcolor: '#C9A063',
                              color: 'white',
                              fontWeight: 500,
                              minWidth: 48,
                              maxWidth: '100%',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              px: 0.5,
                              boxSizing: 'border-box'
                            }}
                        />
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ verticalAlign: 'middle', p: 1 }}>
                        <Typography variant="body2" color="#C9A063" noWrap>
                          {post.author || 'BlogHok'}
                        </Typography>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell sx={{ verticalAlign: 'middle', p: 1 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatDate(post.createdAt)}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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