import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Typography, Container, CircularProgress, Grid, Card, CardContent,
  Chip, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import LazyImage from '../components/LazyImage';
// import postService from '../services/postService'; // Chưa có, sẽ dùng fetch tạm

const PostDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [sameCategoryPosts, setSameCategoryPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch theo slug
        const res = await fetch(`${API_URL}/api/news/slug/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setPost(data);

        // Fetch related posts
        await fetchRelatedPosts(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedPosts = async (currentPost) => {
      try {
        // Fetch all posts
        const res = await fetch(`${API_URL}/api/news`);
        if (res.ok) {
          const response = await res.json();
          // Handle new API response format
          const allPosts = response.success ? response.data : (Array.isArray(response) ? response : []);

          // Filter posts by same category
          const sameCategoryPosts = allPosts.filter(p =>
            p._id !== currentPost._id && p.category === currentPost.category
          ).slice(0, 3);
          setSameCategoryPosts(sameCategoryPosts);

          // Get random related posts if not enough same category posts
          const otherPosts = allPosts.filter(p =>
            p._id !== currentPost._id && p.category !== currentPost.category
          );
          const randomPosts = otherPosts.sort(() => 0.5 - Math.random()).slice(0, 3);
          setRelatedPosts(randomPosts);

          // Get featured posts (latest 3 posts)
          const featuredPosts = allPosts
            .filter(p => p._id !== currentPost._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setFeaturedPosts(featuredPosts);

          // Find previous and next posts
          const currentIndex = allPosts.findIndex(p => p._id === currentPost._id);
          if (currentIndex > 0) {
            setPrevPost(allPosts[currentIndex - 1]);
          }
          if (currentIndex < allPosts.length - 1) {
            setNextPost(allPosts[currentIndex + 1]);
          }
        }
      } catch (err) {
        console.error("Error fetching related posts:", err);
      }
    };

    fetchPost();
  }, [slug, API_URL]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 6 }}>{t('common.error', 'Đã xảy ra lỗi')}</Typography>;
  if (!post) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography variant="h3" fontWeight={700} mb={2}>{post.title}</Typography>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
            <Typography variant="body2" color="#C9A063">
              {t('news.author', 'Tác giả')}: {post.author || 'BlogHok'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              | {t('news.publishDate', 'Ngày đăng')}: {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
            {post.category && (
              <>
                <Typography variant="body2" color="text.secondary">|</Typography>
                <Chip
                  label={t(`news.categories.${post.category}`, post.category)}
                  size="small"
                  sx={{
                    bgcolor: '#C9A063',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              </>
            )}
          </Box>

          {post.image && (
            <Box mb={3}>
              <LazyImage
                src={post.image}
                alt={post.title}
                sx={{
                  width: '100%',
                  borderRadius: '2px',
                  // On mobile, show the whole image (no crop); on larger screens, keep the 400px cover crop
                  height: { xs: 'auto', sm: 400 },
                  maxHeight: { xs: '70vh', sm: 400 },
                  objectFit: { xs: 'contain', sm: 'cover' }
                }}
                referrerPolicy="no-referrer"
              />
            </Box>
          )}

          <Box sx={{ fontSize: 18, lineHeight: 1.7, mb: 4 }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <Typography variant="h4" component="h1" gutterBottom>{children}</Typography>,
                h2: ({ children }) => <Typography variant="h5" component="h2" gutterBottom>{children}</Typography>,
                h3: ({ children }) => <Typography variant="h6" component="h3" gutterBottom>{children}</Typography>,
                // Avoid invalid <div> inside <p> when images are present
                p: ({ children, node }) => {
                  const hasImage = Array.isArray(node?.children) && node.children.some((n) => n?.tagName === 'img');
                  return (
                    <Typography
                      variant="body1"
                      paragraph={!hasImage}
                      component={hasImage ? 'div' : 'p'}
                    >
                      {children}
                    </Typography>
                  );
                },
                strong: ({ children }) => <Typography component="strong" sx={{ fontWeight: 700 }}>{children}</Typography>,
                em: ({ children }) => <Typography component="em" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                a: ({ href, children }) => (
                  <Typography
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#C9A063',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {children}
                  </Typography>
                ),
                img: ({ src, alt }) => {
                  // Video support: ![video](url) or ![video|size|align](url)
                  if (alt && typeof alt === 'string' && (alt === 'video' || alt.startsWith('video|'))) {
                    let size = 'medium';
                    let align = 'center';
                    if (alt.includes('|')) {
                      const parts = alt.split('|');
                      size = parts[1] || 'medium';
                      align = parts[2] || 'center';
                    }
                    let width = 720;
                    let height = 406; // 16:9
                    if (size === 'small') { width = 480; height = 270; }
                    if (size === 'large') { width = 960; height = 540; }
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
                    const alignmentStyle = align === 'center'
                      ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                      : align === 'right'
                        ? { marginLeft: 'auto', marginRight: 0, display: 'block' }
                        : { display: 'block' };
                    return (
                      <video
                        src={src}
                        controls
                        style={{
                          width: isMobile ? '100%' : `${width}px`,
                          height: isMobile ? 'auto' : `${height}px`,
                          borderRadius: 2,
                          margin: '8px 0',
                          maxWidth: '100%',
                          ...alignmentStyle
                        }}
                      />
                    );
                  }
                  // Support alt format: img|<size>|<shape>
                  // size: small|medium|large, shape: square|rectangle, align: left|center|right
                  let width = 180;
                  let height = 180;
      let borderRadius = 2;
                  let objectFit = 'cover';
                  let align = 'left';
                  if (alt && typeof alt === 'string' && alt.startsWith('img|')) {
                    const parts = alt.split('|');
                    const size = parts[1] || 'medium';
                    const shape = parts[2] || 'rectangle';
                    align = parts[3] || 'left';
                    if (size === 'small') {
                      width = 160; height = shape === 'square' ? 160 : 120;
                    } else if (size === 'large') {
                      width = 640; height = shape === 'square' ? 640 : 360;
                    } else { // medium default
                      width = 360; height = shape === 'square' ? 360 : 200;
                    }
                    if (shape === 'rectangle') {
                      borderRadius = 2; objectFit = 'cover';
                    } else if (shape === 'square') {
                      borderRadius = 2; objectFit = 'cover';
                    }
                  }
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
                  const alignmentStyle = align === 'center'
                    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                    : align === 'right'
                      ? { marginLeft: 'auto', marginRight: 0, display: 'block' }
                      : { display: 'block' };
                  return (
                    <LazyImage
                      src={src}
                      alt={alt}
                      width={isMobile ? '100%' : `${width}px`}
                      height={isMobile ? 'auto' : `${height}px`}
                      sx={{
                        objectFit,
                        borderRadius,
                        margin: '8px 0',
                        maxWidth: '100%',
                        ...alignmentStyle
                      }}
                    />
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </Box>

          {/* Navigation between posts */}
          <Box display="flex" justifyContent="space-between" gap={2} mt={4} mb={4}>
            {prevPost ? (
              <Button
                component={Link}
                to={`/news/${prevPost.slug || prevPost._id}`}
                startIcon={<ArrowBackIcon fontSize="small" />}
                variant="outlined"
                size="small"
                sx={{
                  maxWidth: '48%',
                  minHeight: '60px',
                  p: 1.5,
                  borderColor: '#C9A063',
                  color: '#2D1B06',
                  '&:hover': {
                    borderColor: '#C9A063',
                    backgroundColor: 'rgba(201, 160, 99, 0.1)'
                  }
                }}
              >
                <Box textAlign="left" sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" display="block" sx={{ color: '#6B4F1D', fontWeight: 600 }}>
                    {t('news.prevPost', 'Bài trước')}
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontSize: '0.85rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {(() => {
                      const words = prevPost.title.split(' ');
                      return words.length > 5 ? `${words.slice(0, 5).join(' ')}...` : prevPost.title;
                    })()}
                  </Typography>
                </Box>
              </Button>
            ) : <Box sx={{ width: '48%' }} />}

            {nextPost ? (
              <Button
                component={Link}
                to={`/news/${nextPost.slug || nextPost._id}`}
                endIcon={<ArrowForwardIcon fontSize="small" />}
                variant="outlined"
                size="small"
                sx={{
                  maxWidth: '48%',
                  minHeight: '60px',
                  p: 1.5,
                  borderColor: '#C9A063',
                  color: '#2D1B06',
                  '&:hover': {
                    borderColor: '#C9A063',
                    backgroundColor: 'rgba(201, 160, 99, 0.1)'
                  }
                }}
              >
                <Box textAlign="right" sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" display="block" sx={{ color: '#6B4F1D', fontWeight: 600 }}>
                    {t('news.nextPost', 'Bài tiếp')}
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontSize: '0.85rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {(() => {
                      const words = nextPost.title.split(' ');
                      return words.length > 5 ? `${words.slice(0, 5).join(' ')}...` : nextPost.title;
                    })()}
                  </Typography>
                </Box>
              </Button>
            ) : <Box sx={{ width: '48%' }} />}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Same Category Posts */}
          {sameCategoryPosts.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {t('news.sameCategoryPosts', 'Cùng danh mục')}: {t(`news.categories.${post.category}`, post.category)}
              </Typography>
              <Grid container spacing={2}>
                {sameCategoryPosts.map((relatedPost) => (
                  <Grid item xs={12} key={relatedPost._id}>
                    <Card
                      component={Link}
                      to={`/news/${relatedPost.slug || relatedPost._id}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr',
                        textDecoration: 'none',
                        '&:hover': { boxShadow: 2 },
                        alignItems: 'stretch',
                        height: 60,
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ width: 60, height: 60, flexShrink: 0, borderTopLeftRadius: 'inherit', borderBottomLeftRadius: 'inherit', borderTopRightRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden' }}>
                        {relatedPost.image ? (
                          <LazyImage
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            width="100%"
                            height="100%"
                            sx={{ objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }} />
                        )}
                      </Box>
                      <CardContent sx={{ flex: 1, p: '6px 10px', '&:last-child': { pb: '6px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 60, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: (relatedPost.title && relatedPost.title.length > 40) ? 1.05 : 1.2, mb: (relatedPost.title && relatedPost.title.length > 40) ? 0.2 : 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {relatedPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          {new Date(relatedPost.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {t('news.featuredPosts', 'Bài viết nổi bật')}
              </Typography>
              <Grid container spacing={2}>
                {featuredPosts.map((featuredPost) => (
                  <Grid item xs={12} key={featuredPost._id}>
                    <Card
                      component={Link}
                      to={`/news/${featuredPost.slug || featuredPost._id}`}
                      sx={{
                        display: 'flex',
                        textDecoration: 'none',
                        '&:hover': { boxShadow: 2 },
                        height: 80,
                        alignItems: 'center'
                      }}
                    >
          {featuredPost.image ? (
                        <LazyImage
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          width="80px"
                          height="80px"
                          sx={{
                            objectFit: 'cover',
            borderRadius: '2px 0 0 2px',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
            borderRadius: '2px 0 0 2px',
                            flexShrink: 0
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                      <CardContent sx={{ flex: 1, p: 1.25 }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {featuredPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(featuredPost.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {t('news.relatedPosts', 'Bài viết liên quan')}
              </Typography>
              <Grid container spacing={2}>
                {relatedPosts.map((relatedPost) => (
                  <Grid item xs={12} key={relatedPost._id}>
                    <Card
                      component={Link}
                      to={`/news/${relatedPost.slug || relatedPost._id}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr',
                        textDecoration: 'none',
                        '&:hover': { boxShadow: 2 },
                        height: 80,
                        overflow: 'hidden'
                      }}
                    >
          {relatedPost.image && (
                        <LazyImage
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          width="80px"
                          height="80px"
                          sx={{
                            objectFit: 'cover',
            borderRadius: '2px 0 0 2px',
                            flexShrink: 0
                          }}
                        />
                      )}
                      <CardContent sx={{ flex: 1, p: '8px 10px', '&:last-child': { pb: '8px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 80, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {relatedPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(relatedPost.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PostDetail; 