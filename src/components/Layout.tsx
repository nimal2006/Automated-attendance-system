import { ReactNode, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck, 
  ScanFace, 
  Bell, 
  LogOut,
  Menu,
  X,
  School,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText,
  ShieldAlert,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

export function Layout({ user, onLogout }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'teacher', 'parent'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'teacher'] },
    { name: 'Students', path: '/students', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { name: 'Faculty', path: '/teachers', icon: UserSquare2, roles: ['admin'] },
    { name: 'Academic Performance', path: '/performance', icon: BarChart3, roles: ['admin', 'teacher', 'parent'] },
    { name: 'Timetable', path: '/schedule', icon: Calendar, roles: ['admin', 'teacher', 'parent'] },
    { name: 'Leave Requests', path: '/leaves', icon: FileText, roles: ['admin', 'teacher', 'parent'] },
    { name: 'Face AI Registry', path: '/face-recognition', icon: ScanFace, roles: ['admin', 'teacher'] },
    { name: 'Security & Anti-Cheat', path: '/anticheat', icon: ShieldAlert, roles: ['admin'] },
    { name: 'System Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'teacher', 'parent'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-[#020406] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-hidden relative grid-bg">
      <div className="scanline pointer-events-none" />
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#020406]/95 backdrop-blur-xl border-r border-slate-800/40 flex flex-col lg:relative"
          >
            <div className="flex flex-col h-full relative">
               {/* Tactical Border Highlights */}
              <div className="absolute top-0 right-[-1px] w-[1px] h-20 bg-gradient-to-b from-cyan-500/50 to-transparent" />
              <div className="absolute bottom-0 right-[-1px] w-[1px] h-20 bg-gradient-to-t from-cyan-500/50 to-transparent" />
              
              <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.3)] rotate-3 border border-white/10 group">
                      <School className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white tracking-[0.2em] uppercase text-[10px] leading-tight">CORE-OS</span>
                      <span className="text-cyan-500 font-bold uppercase text-[9px] tracking-widest opacity-80">v.4.0.ALPHA</span>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)] px-2">
                  <div>
                    <div className="flex items-center gap-2 mb-6 px-2">
                       <div className="w-1 h-3 bg-cyan-500 rounded-full" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Nodes</p>
                    </div>
                    <nav className="space-y-1">
                      {filteredMenu.slice(0, 3).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group text-[10px] font-black uppercase tracking-[0.15em]",
                              isActive 
                                ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]" 
                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <item.icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-300 transition-colors")} />
                              <span>{item.name}</span>
                            </div>
                            {isActive && <motion.div layoutId="nav-tick" className="w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-6 px-2">
                       <div className="w-1 h-3 bg-slate-700 rounded-full" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Sub-Systems</p>
                    </div>
                    <nav className="space-y-1">
                      {filteredMenu.slice(3).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group text-[10px] font-black uppercase tracking-[0.15em]",
                              isActive 
                                ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]" 
                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <item.icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-300 transition-colors")} />
                              <span>{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-6 border-t border-slate-800/40">
                <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 mb-4 flex items-center gap-3 transition-all hover:bg-slate-900/60">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-cyan-500 font-black text-xs shadow-inner">
                    {user?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black truncate text-[10px] text-white uppercase tracking-wider mb-0.5">{user?.full_name}</p>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                       <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">{user?.role}</p>
                    </div>
                  </div>
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-600 hover:text-cyan-500 transition-colors cursor-pointer" />
                </div>
                
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/60 hover:text-rose-400 rounded-xl transition-all group text-[9px] font-black uppercase tracking-[0.2em] border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout [Clear_Session]</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-bg-main/60 backdrop-blur-2xl border-b border-slate-800/40 flex items-center justify-between px-10 relative z-40">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.1)]" />
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-500 hover:text-cyan-400 transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.1)]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <span className="text-white text-[11px] font-black uppercase tracking-[0.1em]">EDU-AI_TERMINAL</span>
               </div>
               <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">Network Integrity: 100%</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.3em] mb-0.5">System Time</span>
               <span className="text-[11px] text-white font-mono font-bold">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <div className="h-8 w-px bg-slate-800/40" />
            <button className="relative group p-2 rounded-lg bg-slate-900/30 border border-slate-800 hover:border-cyan-500/30 transition-all">
              <Bell className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full border-2 border-slate-900 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
