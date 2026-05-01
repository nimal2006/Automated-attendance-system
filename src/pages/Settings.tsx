import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, Bell, Shield, User as UserIcon, 
  Database, Globe, Clock, Save, Lock, Smartphone 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Environment Preferences & Protocol Tuning</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-bg-card border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Attendance Protocols</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1">Presence Threshold (%)</label>
                    <input type="number" defaultValue="75" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-all font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1">School Start Time</label>
                    <input type="time" defaultValue="08:30" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-all font-mono" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Device Configuration</h2>
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">Sync Status: Online</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Last Sync: 4 mins ago</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all">Manual Sync</button>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 flex justify-end">
                <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20">
                  <Save className="w-4 h-4" /> Commit Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Authentication</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <p className="text-xs font-bold text-white">Password Expiration (90 Days)</p>
                    </div>
                    <div className="w-10 h-5 bg-cyan-600 rounded-full relative">
                       <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <p className="text-xs font-bold text-white">Require SMS Verification</p>
                    </div>
                    <div className="w-10 h-5 bg-slate-800 rounded-full relative">
                       <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
