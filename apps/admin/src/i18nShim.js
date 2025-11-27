// Lightweight shim for useTranslation to avoid importing directly from node_modules
// Returns a simple `t` function that falls back to provided defaultValue or the key.
export function useTranslation() {
  return {
    t: (key, opts) => {
      // Support two common call forms:
      // t('some.key', 'fallback string')
      // t('some.key', { defaultValue: 'fallback string' })
      if (typeof opts === 'string' && opts) return opts;
      if (opts && typeof opts === 'object' && 'defaultValue' in opts && opts.defaultValue) return opts.defaultValue;
      // When no fallback provided, return the key so callers still see something identifiable
      if (typeof key === 'string') return key;
      return '';
    }
  };
}

export default useTranslation;
