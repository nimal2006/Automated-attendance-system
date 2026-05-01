import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { classId, teacherId } = req.query;
  
  try {
    let query = supabase
      .from('timetable')
      .select(`
        *,
        classes:class_id(name),
        teachers:teacher_id(subject)
      `);
    
    if (classId) {
      query = query.eq('class_id', parseInt(classId as string));
    } else if (teacherId) {
      query = query.eq('teacher_id', parseInt(teacherId as string));
    }

    const { data, error } = await query;
    if (error) throw error;

    const result = data.map(item => ({
      ...item,
      class_name: (item as any).classes?.name,
      teacher_subject: (item as any).teachers?.subject
    }));
    
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
