import { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Camera,
  Fingerprint,
  RefreshCcw, 
  ShieldCheck, 
  UserCheck, 
  History,
  AlertTriangle,
  Play,
  StopCircle,
  BrainCircuit,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export function FaceRecognition() {
  const [isScanning, setIsScanning] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [overlayText, setOverlayText] = useState('Position frame over face');
  
  // Training State
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [trainingStep, setTrainingStep] = useState<'idle' | 'settings' | 'capturing' | 'confirming' | 'processing' | 'success' | 'error'>('idle');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [trainingStudentId, setTrainingStudentId] = useState('');
  const [numCaptures, setNumCaptures] = useState(5);
  const [trainingQuality, setTrainingQuality] = useState<{ brightness: number; blur: number; message: string }>({ brightness: 0, blur: 0, message: 'Position face' });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    api.getStudents().then(setStudents);
  }, []);

  useEffect(() => {
    let interval: any;
    if (showTrainModal && trainingStep === 'capturing' && videoRef.current) {
      interval = setInterval(() => {
        checkQuality();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [showTrainModal, trainingStep]);

  const checkQuality = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness = brightness / (data.length / 4);

    let diff = 0;
    for (let i = 0; i < data.length - 4; i += 4) {
      diff += Math.abs(data[i] - data[i + 4]);
    }
    const blurScore = diff / (data.length / 4);

    let message = "Optimal Lighting";
    if (brightness < 60) message = "Environment Too Dark";
    else if (brightness > 220) message = "Environment Too Bright";
    else if (blurScore < 10) message = "Motion Blur Detected";

    setTrainingQuality({ brightness, blur: blurScore, message });
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const img = canvas.toDataURL('image/jpeg');
    
    setCapturedImages(prev => {
      const newList = [...prev, img];
      setTrainingProgress(Math.min((newList.length / numCaptures) * 100, 100));
      if (newList.length >= numCaptures) {
        setTrainingStep('confirming');
      }
      return newList;
    });
  };

  const processTraining = async () => {
    setTrainingStep('processing');
    try {
      await api.trainFace({
        student_id: parseInt(trainingStudentId),
        images: capturedImages
      });
      setTrainingStep('success');
    } catch (e) {
      setTrainingStep('error');
    }
  };

  const startTraining = () => {
    setCapturedImages([]);
    setTrainingProgress(0);
    setTrainingStep('settings');
    setShowTrainModal(true);
    if (!videoActive) {
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setVideoActive(true);
      }
    } catch (err) {
      alert('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setVideoActive(false);
    setIsScanning(false);
  };

  const handleScan = async () => {
    if (!videoActive || !videoRef.current) return;
    setIsScanning(true);
    setMatch(null);
    setOverlayText('ANALYZING FACIAL TOPOLOGY...');

    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Capture 3 frames with 300ms interval for liveness detection
    for(let i = 0; i < 3; i++) {
        if (ctx && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0);
            frames.push(canvas.toDataURL('image/jpeg'));
        }
        if (i < 2) {
            setOverlayText(`CAPTURING TEXTURE MAP ${i+1}/3...`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    setOverlayText('VERIFYING LIVENESS & IDENTITY...');

    // Real AI Processing Call
    try {
      const resp = await api.verifyFace({
        frames: frames,
        location: { lat: 13.0827, lng: 80.2707 }
      });
      
      if (resp.success && resp.student_id) {
        // Now update attendance
        const attendResp = await api.updateAttendance({
          student_id: resp.student_id,
          status: 'Present',
          date: format(new Date(), 'yyyy-MM-dd'),
          method: 'Face Recognition'
        });

        const newMatch = {
          name: resp.full_name,
          id: 'ROLL-' + resp.student_id, // Simplified for now
          confidence: (resp.confidence! * 100).toFixed(2),
          liveness: resp.liveness_score ? (resp.liveness_score * 100).toFixed(2) : undefined,
          time: format(new Date(), 'HH:mm:ss'),
          sms_status: attendResp.sms_status
        };
        
        setMatch(newMatch);
        setHistory(prev => [newMatch, ...prev].slice(0, 5));
        setOverlayText('Match Confirmed');
      } else {
        setOverlayText(resp.error || 'Identity Unknown');
      }
    } catch (e) {
      setOverlayText('Server Error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800/60 pb-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-cyan-500/30 underline-offset-8">Bio_Verification</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
             <span className="w-1 h-3 bg-slate-700 inline-block" />
             AI Biometric Authentication Node • TN-V4.0.ALPHA
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 backdrop-blur-xl">
          <select 
            value={trainingStudentId} 
            onChange={(e) => setTrainingStudentId(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black text-slate-400 px-4 py-2 outline-none cursor-pointer uppercase tracking-[0.2em] focus:text-white transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-400">Select Subject</option>
            {students.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.full_name} ({s.roll_number})</option>
            ))}
          </select>
          <div className="w-[1px] h-6 bg-slate-800" />
          <button 
            onClick={startTraining}
            className="flex items-center gap-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-lg transition-all shadow-[0_0_15px_rgba(8,145,178,0.2)] active:scale-95"
          >
            <BrainCircuit className="w-4 h-4" /> Train_Encoding
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Scanner Control Panel */}
        <div className="xl:col-span-8 flex flex-col gap-10">
          <div className="relative aspect-video glass-card rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center group">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            
            {videoActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover grayscale brightness-110 contrast-125 transition-all duration-700"
              />
            ) : (
              <div className="text-center flex flex-col items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-inner group-hover:border-cyan-500/30 transition-all">
                  <Camera className="w-10 h-10 text-slate-800 group-hover:text-cyan-900/50" />
                </div>
                <div className="space-y-1">
                   <p className="text-slate-600 font-black text-[10px] tracking-[0.4em] uppercase">Visual_Node_Offline</p>
                   <p className="text-[8px] text-slate-800 font-mono uppercase tracking-widest">Connect capture hardware to initialize</p>
                </div>
              </div>
            )}

            {/* AI HUD Overlay */}
            <AnimatePresence>
              {videoActive && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute inset-0 pointer-events-none"
                >
                  <div className="scanline" />
                  
                  {/* Corner Targets */}
                  <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl" />
                  <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl" />
                  <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl" />
                  <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl" />

                  {/* Identification Box */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-cyan-500/20 rounded-2xl bg-cyan-500/5 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-6">
                      <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[9px] font-black text-cyan-400 bg-slate-950/80 backdrop-blur-md py-1.5 px-5 rounded-full border border-cyan-500/30 whitespace-nowrap uppercase tracking-[0.3em] shadow-lg"
                      >
                        {overlayText}
                      </motion.div>
                    </div>
                  </div>

                  {/* Detailed Telemetry */}
                  <div className="absolute top-10 right-10 text-right space-y-4">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-cyan-500/60 uppercase tracking-[0.2em]">Sensor_Readout</p>
                        <div className="flex items-center gap-2 justify-end">
                           <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <motion.div animate={{ width: ['40%', '80%', '40%'] }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-cyan-500" />
                           </div>
                           <span className="text-[7px] font-mono text-cyan-500/40 uppercase">Lux_0.42</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-cyan-500/60 uppercase tracking-[0.2em]">Signal_Lock</p>
                        <p className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase">Searching...</p>
                     </div>
                  </div>

                  {/* Scanning Bar */}
                  {isScanning && (
                    <motion.div 
                      layoutId="scan-bar"
                      initial={{ top: '5%', opacity: 0 }}
                      animate={{ top: '95%', opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        top: { duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" },
                        opacity: { duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }
                      }}
                      className="absolute left-4 right-4 h-1 bg-cyan-400 shadow-[0_0_30px_3px_rgba(34,211,238,0.8)] z-10 rounded-full"
                    >
                      {/* Scanner Beam Blur Effect */}
                      <div className="absolute inset-x-0 top-0 bottom-0 bg-white/50 blur-[2px] rounded-full" />
                      <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-cyan-400/20 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 -bottom-8 h-8 bg-gradient-to-b from-cyan-400/20 to-transparent pointer-events-none" />
                    </motion.div>
                  )}

                  <div className="absolute bottom-10 left-10 flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-cyan-500/40 font-black uppercase tracking-widest">COORDS: 13.0827°N / 80.2707°E</span>
                    <span className="text-[8px] font-mono text-cyan-500/40 font-black uppercase tracking-widest">TIMESTAMP: {format(new Date(), 'HH:mm:ss:SS')}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Button Overlay */}
            <AnimatePresence>
              {!videoActive && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6,182,212,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCamera}
                  className="absolute p-8 bg-cyan-600 text-white rounded-full shadow-2xl relative z-10 border border-white/20 active:bg-cyan-500 transition-all"
                >
                  <Play className="w-8 h-8 fill-current" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6">
             {videoActive ? (
               <button 
                onClick={handleScan}
                disabled={isScanning}
                className={cn(
                  "flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl font-black transition-all disabled:opacity-50 text-[11px] tracking-[0.3em] uppercase relative overflow-hidden",
                  isScanning ? "bg-slate-900 text-cyan-500 border border-cyan-500/20" : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_30px_rgba(8,145,178,0.3)] active:scale-95"
                )}
               >
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                 {isScanning ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                 {isScanning ? 'Synchronizing_Identity...' : 'Initiate_Visual_Capture'}
               </button>
             ) : (
               <div className="flex-1 glass-card border border-white/5 p-8 rounded-2xl text-center flex flex-col items-center gap-3">
                 <AlertTriangle className="w-6 h-6 text-amber-500/40" />
                 <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">System_Halted: Sensor_Uplink_Required</p>
               </div>
             )}
             
             {videoActive && (
               <button 
                onClick={stopCamera}
                className="w-20 h-16 bg-rose-600/10 text-rose-500 border border-rose-500/30 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all group active:scale-95"
               >
                 <StopCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
               </button>
             )}
          </div>
        </div>

        {/* Diagnostic & Results Sidebar */}
        <div className="xl:col-span-4 space-y-10">
          <AnimatePresence mode="wait">
            {match ? (
              <motion.div
                key="match-result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-emerald-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-white/20"
              >
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-70 block mb-1.5">Node_Access_Granted</span>
                      <h4 className="text-xl font-black tracking-wider uppercase mb-1">{match.name}</h4>
                      <p className="text-[10px] font-mono font-black opacity-50 tracking-widest">{match.id}</p>
                    </div>
                  </div>

                  <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                        <span>Neural_Confidence</span>
                        <span className="font-mono text-xs">{match.confidence}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${match.confidence}%` }}
                          className="absolute top-0 bottom-0 left-0 bg-white shadow-[0_0_15px_white]"
                        />
                      </div>
                    </div>
                    
                    {match.liveness && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                          <span>Liveness_Score</span>
                          <span className="font-mono text-xs">{match.liveness}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${match.liveness}%` }}
                            className={cn(
                              "absolute top-0 bottom-0 left-0 shadow-[0_0_15px]",
                              Number(match.liveness) >= 80 ? "bg-emerald-400 shadow-emerald-400" : "bg-amber-400 shadow-amber-400"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[9px] font-black tracking-[0.2em] uppercase">
                     <div className="flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 text-white/60" />
                       Registry_Locked
                     </div>
                     <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                        {match.sms_status === 'sent' ? 'TX_SENT' : 'TX_OK'}
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card border border-white/5 p-10 rounded-3xl h-72 flex flex-col items-center justify-center text-center gap-6 group cursor-default relative overflow-hidden"
              >
                <div className="absolute inset-0 grid-bg opacity-10" />
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-900 group-hover:border-cyan-500/30 transition-all shadow-inner relative z-10">
                  <Scan className="w-8 h-8 text-cyan-600/40 group-hover:text-cyan-400 group-hover:animate-pulse transition-all" />
                </div>
                <div className="space-y-2 relative z-10">
                  <p className="font-black text-xs uppercase tracking-[0.4em] text-white">Scanner_Idle</p>
                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.2em] max-w-[200px] leading-relaxed mx-auto">Active authentication node awaiting visual biometric sync</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-card border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl" />
            <h3 className="text-[10px] font-black font-mono text-cyan-500/60 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
               <History className="w-4 h-4" />
               Registry_Logs
            </h3>
            <div className="space-y-6">
              {history.length > 0 ? history.map((h, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center gap-5 group py-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center text-cyan-500/30 font-mono text-[9px] font-black group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                    {h.confidence}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-300 truncate uppercase tracking-wider group-hover:text-white transition-colors">{h.name}</p>
                    <p className="text-[8px] text-slate-600 font-mono tracking-widest uppercase mt-0.5">{h.id} • {h.time}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="py-10 text-center text-slate-800 text-[9px] font-black uppercase tracking-[0.4em] font-mono italic">No_Local_History</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTrainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-cyan-500" />
                  Biometric Training Module
                </h3>
                <button onClick={() => setShowTrainModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-10 text-center space-y-8">
                {trainingStep === 'settings' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-bold uppercase tracking-widest text-lg">Training Parameters</h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Configure biometric data acquisition node</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 text-left">
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Target Student</label>
                      <select 
                        value={trainingStudentId} 
                        onChange={(e) => setTrainingStudentId(e.target.value)}
                        className="bg-bg-card border border-slate-800 text-xs font-bold text-white px-4 py-3 rounded-lg outline-none focus:border-cyan-500 transition-all uppercase tracking-widest w-full"
                      >
                        <option value="">Select Target...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>
                        ))}
                      </select>

                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Dataset Size (Images)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="3" max="20" step="1" 
                          value={numCaptures} 
                          onChange={(e) => setNumCaptures(parseInt(e.target.value))}
                          className="flex-1 accent-cyan-500"
                        />
                        <span className="text-white font-mono text-xl">{numCaptures}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if(!trainingStudentId) alert('Select a student first');
                        else setTrainingStep('capturing');
                      }}
                      className="w-full py-4 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-cyan-500 transition-all"
                    >
                      Initialize Acquisition
                    </button>
                  </div>
                )}

                {trainingStep === 'capturing' && (
                  <>
                    <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 mx-auto flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                      <Camera className="w-10 h-10 text-cyan-500" />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-white font-bold uppercase tracking-widest text-lg">Capturing Biometrics</h4>
                       <div className="bg-slate-900/50 p-4 rounded border border-slate-800 space-y-3 w-full">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Environment</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              trainingQuality.message.includes('Optimal') ? "text-emerald-400" : "text-amber-400"
                            )}>
                               {trainingQuality.message}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-left">
                            <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest">
                              <span>Brightness</span>
                              <span>{Math.round(trainingQuality.brightness)}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                              <motion.div 
                                className={cn("h-full", trainingQuality.brightness > 60 && trainingQuality.brightness < 220 ? "bg-emerald-500" : "bg-amber-500")}
                                animate={{ width: `${Math.min((trainingQuality.brightness / 255) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest">
                              <span>Motion Stability</span>
                              <span>Score: {Math.round(trainingQuality.blur)}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden flex flex-row-reverse">
                              <motion.div 
                                className={cn("h-full", trainingQuality.blur >= 10 ? "bg-emerald-500" : "bg-amber-500")}
                                animate={{ width: `${Math.min((trainingQuality.blur / 30) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                       </div>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Progress: {capturedImages.length} / {numCaptures}</p>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${trainingProgress}%` }}
                        className="absolute top-0 bottom-0 left-0 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />
                    </div>
                    <button 
                      onClick={handleCapture}
                      className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 transition-all"
                    >
                      Capture Frame
                    </button>
                  </>
                )}

                {trainingStep === 'confirming' && (
                  <div className="space-y-6">
                    <h4 className="text-white font-bold uppercase tracking-widest text-lg">Confirm Dataset</h4>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/50 rounded border border-slate-800">
                      {capturedImages.map((img, i) => (
                        <div key={i} className="aspect-square rounded border border-slate-800 overflow-hidden relative group">
                           <img src={img} className="w-full h-full object-cover grayscale" />
                           <button 
                            onClick={() => {
                                setCapturedImages(prev => {
                                    const next = prev.filter((_, idx) => idx !== i);
                                    setTrainingProgress((next.length / numCaptures) * 100);
                                    return next;
                                });
                            }}
                            className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                           >
                             <X className="w-4 h-4 text-white" />
                           </button>
                        </div>
                      ))}
                      {capturedImages.length < numCaptures && (
                        <button 
                            onClick={() => setTrainingStep('capturing')}
                            className="aspect-square rounded border border-dashed border-slate-700 flex items-center justify-center hover:bg-slate-800"
                        >
                            <Camera className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Verify image quality before neural encoding</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setCapturedImages([]);
                          setTrainingProgress(0);
                          setTrainingStep('capturing');
                        }}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] border border-slate-700"
                      >
                        Retake All
                      </button>
                      <button 
                        onClick={processTraining}
                        disabled={capturedImages.length === 0}
                        className="flex-[2] py-4 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 transition-all disabled:opacity-50"
                      >
                        Finalize & Encode
                      </button>
                    </div>
                  </div>
                )}

                {trainingStep === 'processing' && (
                  <div className="flex flex-col items-center justify-center gap-8 py-8 w-full">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-cyan-400 border-r-2 border-transparent"
                      />
                      <motion.div 
                        animate={{ rotate: -360, scale: [1, 0.95, 1] }} 
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-b-2 border-cyan-500 border-l-2 border-transparent opacity-70"
                      />
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin absolute" />
                    </div>
                    
                    <div className="w-full space-y-4 px-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-500/80">
                        <span>Generating Neural Encoding</span>
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }} 
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Processing...
                        </motion.span>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                        <motion.div
                          className="absolute top-0 bottom-0 left-0 bg-cyan-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />
                      </div>
                       <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest text-center mt-2">Applying deep learning filters to spatial data</p>
                    </div>
                  </div>
                )}

                {trainingStep === 'success' && (
                  <>
                    <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-lg">Training Complete</h4>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Biometric model synchronized with central registry</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowTrainModal(false);
                        api.getStudents().then(setStudents); // Refresh student list
                      }}
                      className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] border border-slate-700"
                    >
                      Return to Scanner
                    </button>
                  </>
                )}

                {trainingStep === 'error' && (
                  <>
                    <div className="w-32 h-32 rounded-full bg-rose-500/10 border-4 border-rose-500/20 mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-16 h-16 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-rose-400 font-bold uppercase tracking-widest text-lg">Encoding Failed</h4>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Internal error during biometric extraction</p>
                    </div>
                    <button 
                      onClick={() => setTrainingStep('confirming')}
                      className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] border border-slate-700"
                    >
                      Retry Encoding
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
