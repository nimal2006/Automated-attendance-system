import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { initDb, db, supabase } from './server/db.ts';
import { seed } from './server/seed.ts';
import { authenticateToken } from './server/middleware/auth.ts';

import authRoutes from './server/routes/auth.ts';
import studentRoutes from './server/routes/students.ts';
import teacherRoutes from './server/routes/teachers.ts';
import attendanceRoutes from './server/routes/attendance.ts';
import markRoutes from './server/routes/marks.ts';
import leaveRoutes from './server/routes/leaves.ts';
import faceRoutes from './server/routes/face.ts';
import adminRoutes from './server/routes/admin.ts';
import parentRoutes from './server/routes/parent.ts';
import timetableRoutes from './server/routes/timetable.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Database
initDb();
seed();

// Middleware
app.use(express.json());
app.use('/static', express.static(path.join(process.cwd(), 'static')));

// API Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/face-recognition', faceRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/timetable', timetableRoutes);

// Generic Routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  const user_id = (req as any).user.id;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Vite / Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
