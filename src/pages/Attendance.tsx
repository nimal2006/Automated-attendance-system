import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle,
  Save,
  Search,
  Scan,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api';
import { AttendanceRecord, User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export function Attendance({ user }: { user: User | null }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendance(date);
      setAttendance(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const handleStatusChange = async (studentId: number, status: string) => {
    setUpdatingId(studentId);
    try {
      await api.updateAttendance({ 
        student_id: studentId, 
        status, 
        date, 
        method: 'Manual' 
      });
      setAttendance(prev => prev.map(a => 
        a.student_id === studentId ? { ...a, status: status as any, time: format(new Date(), 'HH:mm:ss') } : a
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to update attendance');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAttendance = attendance.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) || 
    a.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-cyan-500 font-mono text-sm tracking-widest uppercase">
       Syncing Attendance Vector...
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800/60 pb-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-cyan-500/30 underline-offset-8">Attendance_Log</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
             <span className="w-1 h-3 bg-slate-700 inline-block" />
             Manual Registry Control • Temporal_Sync: {date}
          </p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/40 rounded-xl border border-slate-800/60 backdrop-blur-xl shadow-2xl relative group">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          <button 
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() - 1);
              setDate(format(d, 'yyyy-MM-dd'));
            }}
            className="p-2.5 hover:bg-slate-800/50 rounded-lg transition-all text-slate-500 hover:text-cyan-400 active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 py-2.5 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 font-black rounded-lg flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(date), 'dd_MMM_yyyy').toUpperCase()}</span>
          </div>
          <button 
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              setDate(format(d, 'yyyy-MM-dd'));
            }}
            className="p-2.5 hover:bg-slate-800/50 rounded-lg transition-all text-slate-500 hover:text-cyan-400 active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Present Today', value: stats.present, color: 'emerald', icon: CheckCircle2 },
          { label: 'Absent Registry', value: stats.absent, color: 'rose', icon: XCircle },
          { label: 'Late Entries', value: stats.late, color: 'amber', icon: Clock },
          { label: 'Node Health', value: '100%', color: 'cyan', icon: Scan },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-xl border border-white/5 relative group hover:bg-bg-card/80 transition-all overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/5 blur-2xl`} />
            <stat.icon className={`w-5 h-5 mb-6 text-${stat.color}-500`} />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="glass-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="p-8 border-b border-white/5 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter Subject_Identity..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800/60 rounded-xl focus:border-cyan-500/30 transition-all text-[11px] font-black text-white outline-none placeholder:text-slate-700 tracking-wider uppercase"
            />
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-3 px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-500 font-black uppercase tracking-widest rounded-xl border border-slate-800 transition-all active:scale-95">
                <Filter className="w-3.5 h-3.5" /> Filter_Vector
             </button>
             <button className="flex items-center gap-3 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.2)] active:scale-95">
                <Save className="w-3.5 h-3.5" /> Sync_Batch
             </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/40">
                <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational_Node / Subject</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Identity_ID</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Sync_Timestamp</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Transmission</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-right">Node_Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              <AnimatePresence mode="popLayout">
                {filteredAttendance.map((record, idx) => (
                  <motion.tr 
                    key={record.student_id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-900/10 transition-colors group relative"
                  >
                    <td className="px-8 py-6 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 text-cyan-500/40 flex items-center justify-center font-black text-[10px] shadow-inner group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                          {record.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">{record.full_name}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{record.class_name || 'LEVEL_01'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-mono font-black text-slate-500 tracking-tighter group-hover:text-cyan-500/60 transition-colors">{record.roll_number}</td>
                    <td className="px-8 py-6 text-[10px] font-mono font-black">
                      {record.time && record.time !== '00:00:00' ? (
                        <div className="flex items-center gap-2 text-cyan-500/80">
                           <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                           {record.time}
                        </div>
                      ) : <span className="text-slate-800 italic">OFFLINE</span>}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[8px] font-black px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-slate-600 uppercase tracking-[0.2em] group-hover:border-slate-700 transition-all">
                        {record.method || 'System'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        {['Present', 'Late', 'Absent'].map((status) => (
                          <button
                            key={status}
                            disabled={updatingId === record.student_id}
                            onClick={() => handleStatusChange(record.student_id, status)}
                            className={cn(
                              "px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all border relative overflow-hidden active:scale-90",
                              record.status === status
                                ? status === 'Present' ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                                  status === 'Late' ? "bg-amber-600/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                  "bg-rose-600/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                                : "bg-slate-950/40 border-slate-800 text-slate-700 hover:text-slate-400 hover:border-slate-700"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
