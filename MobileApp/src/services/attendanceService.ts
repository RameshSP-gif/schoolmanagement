import api from './api';

export interface Attendance {
  _id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export const attendanceService = {
  markAttendance: async (data: { classId: string; date: string; records: any[] }) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  getByClass: async (classId: string, date?: string) => {
    const url = date ? `/attendance/class/${classId}?date=${date}` : `/attendance/class/${classId}`;
    const response = await api.get(url);
    return response.data;
  },

  getByStudent: async (studentId: string, startDate?: string, endDate?: string) => {
    let url = `/attendance/student/${studentId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  updateAttendance: async (id: string, data: Partial<Attendance>) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },
};
