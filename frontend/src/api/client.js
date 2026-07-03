import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.data && err.response.data.detail) {
      return Promise.reject(new Error(err.response.data.detail))
    }
    return Promise.reject(err)
  }
)

export const getDashboardSummary = () => api.get('/dashboard/summary').then(r=>r.data)
export const getMonthlyTrends = () => api.get('/dashboard/monthly-trends').then(r=>r.data)

export const getDailyLogs = () => api.get('/daily-logs').then(r=>r.data)
export const postDailyLog = (payload) => api.post('/daily-logs', payload).then(r=>r.data)
export const deleteDailyLog = (id) => api.delete(`/daily-logs/${id}`).then(r=>r.data)

export const getInventory = () => api.get('/inventory').then(r=>r.data)
export const postInventory = (payload) => api.post('/inventory', payload).then(r=>r.data)
export const putInventoryDelta = (id, delta) => api.put(`/inventory/${id}?quantity_delta=${delta}`).then(r=>r.data)
export const deleteInventory = (id) => api.delete(`/inventory/${id}`).then(r=>r.data)

export default api
