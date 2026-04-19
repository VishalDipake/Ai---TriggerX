import api from './axios.js'

export const getExecutions = (workflowId, params) => api.get(`/executions/${workflowId}`, { params })
export const getExecution = (executionId) => api.get(`/executions/detail/${executionId}`)
export const triggerManual = (workflowId, data) => api.post(`/executions/${workflowId}/trigger`, data)