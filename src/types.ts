export type Role = 'admin' | 'teacher' | 'parent';

export interface User {
  id: number;
  username: string;
  role: Role;
  full_name: string;
  email?: string;
}

export interface Student {
  id: number;
  full_name: string;
  roll_number: string;
  class_id: number;
  class_name?: string;
  parent_id: number;
  parent_phone?: string;
  attendance_percentage: number;
  created_at: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  subject: string;
  phone: string;
  class_id: number;
  class_name?: string;
}

export interface AttendanceRecord {
  student_id: number;
  full_name: string;
  roll_number: string;
  status: 'Present' | 'Absent' | 'Late' | 'Unconfirmed' | null;
  time: string | null;
  date: string | null;
  method?: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface Mark {
  id: number;
  student_id: number;
  student_name?: string;
  subject: string;
  marks: number;
  max_marks: number;
  exam_name: string;
  date: string;
}

export interface LeaveRequest {
  id: number;
  parent_id: number;
  student_id: number;
  student_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  created_at: string;
}

export interface TimetableSlot {
  id: number;
  class_id: number;
  class_name?: string;
  day: string;
  period: number;
  subject: string;
  teacher_id: number;
  teacher_subject?: string;
  start_time: string;
  end_time: string;
}

export interface AnticheatLog {
  id: number;
  student_id: number;
  type: string;
  evidence_path: string;
  confidence: number;
  created_at: string;
}

export interface SMSLog {
  id: number;
  phone: string;
  event_type: string;
  sms_status: string;
  created_at: string;
}

export interface UserStats {
  totalStudents: { count: number };
  totalTeachers: { count: number };
  presentToday: { count: number };
  absentToday: { count: number };
  lateToday: { count: number };
  lowAttendance: { count: number };
  recentSMS: SMSLog[];
}
