import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parents')
      .select(`
        *,
        users:user_id (
          full_name,
          email
        )
      `);
    
    if (error) throw error;
    const result = data.map(p => ({
      ...p,
      full_name: (p as any).users?.full_name,
      email: (p as any).users?.email
    }));
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/child-data', authenticateToken, async (req, res) => {
  const user_id = (req as any).user.id;
  
  try {
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (parentError || !parent) return res.status(404).json({ error: 'Parent record not found' });
    
    const { data: childrenData, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id(name)
      `)
      .eq('parent_id', parent.id);

    if (studentError) throw studentError;

    const children = childrenData.map(s => ({
      ...s,
      class_name: (s as any).classes?.name
    }));
    
    res.json(children);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { user_id, phone, address } = req.body;
  try {
    const { data, error } = await supabase
      .from('parents')
      .insert({
        user_id: parseInt(user_id),
        phone,
        address
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
  const { phone, address } = req.body;
  try {
    const { error } = await supabase
      .from('parents')
      .update({ phone, address })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
