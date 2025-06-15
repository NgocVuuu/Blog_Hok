import axios from 'axios';

const API_URL = '/api/equipment';

export const getEquipment = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getEquipmentById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createEquipment = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateEquipment = async (id, data) => {
  const res = await axios.patch(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteEquipment = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
