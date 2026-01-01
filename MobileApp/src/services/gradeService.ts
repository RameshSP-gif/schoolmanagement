import api from './api';

export interface Grade {
  _id: string;
  studentId: string;
  subject: string;
  examType: string;
  marks: number;
  totalMarks: number;
  grade: string;
  date: string;
  remarks?: string;
}

export const gradeService = {
  getByStudent: async (studentId: string) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  },

  getByClass: async (classId: string) => {
    const response = await api.get(`/grades/class/${classId}`);
    return response.data;
  },

  create: async (data: Partial<Grade>) => {
    const response = await api.post('/grades', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Grade>) => {
    const response = await api.put(`/grades/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },
};
