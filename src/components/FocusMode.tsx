import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Volume2, VolumeX, Plus, Minus } from 'lucide-react';
import { Task, FlowSession } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FocusModeProps {
  task: Task | null;
  onComplete: (session: FlowSession) => void;
  onCancel: () => void;
}

export default function FocusMode({ task, onComplete, onCancel }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState((task?.duration || 25) * 60);
  const [initialTime, setInitialTime] = useState((task?.duration || 25) * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [showComplete, setShowComplete] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showManualSub, setShowManualSub] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('5');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addTime = (minutes: number) => {
    const secondsToAdd = minutes * 60;
    setTimeLeft(prev => prev + secondsToAdd);
    setInitialTime(prev => prev + secondsToAdd);
  };

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        // Randomly fluctuate focus score slightly to simulate "flow tracking"
        setFocusScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.55))));
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    setShowComplete(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-app-bg p-10 relative overflow-hidden text-text-main">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-1000",
          isActive ? "bg-blue-500/10 opacity-100" : "bg-text-main/5 opacity-50"
        )} />
      </div>

      {/* Top Controls */}
      <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-10">
        <button onClick={onCancel} className="p-3 hover:bg-text-main/5 rounded-full transition-colors text-text-dim hover:text-text-main">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 hover:bg-text-main/5 rounded-full transition-colors text-text-dim hover:text-text-main">
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Currently Immersed In</p>
          <h2 className="text-3xl font-light tracking-tight">{task?.title || "Deep Work Session"}</h2>
        </div>

        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-main/5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="100%"
              initial={{ strokeDashoffset: "100%" }}
              animate={{ strokeDashoffset: `${100 - progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
              className="text-text-main"
            />
          </svg>

          <div className="text-center space-y-4">
            <motion.div 
              key={timeLeft}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-8xl font-extralight tracking-tighter tabular-nums"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-text-dim/70 font-bold">Focus Score</span>
              <span className="text-xl font-light text-blue-400">{Math.round(focusScore)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button 
            onClick={() => {
              setTimeLeft(initialTime);
              setIsActive(false);
            }}
            className="p-4 hover:bg-text-main/5 rounded-full transition-colors text-text-dim hover:text-text-main"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2 items-center">
              <button 
                onClick={() => addTime(5)}
                className="px-3 py-1 bg-text-main/5 border border-border-main rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-text-main/10 transition-colors"
              >
                +5m
              </button>
              <button 
                onClick={() => addTime(10)}
                className="px-3 py-1 bg-text-main/5 border border-border-main rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-text-main/10 transition-colors"
              >
                +10m
              </button>
              
              <div className="relative flex space-x-1">
                {/* Manual Subtract */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowManualSub(!showManualSub);
                      setShowManualAdd(false);
                    }}
                    className="p-1 bg-text-main/5 border border-border-main rounded-full hover:bg-text-main/10 transition-colors"
                    title="Subtract time"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showManualSub && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-sidebar-bg border border-border-main p-2 rounded-xl flex items-center space-x-2 shadow-2xl z-50"
                      >
                        <input 
                          type="number" 
                          value={manualMinutes}
                          onChange={(e) => setManualMinutes(e.target.value)}
                          className="w-12 bg-text-main/5 border border-border-main rounded-lg px-2 py-1 text-xs focus:outline-none"
                          autoFocus
                          placeholder="Mins"
                        />
                        <button 
                          onClick={() => {
                            const mins = parseInt(manualMinutes);
                            if (!isNaN(mins) && mins > 0) {
                              addTime(-mins);
                              setShowManualSub(false);
                            }
                          }}
                          className="p-1 bg-text-main text-app-bg rounded-lg"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Manual Add */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowManualAdd(!showManualAdd);
                      setShowManualSub(false);
                    }}
                    className="p-1 bg-text-main/5 border border-border-main rounded-full hover:bg-text-main/10 transition-colors"
                    title="Add time"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showManualAdd && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-sidebar-bg border border-border-main p-2 rounded-xl flex items-center space-x-2 shadow-2xl z-50"
                      >
                        <input 
                          type="number" 
                          value={manualMinutes}
                          onChange={(e) => setManualMinutes(e.target.value)}
                          className="w-12 bg-text-main/5 border border-border-main rounded-lg px-2 py-1 text-xs focus:outline-none"
                          autoFocus
                          placeholder="Mins"
                        />
                        <button 
                          onClick={() => {
                            const mins = parseInt(manualMinutes);
                            if (!isNaN(mins) && mins > 0) {
                              addTime(mins);
                              setShowManualAdd(false);
                            }
                          }}
                          className="p-1 bg-text-main text-app-bg rounded-lg"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-20 h-20 bg-text-main text-app-bg rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-text-main/10"
            >
              {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          <button 
            onClick={handleComplete}
            className="p-4 hover:bg-text-main/5 rounded-full transition-colors text-text-dim hover:text-emerald-400"
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-sidebar-bg border border-border-main rounded-[40px] p-12 max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-light tracking-tight">Flow Achieved</h3>
                <p className="text-text-dim">You've successfully completed your deep work session.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-border-main">
                <div>
                  <p className="text-2xl font-light">{Math.round((initialTime - timeLeft) / 60)}m</p>
                  <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Duration</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-blue-400">{Math.round(focusScore)}%</p>
                  <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Avg. Focus</p>
                </div>
              </div>

              <button 
                onClick={() => onComplete({
                  id: crypto.randomUUID(),
                  uid: '', // Will be set by App.tsx
                  taskId: task?.id || '',
                  startTime: Date.now() - (initialTime - timeLeft) * 1000,
                  endTime: Date.now(),
                  duration: Math.round((initialTime - timeLeft) / 60),
                  focusScore: Math.round(focusScore)
                })}
                className="w-full bg-text-main text-app-bg py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
              >
                Log Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
