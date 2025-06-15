import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_API_URL;

const PostList = ({ onEdit }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news`)
      .then(res => res.json())
      .then(response => {
        // Handle new API response format
        const postsData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setPosts(postsData);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setPosts([]);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts(posts.filter(p => p._id !== id));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" mb={2}>{t('admin.postList', 'Danh sách bài viết')}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('news.title', 'Tiêu đề')}</TableCell>
            <TableCell>{t('news.author', 'Tác giả')}</TableCell>
            <TableCell>{t('news.category', 'Danh mục')}</TableCell>
            <TableCell>{t('admin.createdAt', 'Ngày tạo')}</TableCell>
            <TableCell>{t('common.actions', 'Thao tác')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map(post => (
            <TableRow key={post._id}>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {post.title}
                </Typography>
              </TableCell>
              <TableCell>{post.author || 'BlogHok'}</TableCell>
              <TableCell>
                {post.category && (
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{
                      bgcolor: '#C9A063',
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                )}
              </TableCell>
              <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`/edit-post/${post._id}`}
                  >
                    {t('common.edit', 'Sửa')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(post._id)}
                  >
                    {t('common.delete', 'Xóa')}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default PostList; 