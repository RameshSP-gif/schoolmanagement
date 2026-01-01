import api from './api';

export interface Fee {
  _id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  category: string;
  description: string;
}

export const feeService = {
  getAll: async () => {
    const response = await api.get('/fees');
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },

  create: async (data: Partial<Fee>) => {
    const response = await api.post('/fees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Fee>) => {
    const response = await api.put(`/fees/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id: string) => {
    const response = await api.patch(`/fees/${id}/pay`);
    return response.data;
  },
};
