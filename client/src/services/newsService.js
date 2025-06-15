import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
const API_URL = `${API_BASE_URL}/api/news`;

export const getNews = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getNewsById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createNews = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateNews = async (id, data) => {
  const res = await axios.patch(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteNews = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 