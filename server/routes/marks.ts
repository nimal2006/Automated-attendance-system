import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { studentId, classId } = req.query;
  
  try {
    let query = supabase
      .from('marks')
      .select(`
        *,
        students:student_id (
          full_name,
          class_id
        )
      `);

    if (studentId) {
      query = query.eq('student_id', parseInt(studentId as string));
    } else if (classId) {
      query = query.eq('students.class_id', parseInt(classId as string));
    }

    const { data, error } = await query;
    if (error) throw error;

    // Flatten result to match existing format
    const marks = data.map(m => ({
      ...m,
      student_name: (m as any).students?.full_name
    }));

    res.json(marks);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, subject, marks, max_marks, exam_name, date } = req.body;
  try {
    const { data, error } = await supabase
      .from('marks')
      .insert({
        student_id: parseInt(student_id),
        subject,
        marks: parseFloat(marks),
        max_marks: parseFloat(max_marks),
        exam_name,
        date
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
