import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { TimetableSlot, User } from '../types';
import { 
  Calendar, Book, User as UserIcon, Clock, 
  ChevronLeft, ChevronRight, MapPin 
} from 'lucide-react';

export const Schedule: React.FC<{ user: User | null }> = ({ user }) => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const data = await api.getTimetable(
        user?.role === 'teacher' ? { teacherId: user.id } : { classId: 1 } // Default class for demo
      );
      setTimetable(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimetable = timetable.filter(slot => slot.day === selectedDay)
    .sort((a, b) => a.period - b.period);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Schedule</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Class Timings & Subject Rotation</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedDay === day 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTimetable.length === 0 ? (
          <div className="p-20 text-center border border-dashed border-slate-800 rounded-3xl">
             <Clock className="w-12 h-12 mx-auto mb-4 opacity-5 text-slate-400" />
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No classes scheduled for {selectedDay}</p>
          </div>
        ) : (
          filteredTimetable.map((slot, i) => (
            <motion.div 
              key={slot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-card border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Period</span>
                  <span className="text-2xl font-bold text-white">{slot.period}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-0.5">{slot.subject}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs uppercase tracking-widest font-bold">
                       <MapPin className="w-3 h-3" /> {slot.class_name || 'Room 101'}
                    </div>
                    {user?.role !== 'teacher' && (
                       <div className="flex items-center gap-1.5 text-slate-500 text-xs uppercase tracking-widest font-bold">
                          <UserIcon className="w-3 h-3" /> Prof. {slot.teacher_subject || 'Faculty'}
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 md:text-right">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Time Block</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-cyan-500" />
                    <span className="text-sm font-mono font-bold text-white">{slot.start_time} - {slot.end_time}</span>
                  </div>
                </div>
                <div className="w-1 h-8 bg-slate-800 rounded-full hidden md:block" />
                <button className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-all border border-slate-800">
                   <Book className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
