import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, FormControl, InputLabel, Select, MenuItem, Pagination,
  CircularProgress, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const News = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Apply filters and search whenever these dependencies change
  useEffect(() => {
    let result = [...posts];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(post => post.category === categoryFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
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
  }, [posts, searchTerm, sortBy, categoryFilter]);

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
        <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
          {/* Search Field */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('news.search', 'Tìm kiếm bài viết...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('news.filter', 'Phân loại')}
              </InputLabel>
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">
                <SortIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('news.sort', 'Sắp xếp')}
              </InputLabel>
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
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell width="50%">{t('news.title', 'Tiêu đề')}</TableCell>
                  <TableCell>{t('news.category', 'Phân loại')}</TableCell>
                  <TableCell>{t('news.author', 'Tác giả')}</TableCell>
                  <TableCell>{t('news.publishDate', 'Ngày đăng')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPosts.map((post) => (
                  <TableRow
                    key={post._id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f9f9f9' }
                    }}
                    onClick={() => navigate(`/news/${post.slug || post._id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {post.image && (
                          <Box
                            component="img"
                            src={post.image}
                            alt={post.title}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              mr: 2
                            }}
                          />
                        )}
                        <Typography
                          variant="subtitle1"
                          color="text.primary"
                          fontWeight={500}
                        >
                          {post.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {post.category && (
                        <Chip
                          label={t(`news.categories.${post.category}`, post.category)}
                          size="small"
                          sx={{
                            bgcolor: '#C9A063',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#C9A063">
                        {post.author || 'BlogHok'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(post.createdAt)}
                    </TableCell>
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