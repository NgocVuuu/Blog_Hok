import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, Box,
  Typography, Chip, Tabs, Tab, TextField, InputAdornment,
  Avatar, Paper, TableContainer
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../i18nShim';
import ConfirmDialog from './ConfirmDialog';

const API_URL = process.env.REACT_APP_API_URL;

const PostList = ({ onEdit, editingItem }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [categoryTab, setCategoryTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  // Categories corresponding to the tabs
  // Note: hardcoded keys must match what is saved in DB (guides, updates, events, esports)
  const categories = [
    { value: 'all', label: t('news.categories.all', 'Tất cả') },
    { value: 'guides', label: t('news.categories.guides', 'Hướng dẫn') },
    { value: 'updates', label: t('news.categories.updates', 'Cập nhật') },
    { value: 'events', label: t('news.categories.events', 'Sự kiện') },
    { value: 'esports', label: t('news.categories.esports', 'Esports') }
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/news?status=all&limit=300`) // Limit must be <= 300 due to server validation
      .then(res => res.json())
      .then(response => {
        if (!response.success && !Array.isArray(response)) {
          console.error('API Error:', response);
          setPosts([]);
          return;
        }
        const postsData = response.success ? response.data : (Array.isArray(response) ? response : []);
        // Sort by newest first by default
        postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsData);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setPosts([]);
      });
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/news/${deleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts(posts.filter(p => p._id !== deleteId));
    setDeleteId(null);
  };

  // Filter logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 1. Filter by Category Tab
      const matchesCategory = categoryTab === 'all' || post.category === categoryTab;

      // 2. Filter by Search Term (Title or Author)
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (post.title && post.title.toLowerCase().includes(term)) ||
        (post.author && post.author.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [posts, categoryTab, searchTerm]);

  return (
    <Box sx={{ mt: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h6">{t('admin.postList', 'Danh sách bài viết')}</Typography>

        <TextField
          size="small"
          placeholder={t('news.search', 'Tìm kiếm...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      <Paper sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>

        <Tabs
          value={categoryTab}
          onChange={(_, v) => setCategoryTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          {categories.map(cat => (
            <Tab key={cat.value} value={cat.value} label={cat.label} sx={{ fontWeight: 600 }} />
          ))}
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell width="60">{t('admin.image', 'Ảnh')}</TableCell>
                <TableCell>{t('news.title', 'Tiêu đề')}</TableCell>
                <TableCell>{t('news.author', 'Tác giả')}</TableCell>
                <TableCell>{t('news.category', 'Danh mục')}</TableCell>
                <TableCell>{t('admin.createdAt', 'Ngày tạo')}</TableCell>
                <TableCell align="right">{t('common.actions', 'Thao tác')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <TableRow 
                    key={post._id} 
                    hover
                    sx={{
                      bgcolor: editingItem && editingItem._id === post._id ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                      '&:hover': { bgcolor: editingItem && editingItem._id === post._id ? 'rgba(25, 118, 210, 0.18) !important' : undefined }
                    }}
                  >
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={post.image || post.thumbnail}
                        alt={post.title}
                        sx={{ width: 50, height: 50, bgcolor: 'grey.200' }}
                      >
                        {!post.image && !post.thumbnail && (post.title?.[0] || 'N')}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 300 }}>
                        {post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{post.author || 'BlogHok'}</TableCell>
                    <TableCell>
                      {post.category && (
                        <Chip
                          label={categories.find(c => c.value === post.category)?.label || post.category}
                          size="small"
                          sx={{
                            bgcolor: '#C9A063',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                      {post.status === 'draft' && (
                        <Chip
                          label="Draft"
                          size="small"
                          variant="outlined"
                          sx={{
                            ml: 0.5,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onEdit(post)}
                        >
                          {t('common.edit', 'Sửa')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(post._id)}
                        >
                          {t('common.delete', 'Xóa')}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {t('admin.noPosts', 'Không tìm thấy bài viết nào.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <ConfirmDialog
        open={!!deleteId}
        title={t('common.confirmDelete', 'Xóa bài viết')}
        content={t('common.confirmDeleteMessage', 'Bạn có chắc chắn muốn xóa bài viết này không?')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default PostList;