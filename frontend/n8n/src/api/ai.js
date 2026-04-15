import api from './axios.js'

export const generateWorkflow = (prompt, save = false) =>
  api.post('/ai/generate-workflow', { prompt, save })