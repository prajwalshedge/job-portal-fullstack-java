import api from './axios';

export const getAnalytics  = ()   => api.get('/admin/analytics');
export const getAdminUsers = ()   => api.get('/admin/users');
export const deleteUser    = (id) => api.delete(`/admin/users/${id}`);
export const getAdminJobs  = ()   => api.get('/admin/jobs');
export const deleteAdminJob= (id) => api.delete(`/admin/jobs/${id}`);
