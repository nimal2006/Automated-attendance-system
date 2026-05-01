import { Mark, LeaveRequest, TimetableSlot, AnticheatLog } from '../types';

const API_BASE = '/api';

async function fetcher<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  login: (credentials: any) => fetcher('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getStats: () => fetcher('/admin/stats'),
  getStudents: () => fetcher('/students'),
  getStudentProfile: (id: number | string) => fetcher(`/students/${id}/profile`),
  getTeachers: () => fetcher('/teachers'),
  getAttendance: (date: string, classId?: string) => fetcher(`/attendance?date=${date}${classId ? `&classId=${classId}` : ''}`),
  updateAttendance: (data: any) => fetcher('/attendance/update-status', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => fetcher('/notifications'),
  getParentChildData: () => fetcher('/parent/child-data'),
  
  // Marks
  getMarks: (studentId?: number) => 
    fetcher<Mark[]>(`/marks${studentId ? `?studentId=${studentId}` : ''}`),

  // Leave Requests
  getLeaves: () => 
    fetcher<LeaveRequest[]>('/leaves'),
  
  createLeave: (data: Partial<LeaveRequest>) => 
    fetcher<{ success: boolean }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Timetable
  getTimetable: (params: { classId?: number; teacherId?: number }) => {
    const search = new URLSearchParams(params as any).toString();
    return fetcher<TimetableSlot[]>(`/timetable?${search}`);
  },

  // Face Recognition
  verifyFace: (data: { frames: string[]; location?: any }) => 
    fetcher<{ 
      success: boolean; 
      student_id?: number; 
      full_name?: string; 
      confidence?: number; 
      error?: string;
      sms_status?: string;
    }>('/face-recognition/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAnticheatLogs: () => 
    fetcher<AnticheatLog[]>('/face-recognition/anticheat/logs'),
  
  logAnticheat: (data: Partial<AnticheatLog>) => 
    fetcher<{ success: boolean }>('/face-recognition/anticheat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  trainFace: (data: { student_id: number; images: string[] }) =>
    fetcher<{ success: boolean; message: string }>('/face-recognition/train', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
