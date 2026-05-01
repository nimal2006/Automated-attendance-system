import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { User } from '../types';
import { ShieldAlert } from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOn, setIsOn] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const loginFormRef = useRef<HTMLDivElement>(null);
  const cordBeadRef = useRef<SVGCircleElement>(null);
  const cordLineRef = useRef<SVGLineElement>(null);
  const hitAreaRef = useRef<SVGCircleElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.codepen.io/605876/click.mp3');

    if (hitAreaRef.current) {
      Draggable.create(hitAreaRef.current, {
        type: 'y',
        bounds: { minY: 0, maxY: 60 },
        onDrag: function () {
          gsap.set(cordBeadRef.current, { y: this.y });
          gsap.set(cordLineRef.current, { attr: { y2: 180 + this.y } });
        },
        onRelease: function () {
          if (this.y > 30) {
            toggleLamp();
          }

          gsap.to([cordBeadRef.current, hitAreaRef.current], {
            y: 0,
            duration: 0.5,
            ease: 'back.out(2.5)',
          });
          gsap.to(cordLineRef.current, {
            attr: { y2: 180 },
            duration: 0.5,
            ease: 'back.out(2.5)',
          });
        },
      });
    }

    return () => {
      const drags = Draggable.get(hitAreaRef.current!);
      if (drags) drags.kill();
    };
  }, []);

  const toggleLamp = () => {
    setIsOn((prev) => {
      const nextState = !prev;
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      return nextState;
    });
  };

  useEffect(() => {
    if (isOn) {
      gsap.to(loginFormRef.current, {
        opacity: 1,
        y: 0,
        pointerEvents: 'all',
        duration: 0.7,
        ease: 'power3.out',
      });
    } else {
      gsap.to(loginFormRef.current, {
        opacity: 0,
        y: 30,
        pointerEvents: 'none',
        duration: 0.7,
        ease: 'power3.out',
      });
    }
  }, [isOn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOn) return;
    
    setLoading(true);
    setError('');

    try {
      const resp = await api.login({ username, password });
      onLogin(resp.user, resp.token);
    } catch (err: any) {
      setError(err.message || 'Login Failed');
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen grid flex-col items-center justify-center p-6 m-0 font-sans transition-colors duration-500 overflow-hidden relative ${
        isOn ? 'bg-[#1c1f24]' : 'bg-[#121417]'
      }`}
      style={{
        '--bg-color': '#121417',
        '--lamp-matte': '#e8e2d9',
        '--lamp-shade': '#f5f0e6',
        '--lamp-base': '#d1ccc2',
        '--glow-color': 'rgba(255, 214, 110, 0.3)',
        '--accent-color': '#d4a373',
      } as React.CSSProperties}
    >
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, var(--glow-color), transparent 70%)',
          opacity: isOn ? 1 : 0
        }}
      />
      
      <div className="flex items-center justify-center gap-8 z-10 flex-wrap w-full max-w-[1000px]">
        {/* Cute Lamp */}
        <div className="relative w-[280px] h-[400px] flex justify-center shrink-0">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 300">
            <ellipse
              className="transition-opacity duration-500 blur-[15px]"
              cx="100"
              cy="110"
              rx="60"
              ry="30"
              fill="#ffdb8a"
              style={{ opacity: isOn ? 0.6 : 0 }}
            />

            <rect fill="var(--lamp-base)" x="92" y="100" width="16" height="160" rx="8" />

            <rect fill="var(--lamp-base)" x="60" y="250" width="80" height="12" rx="6" />

            <g className="cursor-pointer">
              <line ref={cordLineRef} stroke="#555" strokeWidth="2" x1="130" y1="110" x2="130" y2="180" />
              <circle ref={cordBeadRef} fill="var(--accent-color)" cx="130" cy="190" r="6" />
              <circle ref={hitAreaRef} fill="transparent" cx="130" cy="190" r="25" />
            </g>

            {/* Mushroom Shade */}
            <path
              className="transition-all duration-500"
              d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z"
              fill={isOn ? '#fff' : 'var(--lamp-shade)'}
              style={{
                filter: isOn ? 'drop-shadow(0 0 30px rgba(255, 255, 200, 0.4))' : 'none',
              }}
            />
          </svg>
        </div>

        {/* Login Form */}
        <div
          ref={loginFormRef}
          className="bg-white/5 backdrop-blur-xl p-10 rounded-[30px] w-[340px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all shrink-0"
          style={{ opacity: 0, transform: 'translateY(30px)', pointerEvents: 'none' }}
        >
          <h2 className="text-white m-0 mb-6 font-medium text-center text-2xl">Welcome</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-xs font-medium text-center flex items-center justify-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[#999] text-sm ml-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="w-full px-4.5 py-3.5 bg-white/5 border border-transparent rounded-2xl text-white outline-none transition-all focus:border-[#d4a373] focus:bg-white/10 text-base"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[#999] text-sm ml-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4.5 py-3.5 bg-white/5 border border-transparent rounded-2xl text-white outline-none transition-all focus:border-[#d4a373] focus:bg-white/10 text-base"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !isOn}
              className="w-full p-4 mt-2 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] border-none rounded-2xl font-semibold text-[#121417] cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 text-base shadow-xl disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="mt-4 text-center">
              <p className="text-xs text-[#999]">Hint: Try admin123 or parent123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


