import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        users:user_id (
          full_name,
          email
        ),
        classes:class_id (
          name
        )
      `);
    
    if (error) throw error;

    const result = data.map(t => ({
      ...t,
      full_name: (t as any).users?.full_name,
      email: (t as any).users?.email,
      class_name: (t as any).classes?.name
    }));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { user_id, subject, phone, class_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        user_id: parseInt(user_id),
        subject,
        phone,
        class_id: class_id ? parseInt(class_id) : null
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ id: data.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { subject, phone, class_id } = req.body;
  try {
    const { error } = await supabase
      .from('teachers')
      .update({
        subject,
        phone,
        class_id: class_id ? parseInt(class_id) : null
      })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
