import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  studentId: number;
  onClose: () => void;
}

export function StudentProfileModal({ studentId, onClose }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'academic' | 'attendance' | 'alerts'>('academic');

  useEffect(() => {
    api.getStudentProfile(studentId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-[#020406]/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="glass-card rounded-3xl w-full max-w-5xl h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 border border-white/5 flex flex-col"
      >
        <div className="p-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h3 className="text-white font-black uppercase tracking-[0.3em] text-sm">Student Record Overview</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Deep analysis of connected node</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-cyan-500 font-mono text-xs uppercase tracking-widest">
            Aggregating Matrix Data...
          </div>
        ) : profile ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Identity Card */}
              <div className="space-y-8">
                <div className="glass-card p-6 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 blur-[50px]" />
                  <div className="w-32 h-32 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-500/40 overflow-hidden shadow-inner mb-6 z-10">
                    {profile.image_path ? (
                      <img src={profile.image_path} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black tracking-widest uppercase">No Image</span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider z-10 text-center">{profile.full_name}</h2>
                  <p className="text-xs text-cyan-500 font-mono font-black uppercase tracking-widest mt-2 z-10">{profile.roll_number}</p>
                  
                  <div className="mt-6 w-full space-y-4 z-10">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-slate-800/60 pb-2">
                       <span className="text-slate-500">Node Class</span>
                       <span className="text-slate-300">{profile.class_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-slate-800/60 pb-2">
                       <span className="text-slate-500">Uplink Parent</span>
                       <span className="text-slate-300">{profile.parent_phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pb-2">
                       <span className="text-slate-500">Live Status</span>
                       <span className={cn("px-2 py-1 rounded bg-slate-900 border", profile.attendance_percentage >= 75 ? "text-emerald-400 border-emerald-500/30" : "text-rose-400 border-rose-500/30")}>
                         {Math.round(profile.attendance_percentage)}% Attendance
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Data & Analytics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800/60 pb-4 overflow-x-auto custom-scrollbar">
                  <button onClick={() => setActiveTab('academic')} className={cn("shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none", activeTab === 'academic' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent")}>
                    Academic
                  </button>
                  <button onClick={() => setActiveTab('attendance')} className={cn("shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none", activeTab === 'attendance' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent")}>
                    Attendance
                  </button>
                  <button onClick={() => setActiveTab('alerts')} className={cn("shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 outline-none", activeTab === 'alerts' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent")}>
                    Alerts & Notes
                    {profile.alerts?.length > 0 && (
                       <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-mono">{profile.alerts.length}</span>
                    )}
                  </button>
                </div>

                <div className="space-y-8">
                  {activeTab === 'academic' && (
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-500" /> Academic Trajectory</h4>
                       <div className="h-64 w-full">
                         {profile.academicPerformance?.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">No academic data points</div>
                         ) : (
                            <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={profile.academicPerformance.slice().reverse()}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="exam_name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                               <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                               <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '0.5rem', fontSize: '12px' }} itemStyle={{ color: '#06b6d4' }} />
                               <Line type="monotone" dataKey="marks" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                             </LineChart>
                           </ResponsiveContainer>
                         )}
                       </div>
                    </div>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="space-y-8">
                      <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-500" /> Attendance Trend</h4>
                         <div className="h-48 w-full">
                           {profile.attendanceHistory?.length === 0 ? (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">No attendance vectors logged</div>
                           ) : (
                              <ResponsiveContainer width="100%" height="100%">
                               <LineChart data={profile.attendanceHistory.slice().reverse().map((record: any) => ({
                                  date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                  status: record.status,
                                  value: record.status === 'Present' ? 2 : record.status === 'Late' ? 1 : 0
                               }))}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                 <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    domain={[0, 2]} 
                                    ticks={[0, 1, 2]} 
                                    tickFormatter={(val) => val === 2 ? 'Present' : val === 1 ? 'Late' : 'Absent'}
                                 />
                                 <Tooltip 
                                   cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
                                   content={({ active, payload }: any) => {
                                     if (active && payload && payload.length) {
                                       const data = payload[0].payload;
                                       const color = data.status === 'Present' ? '#10b981' : data.status === 'Absent' ? '#f43f5e' : '#f59e0b';
                                       return (
                                         <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl">
                                           <p className="text-[10px] text-slate-500 font-mono mb-1">{data.date}</p>
                                           <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>{data.status}</p>
                                         </div>
                                       );
                                     }
                                     return null;
                                   }} 
                                 />
                                 <Line 
                                   type="stepAfter" 
                                   dataKey="value" 
                                   stroke="#334155" 
                                   strokeWidth={2} 
                                   dot={(props: any) => {
                                     const { cx, cy, payload } = props;
                                     const color = payload.status === 'Present' ? '#10b981' : payload.status === 'Absent' ? '#f43f5e' : '#f59e0b';
                                     return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={color} stroke="#020617" strokeWidth={2} />;
                                   }} 
                                   activeDot={{ r: 6, fill: '#fff', stroke: '#020617', strokeWidth: 2 }} 
                                 />
                               </LineChart>
                             </ResponsiveContainer>
                           )}
                         </div>
                      </div>

                      <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-500" /> Recent Attendance History</h4>
                         <div className="space-y-2">
                           {profile.attendanceHistory?.length === 0 ? (
                              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center py-4">No attendance vectors logged</div>
                           ) : (
                              profile.attendanceHistory?.slice(0, 5).map((record: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
                                   <div className="flex items-center gap-3">
                                      <div className={cn("w-2 h-2 rounded-full", record.status === 'Present' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : record.status === 'Absent' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]')} />
                                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{record.date}</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                     <span className="text-[10px] text-slate-500 font-mono tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> {record.time}</span>
                                     <span className={cn("text-[9px] font-black uppercase tracking-widest w-20 text-right", record.status === 'Present' ? 'text-emerald-500' : record.status === 'Absent' ? 'text-rose-500' : 'text-amber-500')}>{record.status}</span>
                                   </div>
                                </div>
                              ))
                           )}
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'alerts' && (
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-amber-500" /> Active Alerts & Notes</h4>
                       <div className="space-y-3">
                         {profile.alerts?.length === 0 ? (
                           <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center py-8">No active alerts</div>
                         ) : (
                           profile.alerts?.map((alert: any, i: number) => (
                             <div key={i} className={cn("p-4 rounded-xl border border-slate-800/60", alert.bg)}>
                                <div className="flex justify-between items-start mb-2">
                                   <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-slate-950", alert.color)}>{alert.title}</span>
                                   <span className="text-[8px] text-slate-500 font-mono tracking-widest">{new Date(alert.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold">{alert.description || 'No description provided'}</p>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-rose-500 font-mono text-xs uppercase tracking-widest">
            Failed to extract data
          </div>
        )}
      </motion.div>
    </div>
  );
}
