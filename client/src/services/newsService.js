import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
const API_URL = `${API_BASE_URL}/api/news`;

export const getNews = async (options = {}) => {
  try {
    const res = await axios.get(API_URL, { signal: options.signal });
    return res.data;
  } catch (err) {
    if (options.signal && options.signal.aborted) throw err;
    if (err?.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfter || '1', 10) || 1;
      await new Promise(res => setTimeout(res, retryAfter * 1000));
      const res2 = await axios.get(API_URL, { signal: options.signal });
      return res2.data;
    }
    throw err;
  }
};

export const getNewsById = async (id, options = {}) => {
  const res = await axios.get(`${API_URL}/${id}`, { signal: options.signal });
  return res.data;
};

export const createNews = async (data, options = {}) => {
  const res = await axios.post(API_URL, data, { signal: options.signal });
  return res.data;
};

export const updateNews = async (id, data, options = {}) => {
  const res = await axios.patch(`${API_URL}/${id}`, data, { signal: options.signal });
  return res.data;
};

export const deleteNews = async (id, options = {}) => {
  const res = await axios.delete(`${API_URL}/${id}`, { signal: options.signal });
  return res.data;
}; 