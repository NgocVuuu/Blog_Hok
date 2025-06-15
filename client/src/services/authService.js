import axios from 'axios';

const API_URL = '/api/auth';

export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/login`, credentials);
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`);
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${API_URL}/logout`);
  return res.data;
}; 