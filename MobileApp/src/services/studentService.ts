import api from './api';

export interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  section: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  admissionDate: string;
  status: string;
}

export const studentService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (data: Partial<Student>) => {
    const response = await api.post('/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Student>) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};
