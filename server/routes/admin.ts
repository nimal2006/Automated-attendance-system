import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const [
      { count: totalStudents },
      { count: totalTeachers },
      { count: presentToday },
      { count: absentToday },
      { count: lateToday },
      { count: lowAttendanceCount },
      { data: recentSMS }
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('teachers').select('*', { count: 'exact', head: true }),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Present'),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Absent'),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Late'),
      supabase.from('students').select('*', { count: 'exact', head: true }).lt('attendance_percentage', 75),
      supabase.from('sms_logs').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const stats = {
      totalStudents: { count: totalStudents || 0 },
      totalTeachers: { count: totalTeachers || 0 },
      presentToday: { count: presentToday || 0 },
      absentToday: { count: absentToday || 0 },
      lateToday: { count: lateToday || 0 },
      lowAttendance: { count: lowAttendanceCount || 0 },
      recentSMS: recentSMS || []
    };
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/insights', authenticateToken, async (req, res) => {
  const threshold = 75;
  
  try {
    const { data: lowAttendanceData, error: attendanceError } = await supabase
      .from('students')
      .select(`
        full_name,
        attendance_percentage,
        classes:class_id(name),
        parents:parent_id(phone)
      `)
      .lt('attendance_percentage', threshold);

    if (attendanceError) throw attendanceError;

    const lowAttendance = lowAttendanceData.map(s => ({
      full_name: s.full_name,
      attendance_percentage: s.attendance_percentage,
      class_name: (s.classes as any)?.name,
      parent_phone: (s.parents as any)?.phone
    }));

    // For low performance, we'll fetch marks and students and aggregate
    const { data: marksData, error: marksError } = await supabase
      .from('marks')
      .select('student_id, marks, max_marks, students:student_id(full_name)');

    if (marksError) throw marksError;

    const studentStats: Record<number, { name: string; totalMarks: number; totalMax: number }> = {};
    marksData.forEach(m => {
      if (!studentStats[m.student_id]) {
        studentStats[m.student_id] = { name: (m.students as any)?.full_name, totalMarks: 0, totalMax: 0 };
      }
      studentStats[m.student_id].totalMarks += m.marks;
      studentStats[m.student_id].totalMax += m.max_marks;
    });

    const lowPerformance = Object.values(studentStats)
      .map(s => ({
        full_name: s.name,
        avg_score: (s.totalMax > 0 ? (s.totalMarks / s.totalMax) * 100 : 0)
      }))
      .filter(s => s.avg_score < 50);

    res.json({
      alerts: [
        ...lowAttendance.map((s: any) => ({
          type: 'Low Attendance',
          message: `${s.full_name} (${s.class_name}) is at ${Math.round(s.attendance_percentage)}%. Alert sent to ${s.parent_phone}.`,
          severity: 'high'
        })),
        ...lowPerformance.map((s: any) => ({
          type: 'Low Performance',
          message: `${s.full_name} has a critical average score of ${Math.round(s.avg_score)}%.`,
          severity: 'medium'
        }))
      ]
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
