import createCache from '@emotion/cache';

// Client-side cache, shared for the whole session in the browser.
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}
