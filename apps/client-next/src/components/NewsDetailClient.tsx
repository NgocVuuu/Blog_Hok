"use client";
import React from 'react';
import Link from 'next/link';
import {
  Box, Typography, Container, Card, CardContent,
  Chip, Button, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReactMarkdown from 'react-markdown';
import LazyImage from '@/components/LazyImage';
import { useTranslation } from 'react-i18next';

type NewsDetailClientProps = {
  post: any;
  sameCategoryPosts: any[];
  featuredPosts: any[];
  relatedPosts: any[];
  prevPost: any;
  nextPost: any;
};

export default function NewsDetailClient({
  post,
  sameCategoryPosts,
  featuredPosts,
  relatedPosts,
  prevPost,
  nextPost
}: NewsDetailClientProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!post) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Main Content */}
        <Box>
          <Typography variant="h3" fontWeight={700} mb={2}>{post.title}</Typography>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
            <Typography variant="body2" color="#C9A063">
              {String(t('news.author', 'Author'))}: {post.author || 'BlogHok'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              | {String(t('news.publishDate', 'Published on'))}: {formatDate(post.createdAt)}
            </Typography>
            {post.category && (
              <>
                <Typography variant="body2" color="text.secondary">|</Typography>
                <Chip
                  label={String(t(`news.categories.${post.category}`, post.category))}
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
                p: ({ children, node }: any) => {
                  const hasImage = Array.isArray(node?.children) && node.children.some((n: any) => n?.tagName === 'img');
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
                a: ({ href, children }: any) => (
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
                img: ({ src, alt }: any) => {
                  // Video support
                  if (alt && typeof alt === 'string' && (alt === 'video' || alt.startsWith('video|'))) {
                    let size = 'medium';
                    let align = 'center';
                    if (alt.includes('|')) {
                      const parts = alt.split('|');
                      size = parts[1] || 'medium';
                      align = parts[2] || 'center';
                    }
                    let width = 720;
                    let height = 406;
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
                  // Image with size/shape support
                  let width = 180;
                  let height = 180;
                  let borderRadius = 2;
                  let objectFit = 'cover';
                  let align = 'left';
                  let shape = 'rectangle';
                  if (alt && typeof alt === 'string' && alt.startsWith('img|')) {
                    const parts = alt.split('|');
                    const sizeStr = parts[1] || 'medium';
                    shape = parts[2] || 'rectangle';
                    align = parts[3] || 'left';
                    if (sizeStr === 'small') {
                      width = 128; height = shape === 'square' ? 128 : 96;
                    } else if (sizeStr === 'large') {
                      width = 512; height = shape === 'square' ? 512 : 288;
                    } else {
                      width = 288; height = shape === 'square' ? 288 : 160;
                    }
                    if (shape === 'rectangle') {
                      width = Math.round(width * 1.2);
                      height = Math.round(height * 1.2);
                    }
                  }
                  
                  // Calculate aspect ratio for responsive images
                  const aspectRatio = height > 0 ? width / height : 16 / 9;
                  
                  const alignmentStyle = align === 'center'
                    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                    : align === 'right'
                      ? { marginLeft: 'auto', marginRight: 0, display: 'block' }
                      : { display: 'block' };
                  
                  return (
                    <LazyImage
                      src={src || ''}
                      alt={alt || ''}
                      width="100%"
                      height="auto"
                      sx={{
                        objectFit,
                        borderRadius,
                        margin: '8px 0',
                        maxWidth: { xs: '100%', sm: `${width}px` },
                        height: {
                          xs: shape === 'rectangle' ? `calc(100vw / ${aspectRatio})` : 'auto',
                          sm: `${height}px`
                        },
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
              <Link href={`/news/${prevPost.slug || prevPost._id}`} style={{ textDecoration: 'none', maxWidth: '48%', width: '100%' }}>
                <Button
                  startIcon={<ArrowBackIcon fontSize="small" />}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
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
                      {String(t('news.prevPost', 'Previous'))}
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
              </Link>
            ) : <Box sx={{ width: '48%' }} />}

            {nextPost ? (
              <Link href={`/news/${nextPost.slug || nextPost._id}`} style={{ textDecoration: 'none', maxWidth: '48%', width: '100%' }}>
                <Button
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
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
                      {String(t('news.nextPost', 'Next'))}
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
              </Link>
            ) : <Box sx={{ width: '48%' }} />}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Same Category Posts */}
          {sameCategoryPosts.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {String(t('news.sameCategoryPosts', 'Same Category'))}: {String(t(`news.categories.${post.category}`, post.category))}
              </Typography>
              <Stack spacing={2}>
                {sameCategoryPosts.map((relatedPost) => (
                  <Link key={relatedPost._id} href={`/news/${relatedPost.slug || relatedPost._id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '96px 1fr', sm: '80px 1fr' },
                        '&:hover': { boxShadow: 2 },
                        alignItems: 'center',
                        height: { xs: 96, sm: 80 },
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ width: { xs: 96, sm: 80 }, height: { xs: 96, sm: 80 }, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', lineHeight: 0 }}>
                        {relatedPost.image ? (
                          <LazyImage
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            width="100%"
                            height="100%"
                            sx={{
                              objectFit: 'cover',
                              display: 'block',
                              transform: { xs: 'none', sm: 'scale(1)' },
                              transformOrigin: 'center',
                              transition: 'transform 180ms',
                              width: '100%',
                              height: '100%',
                              '& img': { margin: 0, padding: 0, objectPosition: 'center', width: '100%', height: '100%', display: 'block' }
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }} />
                        )}
                      </Box>
                      <CardContent sx={{ flex: 1, p: '8px 10px', '&:last-child': { pb: '8px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: { xs: 96, sm: 80 }, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {relatedPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          {formatDate(relatedPost.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </Stack>
            </Box>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {String(t('news.featuredPosts', 'Featured Posts'))}
              </Typography>
              <Stack spacing={2}>
                {featuredPosts.map((featuredPost) => (
                  <Link key={featuredPost._id} href={`/news/${featuredPost.slug || featuredPost._id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      sx={{
                        display: 'flex',
                        '&:hover': { boxShadow: 2 },
                        height: { xs: 96, sm: 80 },
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ width: { xs: 96, sm: 80 }, height: { xs: 96, sm: 80 }, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center', lineHeight: 0 }}>
                        {featuredPost.image ? (
                          <LazyImage
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            width="100%"
                            height="100%"
                            sx={{
                              objectFit: 'cover',
                              borderRadius: '2px 0 0 2px',
                              flexShrink: 0,
                              width: '100%',
                              height: '100%',
                              display: 'block',
                              transform: { xs: 'none', sm: 'scale(1)' },
                              transformOrigin: 'center',
                              transition: 'transform 180ms',
                              '& img': { margin: 0, padding: 0, objectPosition: 'center', width: '100%', height: '100%', display: 'block' }
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: { xs: 96, sm: 80 },
                              height: { xs: 96, sm: 80 },
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
                      </Box>
                      <CardContent sx={{ flex: 1, p: 1.25, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: { xs: 96, sm: 80 }, '&:last-child': { pb: '8px' }, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {featuredPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(featuredPost.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </Stack>
            </Box>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {String(t('news.relatedPosts', 'Related Posts'))}
              </Typography>
              <Stack spacing={2}>
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost._id} href={`/news/${relatedPost.slug || relatedPost._id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '96px 1fr', sm: '80px 1fr' },
                        '&:hover': { boxShadow: 2 },
                        height: { xs: 96, sm: 80 },
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ width: { xs: 96, sm: 80 }, height: { xs: 96, sm: 80 }, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center', lineHeight: 0 }}>
                        {relatedPost.image ? (
                          <LazyImage
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            width="100%"
                            height="100%"
                            sx={{
                              objectFit: 'cover',
                              borderRadius: '2px 0 0 2px',
                              flexShrink: 0,
                              width: '100%',
                              height: '100%',
                              transform: { xs: 'none', sm: 'scale(1)' },
                              transformOrigin: 'center',
                              transition: 'transform 180ms',
                              display: 'block',
                              '& img': { margin: 0, padding: 0, objectPosition: 'center', width: '100%', height: '100%', display: 'block' }
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }} />
                        )}
                      </Box>
                      <CardContent sx={{ flex: 1, p: '8px 10px', '&:last-child': { pb: '8px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: { xs: 96, sm: 80 }, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2, mb: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {relatedPost.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(relatedPost.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
