import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { FaceRecognition } from './pages/FaceRecognition';
import { Performance } from './pages/Performance';
import { LeaveRequests } from './pages/LeaveRequests';
import { Schedule } from './pages/Schedule';
import { Anticheat } from './pages/Anticheat';
import { Settings } from './pages/Settings';
import { User } from './types';

function AppContent() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, navigate, location]);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user && location.pathname !== '/login') {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      
      <Route element={<Layout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/attendance" element={<Attendance user={user} />} />
        <Route path="/students" element={<Students user={user} />} />
        <Route path="/teachers" element={<Teachers user={user} />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/leaves" element={<LeaveRequests />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/anticheat" element={<Anticheat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
