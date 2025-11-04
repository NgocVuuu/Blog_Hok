import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HeroDetailClient from '@/components/HeroDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

type Props = { params: Promise<{ slug: string }> };

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${API_URL}/api/heroes/slug/${slug}`, { 
      next: { revalidate: 3600 } // Cache 1 hour
    });
    
    if (!res.ok) return { title: 'Hero Not Found' };
    
    const hero = await res.json();
    const heroName = hero.name || 'Unknown Hero';
    const title = `${heroName} - Build, Guide & Stats | BlogHok`;
    const description = `${heroName} ${hero.title || ''} guide for Honor of Kings. Best builds, arcana, skills, combos, win rate ${hero.winRate}%, tier ${hero.metaTier}. Complete ${heroName} strategy and tips.`;
    const imageUrl = hero.image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/og-default.jpg`;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/heroes/${slug}`;

    return {
      title,
      description,
      keywords: [
        heroName,
        'Honor of Kings',
        'HoK guide',
        'build',
        'arcana',
        'skills',
        'combos',
        hero.roles?.join(', '),
        hero.lanes?.join(', '),
        `${hero.metaTier} tier`
      ].filter(Boolean).join(', '),
      authors: [{ name: 'BlogHok' }],
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
            alt: `${heroName} - Honor of Kings Hero`,
          }
        ],
        locale: 'en_US',
        type: 'article',
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
      title: 'Hero Guide | BlogHok',
      description: 'Honor of Kings hero guide and strategy',
    };
  }
}

export default async function HeroDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch hero data with caching
  let hero: any = null;
  try {
    const res = await fetch(`${API_URL}/api/heroes/slug/${slug}`, { 
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) throw new Error('Hero not found');
    hero = await res.json();
  } catch (error) {
    console.error('Error fetching hero:', error);
    notFound();
  }

  if (!hero) notFound();

  // Fetch same-role heroes with caching
  let sameRoleHeroes: any[] = [];
  try {
    const primaryRole = hero.roles?.[0];
    if (primaryRole) {
      const res = await fetch(`${API_URL}/api/heroes?role=${encodeURIComponent(primaryRole)}&sort=winRate&limit=10`, { 
        next: { revalidate: 1800 } // Cache 30 min
      });
      const data = await res.json();
      const raw = data && data.success ? data.data : data;
      const heroList = Array.isArray(raw) ? raw : [];
      sameRoleHeroes = heroList.filter((h: any) => h && h.slug !== hero.slug);
    }
  } catch (error) {
    console.error('Error fetching same-role heroes:', error);
  }

  // Fetch top win-rate heroes with caching
  let topWinHeroes: any[] = [];
  try {
    const res = await fetch(`${API_URL}/api/heroes?sort=winRate&limit=10`, { 
      next: { revalidate: 1800 } // Cache 30 min
    });
    const data = await res.json();
    const raw = data && data.success ? data.data : data;
    const heroList = Array.isArray(raw) ? raw : [];
    topWinHeroes = heroList.filter((h: any) => h && h.slug !== hero.slug);
  } catch (error) {
    console.error('Error fetching top heroes:', error);
  }

  // Fetch latest news with caching
  let latestNews: any[] = [];
  try {
    const res = await fetch(`${API_URL}/api/news?sort=latest&limit=6`, { 
      next: { revalidate: 600 } // Cache 10 min
    });
    const data = await res.json();
    const raw = data && data.success ? data.data : data;
    latestNews = Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error('Error fetching news:', error);
  }

  return (
    <>
      {/* JSON-LD Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${hero.name} Guide - Honor of Kings`,
            "description": `Complete guide for ${hero.name} including best builds, arcana, skills, and strategies`,
            "image": hero.image,
            "author": {
              "@type": "Organization",
              "name": "BlogHok"
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
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/heroes/${slug}`
            },
            "datePublished": hero.createdAt || new Date().toISOString(),
            "dateModified": hero.updatedAt || new Date().toISOString(),
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
                "name": "Heroes",
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/heroes`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": hero.name,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com'}/heroes/${slug}`
              }
            ]
          })
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the best build for ${hero.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `The best build for ${hero.name} includes core items and arcana optimized for ${hero.roles?.join('/')} role. Check the recommended build section for detailed item progression and situational builds.`
                }
              },
              {
                "@type": "Question",
                "name": `What are ${hero.name}'s best arcana?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${hero.name} benefits from arcana that enhance ${hero.roles?.join('/')} capabilities. The recommended arcana set is shown in the build guide above.`
                }
              },
              {
                "@type": "Question",
                "name": `What is ${hero.name}'s win rate?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${hero.name} currently has a ${hero.winRate || 'N/A'}% win rate with a ${hero.metaTier || 'N/A'} tier ranking in the current meta.`
                }
              },
              {
                "@type": "Question",
                "name": `How to counter ${hero.name}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `To counter ${hero.name}, use heroes with strong crowd control or burst damage. Check the counters section for recommended counter picks.`
                }
              }
            ]
          })
        }}
      />
      
      <HeroDetailClient
        hero={hero}
        sameRoleHeroes={sameRoleHeroes}
        topWinHeroes={topWinHeroes}
        latestNews={latestNews}
      />
    </>
  );
}
