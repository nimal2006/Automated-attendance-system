import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { LeaveRequest, Student, User } from '../types';
import { 
  Calendar, FileText, CheckCircle2, XCircle, 
  Clock, Plus, Filter, MessageSquare, ArrowRight 
} from 'lucide-react';

export const LeaveRequests: React.FC<{ user: User | null }> = ({ user }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [children, setChildren] = useState<Student[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Leave State
  const [newLeave, setNewLeave] = useState({
    student_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leavesData, childrenData] = await Promise.all([
        api.getLeaves(),
        user?.role === 'parent' ? api.getParentChildData() : Promise.resolve([])
      ]);
      setLeaves(leavesData);
      setChildren(childrenData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLeave(newLeave as any);
      setShowApplyModal(false);
      loadData();
      setNewLeave({ student_id: '', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leave & Absences</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status Tracking & Permission Management</p>
        </div>
        {user?.role === 'parent' && (
          <button 
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold uppercase tracking-[0.1em] px-6 py-3 rounded transition-all shadow-lg shadow-cyan-900/20"
          >
            <Plus className="w-4 h-4" /> New Application
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending', count: leaves.filter(l => l.status === 'Pending').length, icon: Clock, color: 'text-amber-500' },
          { label: 'Approved', count: leaves.filter(l => l.status === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Rejected', count: leaves.filter(l => l.status === 'Rejected').length, icon: XCircle, color: 'text-rose-500' },
          { label: 'Total Requests', count: leaves.length, icon: FileText, color: 'text-cyan-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-bg-card border border-slate-800 p-6 rounded-2xl">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.count}</h3>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Activity</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-800/50">
          {leaves.length === 0 ? (
            <div className="p-20 text-center text-slate-600">
               <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
               <p className="text-[10px] font-bold uppercase tracking-widest">No leave requests found</p>
            </div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="p-8 hover:bg-slate-900/10 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{leave.student_name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-2">
                         <span>{leave.start_date}</span>
                         <ArrowRight className="w-3 h-3" />
                         <span>{leave.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-slate-700" />
                        <p className="text-xs text-slate-400 italic line-clamp-1">{leave.reason}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.role === 'teacher' && leave.status === 'Pending' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/20 transition-all">Approve</button>
                      <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded border border-rose-500/20 transition-all">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-[#050608]/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-bg-card border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-1">New Leave Request</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-8">Formal Absence Notification</p>

              <form onSubmit={handleApply} className="space-y-6 text-slate-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Select Child</label>
                  <select 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-all text-sm"
                    value={newLeave.student_id}
                    onChange={e => setNewLeave({...newLeave, student_id: e.target.value})}
                  >
                    <option value="">Choose Student</option>
                    {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">From Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-all text-sm"
                      value={newLeave.start_date}
                      onChange={e => setNewLeave({...newLeave, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">To Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-all text-sm"
                      value={newLeave.end_date}
                      onChange={e => setNewLeave({...newLeave, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Reason for Absence</label>
                  <textarea 
                    required
                    placeholder="Briefly explain the cause..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-all text-sm"
                    value={newLeave.reason}
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-xl uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
