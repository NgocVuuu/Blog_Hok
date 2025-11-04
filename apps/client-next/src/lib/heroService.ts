import axios from 'axios';

// API URL from environment - same as CRA approach
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

// In-memory cache for heroes data with request deduplication
let heroesCache: any[] | null = null;
let cacheTimestamp: number | null = null;
let ongoingRequest: Promise<any[]> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all heroes - SIMPLIFIED: Database has ~60 heroes, no pagination needed
// Using direct API call like CRA (not through Next.js proxy)
export const getAllHeroesAll = async (params: any = {}, options: any = {}) => {
  // Check cache first
  if (heroesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    // Silent return from cache
    return heroesCache;
  }

  // If there's an ongoing request, wait for it instead of creating a new one
  // This prevents React StrictMode from creating duplicate requests
  if (ongoingRequest) {
    // Silent wait
    return ongoingRequest;
  }

  // Create new request
  ongoingRequest = fetchHeroesInternal(params, options);
  
  try {
    const result = await ongoingRequest;
    return result;
  } finally {
    ongoingRequest = null;
  }
};

// Internal fetch function - SINGLE REQUEST with high limit
// Direct API call like CRA: ${API_URL}/api/heroes
const fetchHeroesInternal = async (params: any = {}, options: any = {}) => {
  try {
    // Fetch all heroes in one request (database has ~60 heroes total)
    const response = await axios.get(`${API_URL}/api/heroes`, {
      params: { 
        ...params, 
        page: 1, 
        limit: 100, // Server max is 100, we have ~60 heroes
        sort: params.sort || 'name' 
      },
      signal: options.signal
    });
    
    const payload = response.data;
    const list = payload && payload.success ? payload.data : (Array.isArray(payload) ? payload : []);
    
    // Update cache (silent)
    heroesCache = list;
    cacheTimestamp = Date.now();
    
    return list;
  } catch (err: any) {
    // Abort: rethrow silently (user navigated away)
    if (options.signal?.aborted || err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      throw err; // Silent abort
    }
    
    // Handle rate limit with retry
    const status = err?.response?.status;
    if (status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfter || '1', 10) || 1;
      console.log(`⚠️ Rate limited, waiting ${retryAfter}s before retry...`);
      
      // If retryAfter is too long (>30s), just throw the error
      if (retryAfter > 30) {
        console.error('❌ Rate limit retry time too long:', retryAfter);
        throw err;
      }
      
      await new Promise(res => setTimeout(res, retryAfter * 1000));
      
      // Retry once (check abort signal before retry)
      if (options.signal?.aborted) throw new Error('Aborted during retry wait');
      
      try {
        const response = await axios.get(`${API_URL}/api/heroes`, {
          params: { ...params, page: 1, limit: 100, sort: params.sort || 'name' },
          signal: options.signal
        });
        const payload = response.data;
        const list = payload && payload.success ? payload.data : (Array.isArray(payload) ? payload : []);
        
        // Update cache
        heroesCache = list;
        cacheTimestamp = Date.now();
        
        return list;
      } catch (retryErr: any) {
        console.error('❌ Retry failed:', retryErr.message);
        throw retryErr;
      }
    }
    
    console.error('❌ Error fetching heroes:', err.message);
    throw err;
  }
};

// Clear cache (useful for admin operations)
export const clearHeroesCache = () => {
  heroesCache = null;
  cacheTimestamp = null;
  ongoingRequest = null;
  console.log('🗑️ Heroes cache cleared');
};
