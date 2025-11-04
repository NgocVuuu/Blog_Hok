// Event tracking utilities for Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Generic event tracking
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Hero view tracking
export const trackHeroView = (heroName: string, slug: string) => {
  event({
    action: 'view_hero',
    category: 'Heroes',
    label: `${heroName} (${slug})`,
  });
};

// News view tracking
export const trackNewsView = (title: string, category: string) => {
  event({
    action: 'view_article',
    category: 'News',
    label: `${category}: ${title}`,
  });
};

// Search tracking
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Search',
    label: searchTerm,
    value: resultsCount,
  });
};

// Social share tracking
export const trackShare = (platform: string, contentType: string, contentId: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: `${platform} - ${contentType} - ${contentId}`,
  });
};

// Navigation tracking
export const trackNavigation = (from: string, to: string) => {
  event({
    action: 'navigate',
    category: 'Navigation',
    label: `${from} -> ${to}`,
  });
};

// Performance tracking
export const trackPerformance = (metric: string, value: number) => {
  event({
    action: 'performance',
    category: 'Web Vitals',
    label: metric,
    value: Math.round(value),
  });
};
