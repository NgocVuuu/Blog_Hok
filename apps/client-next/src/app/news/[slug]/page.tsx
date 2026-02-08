import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Typography } from '@mui/material';
import NewsDetailClient from '@/components/NewsDetailClient';

// Run this route on the Edge Runtime so Cloudflare Pages / Next-on-Pages can
// deploy it as an Edge function. See Next.js docs for more info.
export const runtime = 'edge';

type Props = { params: Promise<{ slug: string }> };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/api/news/slug/${slug}`, {
      next: { revalidate: 1800 } // Cache 30 min
    });

    if (!res.ok) return { title: 'Article Not Found' };

    const data = await res.json();
    const post = data.success ? data.data : data;

    const title = `${post.title} | BlogHok`;
    const description = post.summary || post.content?.substring(0, 160) || 'Read the latest Honor of Kings news, guides, and updates on BlogHok';
    const imageUrl = post.image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/og-default.jpg`;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/news/${slug}`;
    const publishedTime = post.publishedAt || post.createdAt;
    const modifiedTime = post.updatedAt || post.createdAt;

    return {
      title,
      description,
      keywords: post.keywords || [
        post.title,
        'Honor of Kings',
        'HoK news',
        post.category,
        'gaming news',
        'esports',
      ].filter(Boolean).join(', '),
      authors: [{ name: post.author || 'BlogHok' }],
      openGraph: {
        title,
        description,
        url,
        siteName: 'BlogHok',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: [post.author || 'BlogHok'],
        section: post.category,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@BlogHok',
      },
      alternates: {
        canonical: url,
        languages: {
          'en': `${url}?lang=en`,
          'vi': `${url}?lang=vi`,
          'id': `${url}?lang=id`,
          'zh': `${url}?lang=zh`,
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    return {
      title: 'News Article | BlogHok',
      description: 'Read the latest Honor of Kings news and updates',
    };
  }
}

export default async function PostDetail({ params }: Props) {
  const { slug } = await params;

  let post: any = null;
  let relatedPosts: any[] = [];
  let sameCategoryPosts: any[] = [];
  let featuredPosts: any[] = [];
  let prevPost: any = null;
  let nextPost: any = null;
  let error: string | null = null;
  let categoryLists: Record<string, any[]> = {};

  try {
    // Fetch main post with caching
    const res = await fetch(`${API_URL}/api/news/slug/${slug}`, {
      next: { revalidate: 1800 } // Cache 30 min
    });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    post = data.success ? data.data : data;

    // Fetch all posts for related content with caching (increased limit to fill sidebars)
    const allRes = await fetch(`${API_URL}/api/news?limit=100`, {
      next: { revalidate: 600 } // Cache 10 min
    });
    if (allRes.ok) {
      const response = await allRes.json();
      const allPosts = response.success ? response.data : (Array.isArray(response) ? response : []);

      // Category specific lists
      const categories = ['news', 'guides', 'esports', 'updates'];
      // categoryLists is already defined in outer scope

      categories.forEach(cat => {
        categoryLists[cat] = allPosts
          .filter((p: any) => p.category === cat && p._id !== post._id)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
      });

      // Same category posts (Related)
      sameCategoryPosts = categoryLists[post.category] || [];

      // Calculate Previous and Next posts
      // Sort all posts by date descending
      const sortedPosts = allPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const currentIndex = sortedPosts.findIndex((p: any) => p._id === post._id);

      if (currentIndex !== -1) {
        // Next post (newer) is at index - 1
        if (currentIndex > 0) {
          nextPost = sortedPosts[currentIndex - 1];
        }
        // Previous post (older) is at index + 1
        if (currentIndex < sortedPosts.length - 1) {
          prevPost = sortedPosts[currentIndex + 1];
        }
      }
    }
  } catch (err: any) {
    error = err.message;
    console.error("Error fetching post:", err);
  }

  if (error) return <Typography color="error" align="center" sx={{ mt: 6 }}>An error occurred</Typography>;
  if (!post) notFound();

  return (
    <>
      {/* JSON-LD Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": post.title,
            "description": post.summary || post.content?.substring(0, 160),
            "image": post.image?.startsWith('http') ? post.image : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}${post.image}`,
            "datePublished": post.publishedAt || post.createdAt,
            "dateModified": post.updatedAt || post.createdAt,
            "author": {
              "@type": "Person",
              "name": post.author || "BlogHok",
              "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'
            },
            "publisher": {
              "@type": "Organization",
              "name": "BlogHok",
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/news/${slug}`
            },
            "articleSection": post.category,
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "News",
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/news`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/news/${slug}`
              }
            ]
          })
        }}
      />

      <NewsDetailClient
        post={post}
        sameCategoryPosts={sameCategoryPosts}
        featuredPosts={featuredPosts}
        relatedPosts={relatedPosts}
        prevPost={prevPost}
        nextPost={nextPost}
        categoryLists={categoryLists}
      />
    </>
  );
}
