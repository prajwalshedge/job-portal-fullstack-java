import api from './axios';

export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/resume/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getResume    = ()   => api.get('/resume');
export const deleteResume = ()   => api.delete('/resume');
