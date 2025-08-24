import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

export const getSpecialTrending = async (options = {}) => {
  try {
    const res = await axios.get(`${API_URL}/api/meta/special-trending`, { signal: options.signal });
    const data = res.data;
    if (data && data.success) return data;
    // fallback shape
    return { success: true, window: { id: 'unknown' }, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    if (options.signal && options.signal.aborted) throw err;
    if (err?.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfter || '1', 10) || 1;
      await new Promise(res => setTimeout(res, retryAfter * 1000));
      const res2 = await axios.get(`${API_URL}/api/meta/special-trending`, { signal: options.signal });
      const data2 = res2.data;
      if (data2 && data2.success) return data2;
      return { success: true, window: { id: 'unknown' }, data: Array.isArray(data2) ? data2 : [] };
    }
    throw err;
  }
};
