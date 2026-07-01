import api from './api'

export const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  getCompanies: () => api.get('/admin/companies').then((r) => r.data),
  getProducts: () => api.get('/admin/products').then((r) => r.data),
  createCompany: (payload) => api.post('/admin/companies', payload).then((r) => r.data),
  assignProduct: (companyId, payload) =>
    api.post(`/admin/companies/${companyId}/products`, payload).then((r) => r.data),
}