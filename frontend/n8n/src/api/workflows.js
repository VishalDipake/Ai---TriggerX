import api from './axios.js'

export const getWorkflows = (params) => api.get('/workflows', { params })
export const getWorkflow = (id) => api.get(`/workflows/${id}`)
export const createWorkflow = (data) => api.post('/workflows', data)
export const updateWorkflow = (id, data) => api.put(`/workflows/${id}`, data)
export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`)