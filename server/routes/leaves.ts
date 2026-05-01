import express from 'express';
import { supabase } from '../db.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  
  try {
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        students:student_id (
          full_name
        )
      `);
    
    if (user.role === 'parent') {
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (parentError) throw parentError;
      if (parent) {
        query = query.eq('parent_id', parent.id);
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;

    const result = data.map(l => ({
      ...l,
      student_name: (l as any).students?.full_name
    }));

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, start_date, end_date, reason } = req.body;
  const user_id = (req as any).user.id;
  
  try {
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user_id)
      .single();
    
    if (parentError || !parent) return res.status(403).json({ error: 'Only parents can submit leave requests' });
    
    const { error: insertError } = await supabase
      .from('leave_requests')
      .insert({
        parent_id: parent.id,
        student_id: parseInt(student_id),
        start_date,
        end_date,
        reason,
        status: 'Pending'
      });

    if (insertError) throw insertError;
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { status, remarks } = req.body;
  const user_id = (req as any).user.id;
  
  try {
    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status,
        remarks,
        approved_by: user_id
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
