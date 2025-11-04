# Components Structure

Tất cả các components đã được tổ chức vào các folder riêng biệt theo pattern:

```
components/
├── index.ts                    # Central export point
├── ClientProviders.tsx         # MUI + i18n providers
├── I18nProvider.tsx           # i18n wrapper
│
├── Navbar/                    # Navigation bar
│   ├── index.tsx
│   ├── Navbar.css
│   └── README.md
│
├── Footer/                    # Footer component
│   ├── index.tsx
│   └── README.md
│
├── Banner/                    # Homepage banner
│   ├── index.tsx
│   └── README.md
│
├── HeroMetaPanel/            # Hero meta information panel
│   └── index.tsx
│
├── HomeSearch/               # Search bar for homepage
│   └── index.tsx
│
├── PatchHighlights/          # Patch notes highlights
│   └── index.tsx
│
├── QuickLinks/               # Quick navigation links
│   └── index.tsx
│
├── SpecialTrending/          # Trending heroes/items
│   └── index.tsx
│
├── TopCounters/              # Counter picks display
│   └── index.tsx
│
├── LazyImage/                # Optimized image component
│   ├── index.tsx
│   └── README.md
│
└── SectionUnderline/         # Decorative underline
    ├── index.tsx
    └── README.md
```

## Import Patterns

### Option 1: Direct import from folder
```tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
```

### Option 2: Named import from index (recommended)
```tsx
import { Navbar, Footer, Banner } from '@/components';
```

## Component Categories

### Layout Components
- **Navbar**: Main navigation with responsive menu
- **Footer**: Site footer with links and info

### Feature Components
- **Banner**: Homepage hero banner
- **HeroMetaPanel**: Display hero meta information
- **HomeSearch**: Search functionality
- **PatchHighlights**: Show patch note highlights
- **QuickLinks**: Quick navigation shortcuts
- **SpecialTrending**: Trending content display
- **TopCounters**: Counter picks information

### UI Components
- **LazyImage**: Optimized image loading
- **SectionUnderline**: Decorative section divider

### Provider Components
- **ClientProviders**: Combines MUI theme + i18n
- **I18nProvider**: Internationalization wrapper

## Adding New Components

1. Create folder: `components/NewComponent/`
2. Add `index.tsx` with component code
3. Add CSS file if needed
4. Add README.md with documentation
5. Export in `components/index.ts`

```tsx
// components/index.ts
export { default as NewComponent } from './NewComponent';
```
