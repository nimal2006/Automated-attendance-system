import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { sendAttendanceSMS } from '../../src/lib/twilio.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { date, classId } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];
  
  try {
    let query = supabase
      .from('students')
      .select(`
        id,
        full_name,
        roll_number,
        attendance!left (
          status,
          time,
          method,
          date
        )
      `)
      .eq('attendance.date', targetDate);

    if (classId) {
      query = query.eq('class_id', parseInt(classId as string));
    }

    const { data, error } = await query;
    if (error) throw error;

    // Flatten the result to match the expected format
    const result = data.map((s: any) => ({
      student_id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      status: s.attendance?.[0]?.status || null,
      time: s.attendance?.[0]?.time || null,
      method: s.attendance?.[0]?.method || null,
      date: s.attendance?.[0]?.date || targetDate
    }));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/update-status', authenticateToken, async (req, res) => {
  const { student_id, status, date, method } = req.body;
  const time = new Date().toTimeString().split(' ')[0];
  const user_id = (req as any).user.id;

  try {
    // 1. Upsert attendance
    const { error: upsertError } = await supabase
      .from('attendance')
      .upsert({
        student_id: parseInt(student_id),
        date,
        time,
        status,
        method: method || 'Manual',
        marked_by: user_id
      }, { onConflict: 'student_id,date' });

    if (upsertError) throw upsertError;

    // 2. Fetch info for SMS
    const { data: studentInfo, error: studentError } = await supabase
      .from('students')
      .select(`
        full_name,
        parents:parent_id (
          id,
          phone,
          user_id
        )
      `)
      .eq('id', student_id)
      .single();

    if (studentError || !studentInfo) throw studentError || new Error('Student not found');
    const parent = (studentInfo as any).parents;

    if (status === 'Absent' || status === 'Late') {
      const smsResult = await sendAttendanceSMS({
        studentName: studentInfo.full_name,
        status,
        parentPhone: parent.phone,
        date,
        time
      });

      await supabase
        .from('sms_logs')
        .insert({
          student_id: parseInt(student_id),
          parent_id: parent.id,
          phone: parent.phone,
          event_type: status,
          message: smsResult.message,
          sms_status: smsResult.status,
          twilio_sid: smsResult.sid || null,
          error_message: smsResult.error || null
        });
    }

    // 3. Recalculate percentage
    const { count: totalDates, error: dateError } = await supabase
      .from('attendance')
      .select('date', { count: 'exact', head: true });
    
    if (dateError) throw dateError;

    const { count: presentCount, error: presentError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student_id)
      .in('status', ['Present', 'Late']);

    if (presentError) throw presentError;

    const totalDaysCount = totalDates || 0;
    const presentDaysCount = presentCount || 0;
    const newPercentage = totalDaysCount > 0 ? (presentDaysCount / totalDaysCount) * 100 : 0;

    await supabase
      .from('students')
      .update({ attendance_percentage: newPercentage })
      .eq('id', student_id);

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/summary/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const { data: history, error: historyError } = await supabase
      .from('attendance')
      .select('date, status, time, method')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (historyError) throw historyError;

    const { data: statsData, error: statsError } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId);

    if (statsError) throw statsError;

    const stats = {
      total: statsData.length,
      present: statsData.filter(s => s.status === 'Present').length,
      late: statsData.filter(s => s.status === 'Late').length,
      absent: statsData.filter(s => s.status === 'Absent').length,
    };

    res.json({ stats, history });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
