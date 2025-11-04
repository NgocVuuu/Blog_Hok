# SEO & Performance Optimization Guide

This document outlines all SEO and performance enhancements implemented in BlogHok.

## 🎯 SEO Enhancements

### 1. Structured Data (JSON-LD Schemas)

#### Heroes Detail Pages (`/heroes/[slug]`)
- ✅ **Article Schema**: Main content markup
- ✅ **BreadcrumbList Schema**: Navigation breadcrumbs (Home → Heroes → {Hero})
- ✅ **FAQ Schema**: 4 common questions with dynamic answers:
  - What is the best build for {hero}?
  - What are {hero}'s best arcana?
  - What is {hero}'s win rate?
  - How to counter {hero}?

#### News Detail Pages (`/news/[slug]`)
- ✅ **NewsArticle Schema**: Article metadata with author, dates, publisher
- ✅ **BreadcrumbList Schema**: Navigation (Home → News → {Article})

### 2. Hreflang Tags (Multilingual SEO)
All detail pages now include language alternatives:
- `en` - English
- `vi` - Vietnamese (Tiếng Việt)
- `id` - Indonesian (Bahasa Indonesia)
- `zh` - Chinese (中文)

Example: `/heroes/diaochan?lang=vi`

### 3. Meta Tags & Open Graph
- ✅ Dynamic title, description, keywords
- ✅ Open Graph for social media sharing
- ✅ Twitter Card optimization
- ✅ Canonical URLs to prevent duplicate content
- ✅ Robots directives for search engines

### 4. Google Search Console Integration
Set your verification code in `.env`:
```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code-here
```

## 📊 Analytics & Tracking

### Google Analytics 4 (GA4)

**Setup:**
1. Get your Measurement ID from [Google Analytics](https://analytics.google.com)
2. Add to `.env`:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Features:**
- ✅ Automatic page view tracking
- ✅ Core Web Vitals monitoring (LCP, FID, CLS)
- ✅ Custom event tracking utilities

**Available Event Trackers:**
```typescript
import { 
  trackHeroView, 
  trackNewsView, 
  trackSearch, 
  trackShare 
} from '@/lib/analytics';

// Track hero views
trackHeroView('Diao Chan', 'diaochan');

// Track article views
trackNewsView('New Hero Release', 'Patch Notes');

// Track searches
trackSearch('best mage', 15);

// Track social shares
trackShare('twitter', 'hero', 'diaochan');
```

## ⚡ Performance Optimizations

### 1. Bundle Analyzer

**Analyze bundle sizes:**
```bash
npm run analyze
```

This will:
- Generate interactive bundle visualization
- Identify large dependencies
- Open report in browser automatically

### 2. ISR (Incremental Static Regeneration)

**Cache Strategies:**
- Heroes detail: 3600s (1 hour)
- Heroes lists: 1800s (30 minutes)
- News detail: 1800s (30 minutes)
- News lists: 600s (10 minutes)

### 3. Performance Monitoring

**Web Vitals tracked:**
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1

All metrics are automatically sent to Google Analytics.

### 4. Image Optimization

**Current Setup:**
- Next.js Image component for automatic optimization
- Cloudinary CDN for remote images
- WebP format with fallbacks

**Recommended Additions:**
```tsx
import Image from 'next/image';

<Image
  src={hero.image}
  alt={hero.name}
  width={400}
  height={250}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  loading="lazy"
/>
```

## 🚀 Deployment Checklist

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# Required
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_BASE_URL=https://bloghok.com

# Analytics (Recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Search Console (Recommended)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### Pre-Deploy Steps
1. ✅ Build successfully: `npm run build`
2. ✅ Check bundle size: `npm run analyze`
3. ✅ Verify SEO schemas: [Google Rich Results Test](https://search.google.com/test/rich-results)
4. ✅ Test hreflang tags: [Hreflang Tags Testing Tool](https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/)
5. ✅ Validate metadata: [OpenGraph Debugger](https://www.opengraph.xyz/)

### Post-Deploy Steps
1. Submit sitemap to Google Search Console: `https://bloghok.com/sitemap.xml`
2. Submit to Bing Webmaster Tools
3. Verify Google Analytics is receiving data
4. Monitor Core Web Vitals in Search Console
5. Check indexed pages after 1 week

## 📈 SEO Performance Tracking

### Google Search Console
Monitor these metrics weekly:
- Total clicks and impressions
- Average CTR (Click-Through Rate)
- Average position
- Core Web Vitals (LCP, FID, CLS)
- Mobile usability issues

### Rich Results
Check if your pages appear with:
- ⭐ FAQ rich results
- 🍞 Breadcrumb navigation
- 📰 Article cards with images
- 🌐 Multilingual sitelinks

### Tools for Validation
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

## 🔧 Advanced Optimizations (Future)

### Recommended Next Steps:
1. **Lazy Load Swiper**: Dynamic imports for slider components
2. **Image Blur Placeholders**: Generate blur data URLs
3. **Service Worker**: Offline functionality
4. **Preload Critical Resources**: Font preloading
5. **Code Splitting**: Route-based chunking
6. **CDN Configuration**: Edge caching rules

### Example: Lazy Loading Swiper
```typescript
import dynamic from 'next/dynamic';

const Swiper = dynamic(() => import('swiper/react'), {
  ssr: false,
  loading: () => <div>Loading slider...</div>
});
```

## 📝 Maintenance

### Monthly Tasks:
- Review Google Analytics reports
- Check Search Console for errors
- Update outdated content
- Verify broken links
- Monitor page speed scores

### Quarterly Tasks:
- Audit structured data schemas
- Review and update keywords
- Analyze competitor SEO
- Update hreflang tags if new languages added

## 🆘 Troubleshooting

### Schemas Not Appearing in Google
- Wait 1-2 weeks after deployment
- Use [Rich Results Test](https://search.google.com/test/rich-results)
- Check for JSON-LD syntax errors
- Verify robots.txt allows indexing

### Analytics Not Tracking
1. Check GA Measurement ID is correct
2. Verify environment variable is set
3. Check browser console for errors
4. Disable ad blockers for testing
5. Use GA DebugView for real-time testing

### Hreflang Issues
- Ensure all language versions return 200 status
- Verify bidirectional links (if A links to B, B should link to A)
- Use absolute URLs, not relative paths

## 📚 Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
