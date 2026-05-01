import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  MoreHorizontal,
  ShieldCheck,
  GraduationCap,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { Student, User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfileModal } from '../components/StudentProfileModal';

export function Students({ user }: { user: User | null }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    class_id: '',
    parent_id: '',
    face_encoding: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const fetchStudents = () => {
    api.getStudents().then(setStudents).finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('roll_number', formData.roll_number);
    data.append('class_id', formData.class_id);
    data.append('parent_id', formData.parent_id);
    data.append('face_encoding', formData.face_encoding);
    if (file) data.append('image', file);

    try {
      // Use fetch directly for FormData if api helper doesn't support it easily
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ full_name: '', roll_number: '', class_id: '', parent_id: '', face_encoding: '' });
        setFile(null);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800/60 pb-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-600/50 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse" />
          <div className="h-10 w-64 bg-slate-800/50 rounded animate-pulse mb-3" />
          <div className="h-3 w-40 bg-slate-800/50 rounded animate-pulse" />
        </div>
      </header>
      
      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-white/5 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="h-12 w-full max-w-md bg-slate-800/50 rounded-xl animate-pulse" />
           <div className="h-12 w-32 bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-slate-800/60 transition-opacity opacity-50">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-8 overflow-hidden">
               <div className="flex justify-between items-start mb-8">
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-800/50 animate-pulse" />
                    <div>
                       <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse mb-2" />
                       <div className="h-2 w-16 bg-slate-800/50 rounded animate-pulse" />
                    </div>
                 </div>
                 <div className="text-right shrink-0">
                    <div className="h-2 w-12 bg-slate-800/50 rounded animate-pulse mb-2 ml-auto" />
                    <div className="h-6 w-16 bg-slate-800/50 rounded animate-pulse" />
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-slate-800/50 animate-pulse shrink-0" />
                       <div className="h-3 w-32 bg-slate-800/50 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-slate-800/50 animate-pulse shrink-0" />
                       <div className="h-3 w-32 bg-slate-800/50 rounded animate-pulse" />
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800/60 pb-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-cyan-500/30 underline-offset-8">Student_Registry</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
             <span className="w-1 h-3 bg-slate-700 inline-block" />
             Active Nodes: {students.length} / Physical Registry
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-4 px-8 py-4 bg-cyan-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.2)] hover:bg-cyan-500 transition-all border border-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Enrol_New_Subject
          </button>
        )}
      </header>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-[#020406]/90 backdrop-blur-md" 
               onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card rounded-3xl w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 border border-white/5"
            >
              <div className="p-8 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
                <div>
                   <h3 className="text-white font-black uppercase tracking-[0.3em] text-sm">Registry enrollment protocol</h3>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Initialize identity creation sequence</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 custom-scrollbar max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Subject Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="FULL_NOMINAL"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/30 text-[11px] font-black text-white outline-none transition-all placeholder:text-slate-800 uppercase tracking-wider"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Identity ID</label>
                    <input 
                      required
                      type="text"
                      placeholder="ID_VECTOR"
                      value={formData.roll_number}
                      onChange={e => setFormData({...formData, roll_number: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/30 text-[11px] font-mono font-black text-white outline-none transition-all placeholder:text-slate-800 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Node Class</label>
                    <input 
                      required
                      type="number"
                      placeholder="CID_00"
                      value={formData.class_id}
                      onChange={e => setFormData({...formData, class_id: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/30 text-[11px] font-black text-white outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Uplink Parent ID</label>
                    <input 
                      required
                      type="number"
                      placeholder="PID_00"
                      value={formData.parent_id}
                      onChange={e => setFormData({...formData, parent_id: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/30 text-[11px] font-black text-white outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Bio-Metric Encoding</label>
                  <textarea 
                    value={formData.face_encoding}
                    onChange={e => setFormData({...formData, face_encoding: e.target.value})}
                    placeholder="[0.12, -0.05, ...]"
                    className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-cyan-500/30 text-[11px] font-mono font-black text-white outline-none transition-all h-28 resize-none placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Reference Visual Data</label>
                  <div className="relative group">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-48 bg-slate-950/40 border-2 border-dashed border-slate-800/60 rounded-3xl cursor-pointer hover:bg-slate-900/50 transition-all overflow-hidden relative",
                      preview && "border-solid border-cyan-500/30"
                    )}>
                      {preview ? (
                        <div className="relative w-full h-full">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 mb-4 group-hover:border-cyan-500/30 transition-all">
                             <Upload className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] max-w-[200px]">
                            SELECT_HIGH_RES_REF_PHOTO_FOR_ID_MATCHING
                          </p>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*" />
                    </label>
                    {preview && (
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-rose-600 text-white rounded-full shadow-xl hover:bg-rose-500 transition-colors flex items-center justify-center z-20 border border-white/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  type="submit"
                  className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-[0_0_30px_rgba(8,145,178,0.3)] disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {submitting ? 'ENROLLING_SUBJECT...' : 'FINALIZE_REGISTRY_ENTRY'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStudentId !== null && (
          <StudentProfileModal 
            studentId={selectedStudentId} 
            onClose={() => setSelectedStudentId(null)} 
          />
        )}
      </AnimatePresence>

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-8 border-b border-white/5 bg-slate-900/10 flex items-center justify-between">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH_REGISTRY_DATABASE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-slate-800/60 rounded-xl focus:border-cyan-500/30 transition-all text-[11px] font-black text-white outline-none tracking-widest uppercase placeholder:text-slate-800"
            />
          </div>
          <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Node Stream
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 divide-x divide-y divide-slate-800/40">
          {filtered.map((student, i) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 hover:bg-slate-900/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-500/40 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all overflow-hidden shadow-inner">
                    {student.image_path ? (
                      <img src={student.image_path} alt={student.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <GraduationCap className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-wider truncate mb-1 group-hover:text-cyan-400 transition-colors">{student.full_name}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-slate-600 font-mono font-black uppercase tracking-widest">{student.roll_number}</span>
                       <span className="w-1 h-1 bg-slate-800 rounded-full" />
                       <span className="text-[9px] text-cyan-600/60 font-black uppercase tracking-widest">{student.class_name || 'LVL_01'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Att_Health</p>
                   <p className={cn(
                     "text-2xl font-black tracking-tighter",
                     student.attendance_percentage < 75 ? "text-rose-500/80" : "text-emerald-500/80"
                   )}>
                     {Math.round(student.attendance_percentage)}%
                   </p>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                       <Phone className="w-3 h-3 text-cyan-500/50" />
                    </div>
                    <span className="truncate">Uplink: {student.parent_phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                       <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                    </div>
                    <span>Bio-Metric Registered</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                   <button onClick={() => setSelectedStudentId(student.id)} className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all border border-slate-800 group-hover:border-slate-700 active:scale-95">Open_Record</button>
                   <button className="w-10 h-10 bg-slate-950 hover:bg-slate-900 text-slate-700 hover:text-white rounded-lg transition-all border border-slate-800 group-hover:border-slate-700 flex items-center justify-center active:scale-95">
                      <MoreHorizontal className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
