import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

const FeaturedPosts = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news?sort=latest&limit=3`, { signal: controller.signal });
        const response = await res.json();
        if (aborted) return;
        const postsData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setPosts(postsData);
      } catch (error) {
        if (!aborted) {
          console.error('Error fetching posts:', error);
          setPosts([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    fetchPosts();
    return () => { aborted = true; controller.abort(); };
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
                  <LazyImage
                    src={post.image}
                    alt={post.title}
                    height="180px"
                    rootMargin="500px 0px"
                    sx={{
                      width: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0'
                    }}
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