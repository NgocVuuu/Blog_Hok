import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
const API_URL = `${API_BASE_URL}/api/auth`;

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