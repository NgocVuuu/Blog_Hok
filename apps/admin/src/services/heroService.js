import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllHeroes = async (params = {}, options = {}) => {
  const response = await axios.get(`${API_URL}/api/heroes`, {
    headers: getAuthHeader(),
    params,
    signal: options.signal
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : (Array.isArray(data) ? data : []);
};

// Fetch all heroes by paginating (respects server validation: limit <= 100)
export const getAllHeroesAll = async (params = {}, options = {}) => {
  const headers = getAuthHeader();
  const limit = Math.min(100, params.limit || 100);
  let page = params.page || 1;
  let all = [];
  // Safety cap to avoid infinite loop
  const MAX_PAGES = 50;
  for (let i = 0; i < MAX_PAGES; i++) {
    let response;
    try {
      response = await axios.get(`${API_URL}/api/heroes`, {
        headers,
        params: { ...params, page, limit },
        signal: options.signal
      });
    } catch (err) {
      // Abort: rethrow silently
      if (options.signal && options.signal.aborted) throw err;
      // Retry once on 429 respecting Retry-After
      const status = err?.response?.status;
      if (status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfter || '1', 10) || 1;
        await new Promise(res => setTimeout(res, retryAfter * 1000));
        response = await axios.get(`${API_URL}/api/heroes`, {
          headers,
          params: { ...params, page, limit },
          signal: options.signal
        });
      } else {
        throw err;
      }
    }
    const payload = response.data;
    const list = payload && payload.success ? payload.data : (Array.isArray(payload) ? payload : []);
    all = all.concat(list);
    const hasNext = payload && payload.pagination && payload.pagination.hasNextPage;
    if (!hasNext) break;
    page = (payload.pagination.currentPage || page) + 1;
  }
  return all;
};

export const getHeroById = async (id, options = {}) => {
  const response = await axios.get(`${API_URL}/api/heroes/${id}`, {
    headers: getAuthHeader(),
    signal: options.signal
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : data;
};

export const createHero = async (heroData, options = {}) => {
  const response = await axios.post(`${API_URL}/api/heroes`, heroData, {
    headers: getAuthHeader(),
    signal: options.signal
  });
  return response.data;
};

export const updateHero = async (id, heroData, options = {}) => {
  const response = await axios.put(`${API_URL}/api/heroes/${id}`, heroData, {
    headers: getAuthHeader(),
    signal: options.signal
  });
  return response.data;
};

export const deleteHero = async (id, options = {}) => {
  const response = await axios.delete(`${API_URL}/api/heroes/${id}`, {
    headers: getAuthHeader(),
    signal: options.signal
  });
  return response.data;
};

export const getHeroByName = async (name, options = {}) => {
  const response = await axios.get(`${API_URL}/api/heroes/name/${name}`, {
    headers: getAuthHeader(),
    signal: options.signal
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : data;
};