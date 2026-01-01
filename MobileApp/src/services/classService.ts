import api from './api';

export interface Class {
  _id: string;
  name: string;
  section: string;
  teacher: string;
  students: string[];
  subjects: string[];
  schedule: any;
  capacity: number;
}

export const classService = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (data: Partial<Class>) => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Class>) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};
