import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Mark, Student } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, AlertCircle, 
  Search, Filter, Plus, Save, Download 
} from 'lucide-react';

export const Performance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedStudent]);

  const loadData = async () => {
    try {
      const [studentsData, marksData] = await Promise.all([
        api.getStudents(),
        api.getMarks(selectedStudent || undefined)
      ]);
      setStudents(studentsData);
      setMarks(marksData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (marks.length === 0) return { avg: 0, top: [], low: [] };
    
    // Average by student
    const studentAvg = marks.reduce((acc: any, cur) => {
      if (!acc[cur.student_id]) acc[cur.student_id] = { sum: 0, count: 0, name: cur.student_name };
      acc[cur.student_id].sum += (cur.marks / cur.max_marks) * 100;
      acc[cur.student_id].count += 1;
      return acc;
    }, {});

    const stats = Object.entries(studentAvg).map(([id, data]: any) => ({
      id,
      name: data.name,
      avg: Math.round(data.sum / data.count)
    })).sort((a, b) => b.avg - a.avg);

    return {
      avg: Math.round(stats.reduce((s, a) => s + a.avg, 0) / stats.length),
      top: stats.slice(0, 3),
      low: stats.filter(s => s.avg < 50)
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Performance</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cross-Subject Analytics & Grade Control</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-slate-900 border border-slate-800 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded outline-none"
            onChange={(e) => setSelectedStudent(Number(e.target.value) || null)}
          >
            <option value="">All Students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded transition-all">
            <Plus className="w-4 h-4" /> Entry Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class Average</p>
              <h3 className="text-2xl font-bold text-white">{stats.avg}%</h3>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Performers</p>
              <h3 className="text-sm font-bold text-emerald-400">{stats.top[0]?.name || 'N/A'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Need Attention</p>
              <h3 className="text-2xl font-bold text-rose-400">{stats.low.length} <span className="text-[10px] text-slate-500 font-normal">STUDENTS</span></h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-bg-card border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Subject Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                  {marks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.marks > 75 ? '#06b6d4' : entry.marks > 50 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Detailed Record Log</h2>
            <button className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2 hover:text-cyan-400 transition-colors">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exam</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Marks</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-8 py-5 text-xs font-bold text-white">{mark.student_name}</td>
                    <td className="px-6 py-5 text-xs text-slate-400 uppercase tracking-widest font-mono">{mark.subject}</td>
                    <td className="px-6 py-5 text-xs text-slate-400">{mark.exam_name}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        mark.marks > 75 ? 'bg-cyan-500/10 text-cyan-400' : 
                        mark.marks > 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {mark.marks}/{mark.max_marks}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[10px] text-slate-500 text-right font-mono">{mark.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
