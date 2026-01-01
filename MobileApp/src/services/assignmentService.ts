import api from './api';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
  submissions?: Submission[];
}

export interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submittedDate: string;
  attachments: string[];
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'pending';
}

export const assignmentService = {
  getAll: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },

  getByClass: async (classId: string) => {
    const response = await api.get(`/assignments/class/${classId}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/assignments/student/${studentId}`);
    return response.data;
  },

  create: async (data: Partial<Assignment>) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Assignment>) => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  submitAssignment: async (assignmentId: string, data: any) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  gradeSubmission: async (submissionId: string, data: { marks: number; feedback: string }) => {
    const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },
};
