import express from 'express';
import { supabase, uploadDir } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id(name),
        parents:parent_id(phone)
      `);
    
    if (error) throw error;

    const students = data.map(s => ({
      ...s,
      class_name: s.classes?.name,
      parent_phone: s.parents?.phone
    }));
    res.json(students);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { full_name, roll_number, class_id, parent_id, face_encoding } = req.body;
  const image_path = req.file ? `/static/uploads/faces/${req.file.filename}` : null;
  
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        full_name,
        roll_number,
        class_id: class_id ? parseInt(class_id) : null,
        parent_id: parent_id ? parseInt(parent_id) : null,
        image_path,
        face_encoding: face_encoding || null
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id, image_path });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { full_name, roll_number, class_id, parent_id, face_encoding } = req.body;
  const studentId = req.params.id;
  
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('students')
      .select('image_path')
      .eq('id', studentId)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Student not found' });

    let image_path = existing.image_path;
    if (req.file) {
      image_path = `/static/uploads/faces/${req.file.filename}`;
    }

    const { error: updateError } = await supabase
      .from('students')
      .update({
        full_name,
        roll_number,
        class_id: class_id ? parseInt(class_id) : null,
        parent_id: parent_id ? parseInt(parent_id) : null,
        image_path,
        face_encoding: face_encoding || null
      })
      .eq('id', studentId);

    if (updateError) throw updateError;
    
    res.json({ success: true, image_path });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id(name),
        parents:parent_id(phone)
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !student) return res.status(404).json({ error: 'Student not found' });

    // Fetch attendance history
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    // Fetch marks
    const { data: marks } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    // Fetch alerts (anticheat logs & leave requests)
    const { data: anticheat_logs } = await supabase
      .from('anticheat_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    const { data: leave_requests } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    const alertsAndNotes = [
      ...(anticheat_logs || []).map(log => ({ type: 'anticheat', title: log.type, description: `Confidence: ${log.confidence}%`, date: log.created_at, color: 'text-rose-500', bg: 'bg-rose-500/10' })),
      ...(leave_requests || []).map(lr => ({ type: 'leave', title: `Leave ${lr.status}`, description: lr.reason, date: lr.created_at, color: 'text-amber-500', bg: 'bg-amber-500/10' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      ...student,
      class_name: student.classes?.name,
      parent_phone: student.parents?.phone,
      attendanceHistory: attendance || [],
      academicPerformance: marks || [],
      alerts: alertsAndNotes
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id(name),
        parents:parent_id(phone)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Student not found' });

    const student = {
      ...data,
      class_name: data.classes?.name,
      parent_phone: data.parents?.phone
    };
    res.json(student);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
