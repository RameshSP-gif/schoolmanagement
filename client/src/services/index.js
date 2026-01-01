import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  }
};

export const studentService = {
  getAll: async (params) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getAttendance: async (id, params) => {
    const response = await api.get(`/students/${id}/attendance`, { params });
    return response.data;
  },

  getGrades: async (id) => {
    const response = await api.get(`/students/${id}/grades`);
    return response.data;
  },

  getAssignments: async (id) => {
    const response = await api.get(`/students/${id}/assignments`);
    return response.data;
  }
};

export const teacherService = {
  getAll: async (params) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (teacherData) => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  update: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  getClasses: async (id) => {
    const response = await api.get(`/teachers/${id}/classes`);
    return response.data;
  },

  getSubjects: async (id) => {
    const response = await api.get(`/teachers/${id}/subjects`);
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/teachers/${id}/schedule`);
    return response.data;
  }
};

export const classService = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  update: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  getStudents: async (id) => {
    const response = await api.get(`/classes/${id}/students`);
    return response.data;
  },

  getSubjects: async (id) => {
    const response = await api.get(`/classes/${id}/subjects`);
    return response.data;
  }
};

export const attendanceService = {
  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  mark: async (attendanceData) => {
    const response = await api.post('/attendance', { attendanceData });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  getStatistics: async (studentId, params) => {
    const response = await api.get(`/attendance/statistics/${studentId}`, { params });
    return response.data;
  }
};

export const assignmentService = {
  getAll: async (params) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  create: async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },

  update: async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  submit: async (id, submissionData) => {
    const response = await api.post(`/assignments/${id}/submit`, submissionData);
    return response.data;
  },

  grade: async (submissionId, marks) => {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, { marks_obtained: marks });
    return response.data;
  },

  getSubmissions: async (id) => {
    const response = await api.get(`/assignments/${id}/submissions`);
    return response.data;
  }
};

export const feeService = {
  getAll: async (params) => {
    const response = await api.get('/fees', { params });
    return response.data;
  },

  getStudentFees: async (studentId) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },

  create: async (feeData) => {
    const response = await api.post('/fees', feeData);
    return response.data;
  },

  update: async (id, feeData) => {
    const response = await api.put(`/fees/${id}`, feeData);
    return response.data;
  },

  recordPayment: async (id, paymentData) => {
    const response = await api.post(`/fees/${id}/pay`, paymentData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/fees/${id}/status`, { status });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/fees/statistics');
    return response.data;
  }
};

export const announcementService = {
  getAll: async (params) => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  create: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  update: async (id, announcementData) => {
    const response = await api.put(`/announcements/${id}`, announcementData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
};
