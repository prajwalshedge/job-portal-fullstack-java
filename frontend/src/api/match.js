import api from './axios';

export const getRankedCandidates = (jobId) => api.get(`/match/job/${jobId}/candidates`);
export const getMyMatchScore     = (jobId) => api.get(`/match/job/${jobId}/my-score`);
export const recomputeScores     = (jobId) => api.post(`/match/job/${jobId}/recompute`);
