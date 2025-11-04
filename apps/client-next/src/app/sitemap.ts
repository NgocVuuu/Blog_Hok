import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bloghok.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const routes = [
    '',
    '/heroes',
    '/news',
    '/meta',
    '/arcana',
    '/equipment',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/news' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1 : route === '/heroes' || route === '/news' ? 0.9 : 0.7,
  }));

  // Dynamic hero pages
  let heroRoutes: MetadataRoute.Sitemap = [];
  try {
    const heroesRes = await fetch(`${API_URL}/api/heroes?limit=200`, {
      next: { revalidate: 86400 }, // Cache 24h
    });
    if (heroesRes.ok) {
      const heroesData = await heroesRes.json();
      const heroes = heroesData.success ? heroesData.data : (Array.isArray(heroesData) ? heroesData : []);
      heroRoutes = heroes.map((hero: any) => ({
        url: `${BASE_URL}/heroes/${hero.slug}`,
        lastModified: hero.updatedAt || new Date().toISOString(),
        changeFrequency: 'weekly' as any,
        priority: hero.metaTier === 'S' || hero.metaTier === 'A' ? 0.9 : 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching heroes for sitemap:', error);
  }

  // Dynamic news pages
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const newsRes = await fetch(`${API_URL}/api/news?limit=200`, {
      next: { revalidate: 3600 }, // Cache 1h
    });
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      const news = newsData.success ? newsData.data : (Array.isArray(newsData) ? newsData : []);
      newsRoutes = news.map((post: any) => ({
        url: `${BASE_URL}/news/${post.slug || post._id}`,
        lastModified: post.updatedAt || post.createdAt || new Date().toISOString(),
        changeFrequency: 'monthly' as any,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching news for sitemap:', error);
  }

  return [...routes, ...heroRoutes, ...newsRoutes];
}
