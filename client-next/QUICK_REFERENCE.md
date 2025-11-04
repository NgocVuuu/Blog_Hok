# 🚀 Quick Reference - SEO & Performance

## ⚡ Lệnh Nhanh

```bash
# Build production
npm run build

# Kiểm tra SEO (100% validation)
npm run validate:seo

# Phân tích bundle size
npm run analyze

# Development
npm run dev
```

## 🔑 Biến Môi Trường Quan Trọng

```env
# API
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_BASE_URL=https://bloghok.com

# Google Analytics 4 (Recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Search Console (Recommended)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

## 📊 Structured Data Schemas

### Trang Tướng (`/heroes/[slug]`)
- ✅ Article Schema
- ✅ BreadcrumbList (Home → Heroes → {Hero})
- ✅ FAQ Schema (4 câu hỏi)
- ✅ Hreflang (en, vi, id, zh)

### Trang Tin Tức (`/news/[slug]`)
- ✅ NewsArticle Schema
- ✅ BreadcrumbList (Home → News → {Article})
- ✅ Hreflang (en, vi, id, zh)

## 📈 Analytics Tracking

```typescript
import {
  trackHeroView,
  trackNewsView,
  trackSearch,
  trackShare,
} from '@/lib/analytics';

// Ví dụ sử dụng
trackHeroView('Diao Chan', 'diaochan');
trackNewsView('Hero mới', 'Patch Notes');
trackSearch('mage mạnh', 15);
trackShare('twitter', 'hero', 'diaochan');
```

## 🎯 Core Web Vitals

Tự động theo dõi:
- **LCP** < 2.5s (Good)
- **FID** < 100ms (Good)
- **CLS** < 0.1 (Good)

## 🔍 Validation Tools

### Online Tools
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Hreflang Checker](https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/)

### Local Validation
```bash
npm run validate:seo
```

## 📚 Tài Liệu

1. **SEO_GUIDE.md** - Hướng dẫn đầy đủ
2. **PERFORMANCE_CHECKLIST.md** - Checklist tối ưu
3. **SUMMARY_VI.md** - Tổng kết tiếng Việt

## ✅ Deployment Checklist

- [ ] Copy `.env.example` → `.env.local`
- [ ] Điền GA4 Measurement ID
- [ ] Điền Search Console verification code
- [ ] Chạy `npm run build` (success)
- [ ] Chạy `npm run validate:seo` (100%)
- [ ] Deploy
- [ ] Gửi sitemap: `https://bloghok.com/sitemap.xml`
- [ ] Kiểm tra GA4 nhận data
- [ ] Theo dõi Search Console

## 🎊 Kết Quả

```
📈 SEO Score: 100%
✅ Build: Success (16.7s)
✅ Routes: 14 (2 dynamic with full SEO)
✅ Schemas: 3 types on heroes, 2 on news
✅ Languages: 4 (en, vi, id, zh)
✅ Analytics: GA4 + Web Vitals
```

---

**Status:** Production Ready 🚀  
**Version:** 1.0.0  
**Last Updated:** November 3, 2025
