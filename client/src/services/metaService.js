import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

export const getSpecialTrending = async () => {
  const res = await axios.get(`${API_URL}/api/meta/special-trending`);
  const data = res.data;
  if (data && data.success) return data;
  // fallback shape
  return { success: true, window: { id: 'unknown' }, data: Array.isArray(data) ? data : [] };
};
