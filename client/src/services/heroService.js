import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllHeroes = async () => {
  const response = await axios.get(`${API_URL}/api/heroes`, {
    headers: getAuthHeader()
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : (Array.isArray(data) ? data : []);
};

export const getHeroById = async (id) => {
  const response = await axios.get(`${API_URL}/api/heroes/${id}`, {
    headers: getAuthHeader()
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : data;
};

export const createHero = async (heroData) => {
  const response = await axios.post(`${API_URL}/api/heroes`, heroData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateHero = async (id, heroData) => {
  const response = await axios.put(`${API_URL}/api/heroes/${id}`, heroData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteHero = async (id) => {
  const response = await axios.delete(`${API_URL}/api/heroes/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getHeroByName = async (name) => {
  const response = await axios.get(`${API_URL}/api/heroes/name/${name}`, {
    headers: getAuthHeader()
  });
  // Handle new API response format
  const data = response.data;
  return data.success ? data.data : data;
};