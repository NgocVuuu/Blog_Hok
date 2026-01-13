"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Typography, Container, Card, CardContent,
  Chip, Button, Stack, Divider, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid, Collapse
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import LazyImage from '@/components/LazyImage';
import CommentSection from '@/components/Comments/CommentSection';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter } from 'react-icons/fa';

// Plugin to transform directives to HTML attributes
function remarkDirectiveRehype() {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = {
          ...(node.attributes || {}),
          className: node.name, // e.g. 'row' or 'col'
        };
      }
    });
  };
}

type NewsDetailClientProps = {
  post: any;
  sameCategoryPosts: any[];
  featuredPosts: any[];
  relatedPosts: any[];
  prevPost: any;
  nextPost: any;
  categoryLists?: Record<string, any[]>;
};

export default function NewsDetailClient({
  post,
  sameCategoryPosts,
  featuredPosts,
  relatedPosts,
  prevPost,
  nextPost,
  categoryLists
}: NewsDetailClientProps) {
  const { t } = useTranslation();
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [tocOpen, setTocOpen] = useState(false);

  // Filter out current category from sidebar lists if categoryLists is provided
  const sidebarCategories = categoryLists ? Object.keys(categoryLists).filter(cat => cat !== post.category) : [];

  useEffect(() => {
    // Generate TOC from rendered headings
    const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3');
    const tocItems: { id: string; text: string; level: number }[] = [];
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      tocItems.push({
        id: heading.id,
        text: (heading as HTMLElement).innerText,
        level: parseInt(heading.tagName.substring(1))
      });
    });
    setToc(tocItems);
  }, [post]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = post.title;
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      // Could add toast here
    }
  };

  if (!post) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Sidebar: Share Buttons (Desktop) */}
        <Grid size={{ xs: 12, md: 'auto' }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <Typography variant="caption" color="text.secondary" sx={{ writingMode: 'vertical-rl', mb: 1 }}>SHARE</Typography>
            <IconButton onClick={() => handleShare('facebook')} sx={{ color: '#1877F2', bgcolor: 'rgba(24, 119, 242, 0.1)' }}><FaFacebook /></IconButton>
            <IconButton onClick={() => handleShare('twitter')} sx={{ color: '#1DA1F2', bgcolor: 'rgba(29, 161, 242, 0.1)' }}><FaTwitter /></IconButton>
            <IconButton onClick={() => handleShare('copy')} sx={{ color: '#C9A063', bgcolor: 'rgba(201, 160, 99, 0.1)' }}><ContentCopyIcon /></IconButton>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 'grow' }}>
          <Box mb={4}>
            <Box mb={2}>
              <Box
                component="span"
                sx={{
                  bgcolor: '#C9A063',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  display: 'inline-block'
                }}
              >
                {String(t(`news.categories.${post.category}`, post.category))}
              </Box>
            </Box>
            <Typography variant="h3" component="h1" fontWeight={800} sx={{ mt: 1, mb: 2, lineHeight: 1.2 }}>
              {post.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src="/logo.png" sx={{ width: 32, height: 32 }} />
                <Typography variant="subtitle2" fontWeight={600}>{post.author || 'BlogHok'}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Typography variant="caption" color="text.secondary">Published on: {formatDate(post.publishedAt || post.createdAt)}</Typography>
            </Box>

            <LazyImage
              src={post.image}
              alt={post.title}
              sx={{ width: '100%', height: { xs: '200px', md: '450px' }, objectFit: 'cover', borderRadius: 2, mb: 4, boxShadow: 3 }}
            />

            {/* Collapsible TOC in Main Column */}
            {toc.length > 0 && (
              <Box mb={4} p={2} bgcolor="#fff" borderRadius={2} border="1px solid #e0e0e0" sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" onClick={() => setTocOpen(!tocOpen)} sx={{ cursor: 'pointer' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'uppercase', color: '#C9A063', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ width: 4, height: 16, backgroundColor: '#C9A063', display: 'inline-block', borderRadius: 2 }}></span>
                    Table of Contents
                  </Typography>
                  <IconButton size="small">
                    {tocOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </Box>
                <Collapse in={tocOpen}>
                  <Box mt={2} pl={1}>
                    <Stack spacing={1}>
                      {toc.map((item) => (
                        <Link key={item.id} href={`#${item.id}`} style={{ textDecoration: 'none', color: '#555', display: 'block' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              pl: item.level === 3 ? 2 : 0,
                              borderLeft: '2px solid transparent',
                              '&:hover': { color: '#C9A063', borderLeftColor: '#C9A063', pl: (item.level === 3 ? 2.5 : 0.5) },
                              transition: 'all 0.2s'
                            }}
                          >
                            {item.text}
                          </Typography>
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>
            )}

            <Box className="markdown-content" sx={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: '#2c3e50',
              '& h2': { mt: 4, mb: 2, fontWeight: 700, fontSize: '1.8rem', color: '#1a1a1a', borderLeft: '4px solid #C9A063', pl: 2 },
              '& h3': { mt: 3, mb: 1.5, fontWeight: 600, fontSize: '1.4rem', color: '#333' },
              '& p': { mb: 2 },
              '& ul': { mb: 2, pl: 4, listStyleType: 'disc' },
              '& ol': { mb: 2, pl: 4, listStyleType: 'decimal' },
              '& li': { mb: 1, pl: 1 },
              '& blockquote': { borderLeft: '4px solid #C9A063', m: 0, pl: 2, py: 1, bgcolor: 'rgba(201, 160, 99, 0.1)', fontStyle: 'italic', borderRadius: '0 4px 4px 0' },
              '& a': { color: '#C9A063', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } },
              '& [data-directive="row"]': { display: 'flex', flexWrap: 'wrap', gap: '24px', mb: 3, width: '100%', alignItems: 'flex-start' },
              '& [data-directive="col"]': { flex: 1, minWidth: '250px', '& > *:first-of-type': { mt: 0 } },
              '& table': { width: '100%', borderCollapse: 'collapse', mb: 3, border: '1px solid #e0e0e0', tableLayout: 'fixed' },
              '& th': { bgcolor: '#f5f5f5', fontWeight: 700, p: 1, border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '0.95rem' },
              '& td': { p: 1, border: '1px solid #e0e0e0', verticalAlign: 'middle', fontSize: '0.95rem', textAlign: 'center' },
              '& table p': { m: 0 },
              // Removed strict overrides for table images to allow custom sizing
              '& table img': { borderRadius: '4px' },
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveRehype]}
                components={{
                  // Use standard HTML table elements styled via parent Box to avoid nesting issues and ensure "clean" look
                  table: ({ children }) => <table>{children}</table>,
                  thead: ({ children }) => <thead>{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => <th>{children}</th>,
                  td: ({ children }) => <td>{children}</td>,
                  img: ({ src, alt }: any) => {
                    // Video support
                    if (alt && typeof alt === 'string' && (alt === 'video' || alt.startsWith('video|') || alt.startsWith('video;') || alt.startsWith('video:'))) {
                      let size = 'medium';
                      let align = 'center';
                      const separator = alt.includes('|') ? '|' : alt.includes(';') ? ';' : ':';
                      if (alt.includes(separator)) {
                        const parts = alt.split(separator);
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
                            borderRadius: 8,
                            margin: '16px 0',
                            maxWidth: '100%',
                            ...alignmentStyle
                          }}
                        />
                      );
                    }
                    // Image with size/shape support
                    let width = '100%';
                    let maxWidth = '800px';
                    let borderRadius = '8px';
                    let align = 'center';
                    let shape = 'rectangle';

                    if (alt && typeof alt === 'string' && (alt.startsWith('img|') || alt.startsWith('img;') || alt.startsWith('img:'))) {
                      const separator = alt.includes('|') ? '|' : alt.includes(';') ? ';' : ':';
                      const parts = alt.split(separator);
                      const sizeStr = parts[1] || 'medium';
                      shape = parts[2] || 'rectangle';
                      align = parts[3] || 'center';

                      if (sizeStr === 'icon') maxWidth = '60px'; // New icon size
                      else if (sizeStr === 'tiny') maxWidth = '120px'; // New tiny size
                      else if (sizeStr === 'small') maxWidth = '300px';
                      else if (sizeStr === 'medium') maxWidth = '600px';
                      else if (sizeStr === 'large') maxWidth = '100%';
                    }

                    const alignmentStyle = align === 'center'
                      ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                      : align === 'right'
                        ? { marginLeft: 'auto', marginRight: 0, display: 'block' }
                        : { display: 'block' };

                    const wrapperShapeStyle = shape === 'square'
                      ? { aspectRatio: '1 / 1', overflow: 'hidden' }
                      : {};

                    const imgShapeStyle = shape === 'square'
                      ? { objectFit: 'cover' }
                      : {};

                    return (
                      <Box component="span" className="media-wrapper" sx={{
                        ...alignmentStyle,
                        maxWidth,
                        width: '100%',
                        mb: 3,
                        display: 'block',
                        ...wrapperShapeStyle
                      }}>
                        <LazyImage
                          src={src || ''}
                          alt={alt || ''}
                          sx={{
                            width: '100%',
                            height: shape === 'square' ? '100%' : 'auto',
                            borderRadius,
                            boxShadow: 1,
                            ...imgShapeStyle
                          }}
                        />
                        {alt && !alt.startsWith('img|') && !alt.startsWith('video|') && !alt.startsWith('img;') && !alt.startsWith('video;') && !alt.startsWith('img:') && !alt.startsWith('video:') && (
                          <Typography component="span" variant="caption" display="block" align="center" color="text.secondary" mt={1}>
                            {alt}
                          </Typography>
                        )}
                      </Box>
                    );
                  }
                }}
              >
                {post.content}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Author Card */}
            <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar src="/logo.png" sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>{post.author || 'BlogHok'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Providing the latest Honor of Kings news, guides, and esports updates.
                </Typography>
              </Box>
            </Box>

            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" gap={2} mt={4} pt={4} borderTop="1px solid #eee">
              {prevPost ? (
                <Link href={`/news/${prevPost.slug || prevPost._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    fullWidth
                    sx={{ justifyContent: 'flex-start', height: '100%', p: 2, borderColor: '#eee', color: 'inherit', '&:hover': { borderColor: '#C9A063', bgcolor: 'transparent' } }}
                  >
                    <Box textAlign="left">
                      <Typography variant="caption" display="block" color="text.secondary">Previous</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {prevPost.title}
                      </Typography>
                    </Box>
                  </Button>
                </Link>
              ) : <Box flex={1} />}
              {nextPost ? (
                <Link href={`/news/${nextPost.slug || nextPost._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    variant="outlined"
                    fullWidth
                    sx={{ justifyContent: 'flex-end', height: '100%', p: 2, borderColor: '#eee', color: 'inherit', '&:hover': { borderColor: '#C9A063', bgcolor: 'transparent' } }}
                  >
                    <Box textAlign="right">
                      <Typography variant="caption" display="block" color="text.secondary">Next</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {nextPost.title}
                      </Typography>
                    </Box>
                  </Button>
                </Link>
              ) : <Box flex={1} />}
            </Box>

            {/* Mobile Sidebar Content (Mobile Only) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4 }}>
              {/* 1. Related Posts (Same Category) */}
              {sameCategoryPosts.length > 0 && (
                <Box mb={4}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                    More in {post.category}
                  </Typography>
                  <Stack spacing={2}>
                    {sameCategoryPosts.map((p) => (
                      <Link key={p._id} href={`/news/${p.slug || p._id}`} style={{ textDecoration: 'none' }}>
                        <Box display="flex" gap={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateX(4px)' } }}>
                          <LazyImage src={p.image} alt={p.title} sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }} />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, mb: 0.5, color: '#333', '&:hover': { color: '#C9A063' } }}>
                              {p.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt)}</Typography>
                          </Box>
                        </Box>
                      </Link>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* 2. Keywords Section */}
              {post.keywords && post.keywords.trim() && (
                <Box mb={4}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {post.keywords.split(',').map((keyword: string, index: number) => {
                      const trimmedKeyword = keyword.trim();
                      if (!trimmedKeyword) return null;
                      return (
                        <Chip
                          key={index}
                          label={trimmedKeyword}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(201, 160, 99, 0.1)',
                            color: '#C9A063',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: '#C9A063',
                              color: 'white',
                              cursor: 'pointer',
                            },
                            transition: 'all 0.2s'
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* 3. Other Categories Lists */}
              {categoryLists && sidebarCategories.map(cat => {
                const list = categoryLists[cat];
                if (!list || list.length === 0) return null;
                return (
                  <Box mb={4} key={cat}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                      Latest {cat}
                    </Typography>
                    <Stack spacing={2}>
                      {list.map((p) => (
                        <Link key={p._id} href={`/news/${p.slug || p._id}`} style={{ textDecoration: 'none' }}>
                          <Box display="flex" gap={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateX(4px)' } }}>
                            <LazyImage src={p.image} alt={p.title} sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }} />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, mb: 0.5, color: '#333', '&:hover': { color: '#C9A063' } }}>
                                {p.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt)}</Typography>
                            </Box>
                          </Box>
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Grid>

        {/* Right Sidebar: Related & Other Categories (Desktop) */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box>
            {/* 1. Related Posts (Same Category) */}
            {sameCategoryPosts.length > 0 && (
              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                  More in {post.category}
                </Typography>
                <Stack spacing={2}>
                  {sameCategoryPosts.map((p) => (
                    <Link key={p._id} href={`/news/${p.slug || p._id}`} style={{ textDecoration: 'none' }}>
                      <Box display="flex" gap={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateX(4px)' } }}>
                        <LazyImage src={p.image} alt={p.title} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }} />
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, mb: 0.5, color: '#333', '&:hover': { color: '#C9A063' } }}>
                            {p.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt)}</Typography>
                        </Box>
                      </Box>
                    </Link>
                  ))}
                </Stack>
              </Box>
            )}

            {/* 2. Keywords Section */}
            {post.keywords && post.keywords.trim() && (
              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                  Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.keywords.split(',').map((keyword: string, index: number) => {
                    const trimmedKeyword = keyword.trim();
                    if (!trimmedKeyword) return null;
                    return (
                      <Chip
                        key={index}
                        label={trimmedKeyword}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(201, 160, 99, 0.1)',
                          color: '#C9A063',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          '&:hover': {
                            bgcolor: '#C9A063',
                            color: 'white',
                            cursor: 'pointer',
                          },
                          transition: 'all 0.2s'
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* 3. Other Categories Lists */}
            {categoryLists && sidebarCategories.map(cat => {
              const list = categoryLists[cat];
              if (!list || list.length === 0) return null;
              return (
                <Box mb={4} key={cat}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ borderLeft: '3px solid #C9A063', pl: 1, textTransform: 'uppercase' }}>
                    Latest {cat}
                  </Typography>
                  <Stack spacing={2}>
                    {list.map((p) => (
                      <Link key={p._id} href={`/news/${p.slug || p._id}`} style={{ textDecoration: 'none' }}>
                        <Box display="flex" gap={2} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateX(4px)' } }}>
                          <LazyImage src={p.image} alt={p.title} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }} />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, mb: 0.5, color: '#333', '&:hover': { color: '#C9A063' } }}>
                              {p.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt)}</Typography>
                          </Box>
                        </Box>
                      </Link>
                    ))}
                  </Stack>
                </Box>
              );
            })}
            {/* Comments */}
            <Divider sx={{ my: 4 }} />
            <CommentSection targetType="News" targetId={post.slug || post._id} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
