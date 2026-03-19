import api from './axios';

export const getAllJobs    = ()       => api.get('/jobs');
export const getJobById   = (id)     => api.get(`/jobs/${id}`);
export const filterJobs   = (params) => api.get('/jobs/filter', { params });
export const getMyJobs    = ()       => api.get('/jobs/my');
export const createJob    = (data)   => api.post('/jobs', data);
export const updateJob    = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob    = (id)     => api.delete(`/jobs/${id}`);
