import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserMinus, Percent, TrendingUp, AlertCircle, 
  Award, MessageSquare, ShieldAlert, LineChart as ChartIcon
} from 'lucide-react';
import { api } from '../lib/api';
import { UserStats, Student, User } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { motion } from 'motion/react';

export function Dashboard({ user }: { user: User | null }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'teacher') {
        const dataResource = await api.getStats();
        setStats(dataResource);
      } else if (user?.role === 'parent') {
        const dataResource = await api.getParentChildData();
        setChildren(dataResource);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-cyan-500 font-mono text-sm tracking-widest">
       CONNECTING TO TN-V1 NODE...
    </div>
  );

  // Admin/Teacher View
  if (user?.role === 'admin' || user?.role === 'teacher') {
    const chartData = [
      { name: 'Present', value: stats?.presentToday.count || 0, color: '#06b6d4' },
      { name: 'Absent', value: stats?.absentToday.count || 0, color: '#f43f5e' },
      { name: 'Late', value: stats?.lateToday.count || 0, color: '#eab308' },
    ];

    return (
      <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/60 pb-10">
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic decoration-cyan-500/30 underline underline-offset-8">Central_Nexus</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
               <span className="w-1 h-3 bg-slate-700 inline-block" />
               Real-time Operations Monitoring • Node: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-lg flex items-center gap-3 group hover:border-cyan-500/40 transition-all">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">Uplink Active</span>
             </div>
             <div className="px-5 py-2.5 bg-slate-900/50 border border-slate-800 rounded-lg hidden sm:flex items-center gap-3">
                <Percent className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Efficiency: 98.4%</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Enrolled Subjects', value: stats?.totalStudents.count, icon: Users, color: 'cyan', unit: 'Units' },
            { label: 'Active Presence', value: stats?.presentToday.count, icon: UserCheck, color: 'emerald', unit: 'Verified' },
            { label: 'Null Samples', value: stats?.absentToday.count, icon: UserMinus, color: 'rose', unit: 'Missing' },
            { label: 'Core Faculty', value: stats?.totalTeachers.count, icon: Award, color: 'amber', unit: 'Admin' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-xl group relative overflow-hidden transition-all hover:bg-bg-card/80 border border-white/5 active:scale-95"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-${item.color}-500/5 blur-2xl group-hover:bg-${item.color}-500/10 transition-all`} />
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 bg-${item.color}-500/10 rounded-lg flex items-center justify-center border border-${item.color}-500/20`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                  </div>
                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Type: 0{i+1}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{item.value}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <span className={`text-[8px] font-black text-${item.color}-500/60 uppercase tracking-tighter`}>{item.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
             <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                     Attendance Vector Analysis
                  </h2>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.1em] ml-4">Probability density by population subgroup</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-6 w-px bg-slate-800 mx-2" />
                   <select className="bg-slate-900/80 border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 rounded-lg outline-none cursor-pointer hover:border-cyan-500/30 transition-all">
                      <option>T-Minus 7D</option>
                      <option>T-Minus 30D</option>
                   </select>
                </div>
             </div>
             <div className="h-[320px] font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
                        <stop offset="100%" stopColor="rgba(6, 182, 212, 0.05)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: '#1e293b' }} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#020406', border: '1px solid #1e293b', borderRadius: '4px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#06b6d4' }}
                      labelStyle={{ fontSize: '8px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-white/5 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-40 h-40 bg-rose-600/5 blur-3xl -mr-20 -mt-20 rounded-full" />
             
             <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Integrity_Check</h2>
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.1em]">Security & Risk Assessment</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="p-6 bg-slate-900/30 rounded-xl border border-white/5 relative group hover:border-rose-500/30 transition-all">
                   <div className="absolute top-2 right-4 text-[8px] font-black text-rose-500 uppercase tracking-widest opacity-40">CRITICAL</div>
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Attendance Deficit</span>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                   </div>
                   <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-white tracking-tighter italic">{stats?.lowAttendance.count}</p>
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Subjects</span>
                   </div>
                   <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-2">Subjects below 75% operational threshold</p>
                </div>

                <div className="p-6 bg-slate-900/30 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-all">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Log</span>
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-amber-500/20 rounded-full overflow-hidden">
                        <div className="w-full h-1/2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">Sync Desynchronization</p>
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1">Manual node realignment required</p>
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                   <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5 hover:border-white/10 active:scale-95">
                      Open Security Console
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Parent View
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-gradient-to-r from-bg-card to-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">Welcome, {user?.full_name}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">Parent Access Interface • Monitoring Active</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Authenticated</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {children.map((child) => (
          <motion.div 
            key={child.id}
            whileHover={{ y: -5 }}
            className="bg-bg-card border border-slate-800 rounded-3xl overflow-hidden group hover:border-cyan-500/30 transition-all shadow-2xl"
          >
            <div className="p-8 border-b border-slate-800 bg-slate-900/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-cyan-500 uppercase">
                       {child.full_name[0]}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none mb-1">{child.full_name}</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{child.class_name}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">ID Node</p>
                    <p className="text-xs font-mono font-bold text-slate-400">{child.roll_number}</p>
                 </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-3 gap-6">
              <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Attendance</p>
                 <div className={`text-2xl font-bold tracking-tighter ${child.attendance_percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                   {Math.round(child.attendance_percentage)}%
                 </div>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Performance</p>
                 <div className="text-2xl font-bold text-white tracking-tighter uppercase">TBD</div>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Warnings</p>
                 <div className="text-2xl font-bold text-slate-700 tracking-tighter">0</div>
              </div>
            </div>

            <div className="px-8 pb-8 flex gap-3">
               <button className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/10">View Detailed Reports</button>
               <button className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] rounded-xl transition-all border border-slate-700">
                  <MessageSquare className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
