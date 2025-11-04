#!/usr/bin/env node

/**
 * SEO Validation Script
 * 
 * Checks if all SEO enhancements are properly configured
 * Run: node scripts/validate-seo.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating SEO Configuration...\n');

const errors = [];
const warnings = [];
const success = [];

// Check 1: Environment variables
console.log('1️⃣  Checking .env.example...');
const envExample = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID')) {
    success.push('.env.example contains GA4 configuration');
  } else {
    warnings.push('.env.example missing GA4 configuration');
  }
  if (envContent.includes('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION')) {
    success.push('.env.example contains Search Console configuration');
  } else {
    warnings.push('.env.example missing Search Console configuration');
  }
} else {
  errors.push('.env.example not found');
}

// Check 2: GoogleAnalytics component
console.log('2️⃣  Checking GoogleAnalytics component...');
const gaComponent = path.join(__dirname, '..', 'src', 'components', 'GoogleAnalytics.tsx');
if (fs.existsSync(gaComponent)) {
  const gaContent = fs.readFileSync(gaComponent, 'utf8');
  if (gaContent.includes('gtag')) {
    success.push('GoogleAnalytics component properly configured');
  } else {
    errors.push('GoogleAnalytics component missing gtag implementation');
  }
} else {
  errors.push('GoogleAnalytics component not found');
}

// Check 3: WebVitals component
console.log('3️⃣  Checking WebVitals component...');
const webVitals = path.join(__dirname, '..', 'src', 'components', 'WebVitals.tsx');
if (fs.existsSync(webVitals)) {
  const wvContent = fs.readFileSync(webVitals, 'utf8');
  if (wvContent.includes('PerformanceObserver') && wvContent.includes('LCP')) {
    success.push('WebVitals component tracking Core Web Vitals');
  } else {
    warnings.push('WebVitals component incomplete');
  }
} else {
  errors.push('WebVitals component not found');
}

// Check 4: Analytics utilities
console.log('4️⃣  Checking analytics utilities...');
const analytics = path.join(__dirname, '..', 'src', 'lib', 'analytics.ts');
if (fs.existsSync(analytics)) {
  const analyticsContent = fs.readFileSync(analytics, 'utf8');
  const requiredFunctions = ['trackHeroView', 'trackNewsView', 'trackSearch', 'trackShare'];
  const missingFunctions = requiredFunctions.filter(fn => !analyticsContent.includes(fn));
  
  if (missingFunctions.length === 0) {
    success.push('All analytics tracking functions present');
  } else {
    warnings.push(`Missing analytics functions: ${missingFunctions.join(', ')}`);
  }
} else {
  errors.push('Analytics utilities not found');
}

// Check 5: Hero detail page schemas
console.log('5️⃣  Checking hero detail page schemas...');
const heroPage = path.join(__dirname, '..', 'src', 'app', 'heroes', '[slug]', 'page.tsx');
if (fs.existsSync(heroPage)) {
  const heroContent = fs.readFileSync(heroPage, 'utf8');
  const schemas = {
    'Article': heroContent.includes('"@type": "Article"'),
    'BreadcrumbList': heroContent.includes('"@type": "BreadcrumbList"'),
    'FAQPage': heroContent.includes('"@type": "FAQPage"'),
  };
  
  Object.entries(schemas).forEach(([schema, exists]) => {
    if (exists) {
      success.push(`Hero pages have ${schema} schema`);
    } else {
      errors.push(`Hero pages missing ${schema} schema`);
    }
  });
  
  if (heroContent.includes('hreflang') || heroContent.includes('languages:')) {
    success.push('Hero pages have hreflang tags');
  } else {
    warnings.push('Hero pages missing hreflang tags');
  }
} else {
  errors.push('Hero detail page not found');
}

// Check 6: News detail page schemas
console.log('6️⃣  Checking news detail page schemas...');
const newsPage = path.join(__dirname, '..', 'src', 'app', 'news', '[slug]', 'page.tsx');
if (fs.existsSync(newsPage)) {
  const newsContent = fs.readFileSync(newsPage, 'utf8');
  const schemas = {
    'NewsArticle': newsContent.includes('"@type": "NewsArticle"'),
    'BreadcrumbList': newsContent.includes('"@type": "BreadcrumbList"'),
  };
  
  Object.entries(schemas).forEach(([schema, exists]) => {
    if (exists) {
      success.push(`News pages have ${schema} schema`);
    } else {
      errors.push(`News pages missing ${schema} schema`);
    }
  });
  
  if (newsContent.includes('hreflang') || newsContent.includes('languages:')) {
    success.push('News pages have hreflang tags');
  } else {
    warnings.push('News pages missing hreflang tags');
  }
} else {
  errors.push('News detail page not found');
}

// Check 7: Bundle analyzer
console.log('7️⃣  Checking bundle analyzer...');
const nextConfig = path.join(__dirname, '..', 'next.config.ts');
if (fs.existsSync(nextConfig)) {
  const configContent = fs.readFileSync(nextConfig, 'utf8');
  if (configContent.includes('@next/bundle-analyzer')) {
    success.push('Bundle analyzer configured');
  } else {
    warnings.push('Bundle analyzer not configured');
  }
} else {
  errors.push('next.config.ts not found');
}

// Check 8: Package.json scripts
console.log('8️⃣  Checking npm scripts...');
const packageJson = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  if (pkg.scripts && pkg.scripts.analyze) {
    success.push('Bundle analyze script available');
  } else {
    warnings.push('Bundle analyze script missing');
  }
} else {
  errors.push('package.json not found');
}

// Check 9: Layout integration
console.log('9️⃣  Checking layout integration...');
const layout = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
if (fs.existsSync(layout)) {
  const layoutContent = fs.readFileSync(layout, 'utf8');
  
  if (layoutContent.includes('GoogleAnalytics')) {
    success.push('GoogleAnalytics integrated in layout');
  } else {
    errors.push('GoogleAnalytics not integrated in layout');
  }
  
  if (layoutContent.includes('WebVitals')) {
    success.push('WebVitals integrated in layout');
  } else {
    warnings.push('WebVitals not integrated in layout');
  }
  
  if (layoutContent.includes('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION')) {
    success.push('Google Search Console verification configured');
  } else {
    warnings.push('Google Search Console verification not configured');
  }
} else {
  errors.push('layout.tsx not found');
}

// Check 10: Sitemap
console.log('🔟 Checking sitemap...');
const sitemap = path.join(__dirname, '..', 'src', 'app', 'sitemap.ts');
if (fs.existsSync(sitemap)) {
  const sitemapContent = fs.readFileSync(sitemap, 'utf8');
  if (sitemapContent.includes('heroes') && sitemapContent.includes('news')) {
    success.push('Sitemap includes dynamic routes');
  } else {
    warnings.push('Sitemap may be incomplete');
  }
} else {
  errors.push('sitemap.ts not found');
}

// Print Results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS\n');

if (success.length > 0) {
  console.log('✅ SUCCESS (' + success.length + ')');
  success.forEach(msg => console.log('   ✓ ' + msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (' + warnings.length + ')');
  warnings.forEach(msg => console.log('   ⚠ ' + msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (' + errors.length + ')');
  errors.forEach(msg => console.log('   ✗ ' + msg));
  console.log('');
}

console.log('='.repeat(60));
console.log('\n📈 SEO Score: ' + Math.round((success.length / (success.length + warnings.length + errors.length)) * 100) + '%');

if (errors.length > 0) {
  console.log('\n❌ Validation failed. Please fix the errors above.');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Validation passed with warnings. Consider addressing them.');
  process.exit(0);
} else {
  console.log('\n✅ All SEO checks passed! Your site is optimized.');
  process.exit(0);
}
