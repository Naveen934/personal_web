import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Companies
export const getCompanies = () => api.get('/companies/').then(r => r.data);
export const getCompany = (id) => api.get(`/companies/${id}`).then(r => r.data);
export const createCompany = (data) => api.post('/companies/', data).then(r => r.data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);

// Savings
export const getSavings = () => api.get('/savings/').then(r => r.data);
export const createSaving = (data) => api.post('/savings/', data).then(r => r.data);
export const deleteSaving = (id) => api.delete(`/savings/${id}`);

// Economy
export const getEconomy = () => api.get('/economy/').then(r => r.data);
export const createEconomy = (data) => api.post('/economy/', data).then(r => r.data);
export const deleteEconomy = (id) => api.delete(`/economy/${id}`);

// Documents
export const getDocuments = () => api.get('/documents/').then(r => r.data);
export const createDocument = (data) => api.post('/documents/', data).then(r => r.data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data).then(r => r.data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
