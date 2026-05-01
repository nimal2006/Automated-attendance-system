import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  BookOpen,
  School,
  MoreVertical,
  Award
} from 'lucide-react';
import { api } from '../lib/api';
import { Teacher, User } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Teachers({ user }: { user: User | null }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getTeachers().then(setTeachers).finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter(t => 
    t.full_name.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-cyan-500 font-mono text-sm tracking-widest uppercase">
       Authorized Node Access...
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Faculty Directory</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Authorized Teaching Staff • Registry Load: {teachers.length}</p>
        </div>
        
        {user?.role === 'admin' && (
          <button className="flex items-center gap-3 px-6 py-3 bg-cyan-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-cyan-900/20 hover:bg-cyan-500 transition-all border border-cyan-500/20">
            <Plus className="w-4 h-4" /> Add Multiplier
          </button>
        )}
      </header>

      <div className="bg-bg-card border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-slate-800 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by faculty name or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500 transition-all text-xs font-bold text-white outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Active nodes: {teachers.length}</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/30">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Faculty Identity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Department</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Class Vector</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Communication</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-900/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-cyan-500 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                        {teacher.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight leading-none mb-1">{teacher.full_name}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">UID: #T-{teacher.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <Award className="w-3 h-3 text-cyan-500" />
                       {teacher.subject}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                      {teacher.class_name || 'Global'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] text-slate-500 font-mono">
                    <div className="space-y-1">
                       <p className="flex items-center gap-2 hover:text-cyan-500 transition-colors cursor-pointer">
                          <Mail className="w-3 h-3" /> faculty@edu-ai.tn
                       </p>
                       <p className="flex items-center gap-2 hover:text-cyan-500 transition-colors cursor-pointer">
                          <Phone className="w-3 h-3" /> +91-XXXXXXXXXX
                       </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-cyan-500 rounded-xl transition-all border border-slate-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
