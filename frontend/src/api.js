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

export const getSubscriptions = async () => {
  const response = await axios.get(`${API_BASE_URL}/subscriptions`);
  return response.data;
};

export const updateSubscription = async (subId, action) => {
  const response = await axios.patch(`${API_BASE_URL}/subscriptions/${subId}`, {
    action,
  });
  return response.data;
};

export const draftCancellationEmail = async (subId) => {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/${subId}/draft-cancellation`);
  return response.data;
};

export const sendCancellationEmail = async (subId, payload) => {
  const response = await axios.post(`${API_BASE_URL}/subscriptions/${subId}/send-cancellation`, payload);
  return response.data;
};

export const getDowngradeOptions = async (subId) => {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/${subId}/downgrade-options`);
  return response.data;
};

export const applyDowngrade = async (subId, payload) => {
  const response = await axios.patch(`${API_BASE_URL}/subscriptions/${subId}/apply-downgrade`, payload);
  return response.data;
};
