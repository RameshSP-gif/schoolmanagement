import api from './api';

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  subject: string;
  qualification: string;
  phone: string;
  address: string;
  dateOfJoining: string;
  salary: number;
  status: string;
}

export const teacherService = {
  getAll: async () => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Teacher>) => {
    const response = await api.post('/teachers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Teacher>) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
