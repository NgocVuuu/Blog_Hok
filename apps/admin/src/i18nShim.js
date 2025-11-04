// Lightweight shim for useTranslation to avoid importing directly from node_modules
// Returns a simple `t` function that falls back to provided defaultValue or the key.
export function useTranslation() {
  return {
    t: (key, opts) => {
      if (opts && typeof opts === 'object' && 'defaultValue' in opts && opts.defaultValue) return opts.defaultValue;
      if (typeof key === 'string') return key;
      return '';
    }
  };
}

export default useTranslation;
