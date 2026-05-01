import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { AnticheatLog } from '../types';
import { 
  ShieldAlert, Eye, Timer, Image as ImageIcon, 
  MapPin, AlertTriangle, Fingerprint, Activity 
} from 'lucide-react';

export const Anticheat: React.FC = () => {
  const [logs, setLogs] = useState<AnticheatLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getAnticheatLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Anti-Cheat Protocols</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Liveness Verification & Spoof Detection Logs</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
           <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
           <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Active Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Incidents Today', value: logs.length, icon: ShieldAlert, color: 'text-rose-500' },
          { label: 'Avg Confidence', value: '98.2%', icon: Fingerprint, color: 'text-cyan-500' },
          { label: 'Spoof Rejected', value: 14, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'System Health', value: 'Nominal', icon: Activity, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-bg-card border border-slate-800 p-6 rounded-2xl">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Suspicious Activity Matrix</h2>
          <Timer className="w-4 h-4 text-slate-600" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Confidence</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evidence</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="px-8 py-5 text-xs font-mono text-slate-400">#AC-{log.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.type.includes('Failed') ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-tight">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-mono text-cyan-400">{(log.confidence * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-500 transition-colors">
                      <ImageIcon className="w-3 h-3" /> View Frame
                    </button>
                  </td>
                  <td className="px-6 py-5 text-[10px] text-slate-500 text-right font-mono">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
