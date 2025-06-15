import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FeaturedPosts = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/news?sort=latest&limit=3`)
      .then(res => res.json())
      .then(response => {
        // Handle new API response format
        const postsData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setPosts(postsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setLoading(false);
      });
  }, [API_URL]);

  if (loading) return <CircularProgress />;

  // Ensure posts is always an array
  const postsArray = Array.isArray(posts) ? posts : [];

  return (
    <Box>
      <Typography variant="h5" mb={2}>{t('home.latest.title')}</Typography>
      {postsArray.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {t('home.latest.noData', 'No news available')}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {postsArray.map(post => (
          <Grid item xs={12} md={4} key={post._id}>
            <Link to={`/news/${post.slug || post._id}`} style={{ textDecoration: 'none' }}>
              <Card>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{post.summary || (post.content ? post.content.slice(0, 100) + '...' : '')}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(post.createdAt).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FeaturedPosts; 