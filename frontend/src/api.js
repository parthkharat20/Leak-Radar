import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const analyzeText = async (raw_text, source_type = 'bank_statement') => {
  const response = await axios.post(`${API_BASE_URL}/analyze`, {
    raw_text,
    source_type,
  });
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const rescoreSubscriptions = async (subscriptions, inactive_merchants = []) => {
  const response = await axios.post(`${API_BASE_URL}/rescore`, {
    subscriptions,
    inactive_merchants,
  });
  return response.data;
};
