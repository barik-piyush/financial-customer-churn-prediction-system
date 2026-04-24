import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:2005/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const getProfile = () => API.get('/auth/profile');
export const getAllUsers = () => API.get('/auth/users');
export const getChurnDistribution = () => API.get('/predictions/churn-distribution');

// Admin APIs
export const approveUser = (userId) => API.patch(`/admin/approve/${userId}`);
export const getAdminAnalytics = (range = '7d') => API.get(`/admin/analytics?range=${range}`);
export const getAdminLogs = (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.level) searchParams.set('level', params.level);
  if (params.search) searchParams.set('search', params.search);
  if (params.limit) searchParams.set('limit', String(params.limit));
  return API.get(`/admin/logs?${searchParams.toString()}`);
};

export const updateAdminProfile = (payload) => API.put('/admin/profile', payload);
export const changeAdminPassword = (payload) => API.patch('/admin/change-password', payload);
export const logoutAllDevices = () => API.post('/admin/logout-all');

export const updateUserStatus = (userId, isActive) =>
  API.patch(`/admin/users/${userId}/status`, { isActive });
export const deleteUser = (userId) => API.delete(`/admin/users/${userId}`);
export const resetUserPassword = (userId, newPassword) =>
  API.patch(`/admin/users/${userId}/reset-password`, { newPassword });
export const assignUserRole = (userId, accessRole) =>
  API.patch(`/admin/users/${userId}/role`, { accessRole });

export const predictSingleChurn = (customerData) => API.post('/predictions/single', customerData);

// ADMIN ML APIs
export const adminUploadDataset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/ml/admin/upload-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const adminTrainModel = (filename) =>
  API.post('/ml/admin/train-model', { filename });

export const adminBatchPredict = (filename) =>
  API.post('/ml/admin/batch-predict', { filename });

export const adminPredictionSummary = (filename) =>
  API.post('/ml/admin/prediction-summary', { filename });

export const getAdminModelStatus = () =>
  API.get('/ml/admin/status');

// BANK ML APIs
export const bankSinglePredict = (customerData) =>
  API.post('/ml/prediction/single', customerData);

export const bankBatchPredict = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/ml/prediction/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getBankPredictionHistory = (limit = 50) =>
  API.get(`/ml/prediction/history?limit=${limit}`);
