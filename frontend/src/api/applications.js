import api from './axios';

export const applyToJob        = (jobId, data) => api.post(`/jobs/${jobId}/apply`, data);
export const getMyApplications = ()            => api.get('/applications/my');
export const getJobApplications= (jobId)       => api.get(`/jobs/${jobId}/applications`);
export const updateStatus      = (id, status)  => api.patch(`/applications/${id}/status`, { status });
