import React, { useState, useEffect } from 'react';
import { Sparkles, Play, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react';
import { Task, FlowSession } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { format } from 'date-fns';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface DashboardProps {
  tasks: Task[];
  sessions: FlowSession[];
  onStartFocus: (task: Task | null) => void;
}

export default function Dashboard({ tasks, sessions, onStartFocus }: DashboardProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completed && format(t.createdAt, 'yyyy-MM-dd') === format(Date.now(), 'yyyy-MM-dd')).length;
  
  const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgFocusScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length) 
    : 0;

  useEffect(() => {
    if (incompleteTasks.length > 0 && !aiSuggestion) {
      getAiSuggestion();
    }
  }, [incompleteTasks.length]);

  const getAiSuggestion = async () => {
    setLoadingAi(true);
    try {
      const taskList = incompleteTasks.map(t => `${t.title} (${t.energyRequired} energy, ${t.duration} min)`).join(', ');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given these tasks: ${taskList}. Which ONE should I focus on right now to maximize impact? Provide a 1-sentence punchy recommendation.`,
      });
      setAiSuggestion(response.text || "Focus on your highest priority task.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSuggestion("Focus on your most important task first.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
        <div>
          <p className="text-text-dim text-[10px] md:text-sm font-medium uppercase tracking-widest mb-2">Welcome Back</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">Your Flow State</h2>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xl md:text-3xl font-light">{format(new Date(), 'EEEE, MMM do')}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
          label="Completed Today" 
          value={completedToday.toString()} 
          subtext="Tasks finished"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-blue-400" />} 
          label="Focus Time" 
          value={`${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m`} 
          subtext="Total immersion"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />} 
          label="Avg. Flow Score" 
          value={`${avgFocusScore}%`} 
          subtext="Focus quality"
        />
      </div>

      {/* AI Recommendation */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-sidebar-bg border border-border-main rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-text-main/5 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[10px] md:text-sm font-semibold text-text-dim uppercase tracking-widest mb-1">AI Recommendation</h3>
            <p className="text-lg md:text-xl font-light leading-relaxed">
              {loadingAi ? "Analyzing your workflow..." : aiSuggestion || "Add some tasks to get AI recommendations."}
            </p>
          </div>
          <button 
            onClick={() => onStartFocus(incompleteTasks[0] || null)}
            className="w-full md:w-auto bg-text-main text-app-bg px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Flow</span>
          </button>
        </div>
      </div>

      {/* Task Preview */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-light tracking-tight">Up Next</h3>
          <button className="text-text-dim hover:text-text-main text-sm font-medium transition-colors">View All Tasks</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incompleteTasks.slice(0, 4).map(task => (
            <div key={task.id} className="bg-text-main/5 border border-border-main hover:border-text-main/20 p-5 rounded-2xl transition-all group flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  task.energyRequired === 'high' ? "bg-red-500/10 text-red-400" :
                  task.energyRequired === 'medium' ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-blue-500/10 text-blue-400"
                )}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-xs text-text-dim">{task.duration} mins • {task.energyRequired} energy</p>
                </div>
              </div>
              <button 
                onClick={() => onStartFocus(task)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-text-main/10 rounded-lg transition-all"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          ))}
          {incompleteTasks.length === 0 && (
            <div className="col-span-2 py-12 text-center border-2 border-dashed border-border-main rounded-3xl">
              <p className="text-text-dim">No tasks planned. Time to recharge or plan ahead.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string, subtext: string }) {
  return (
    <div className="bg-text-main/5 border border-border-main p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-text-main/5 rounded-lg">{icon}</div>
        <span className="text-[10px] uppercase tracking-widest text-text-dim/50 font-bold">Live</span>
      </div>
      <div>
        <p className="text-3xl font-light tracking-tight">{value}</p>
        <p className="text-xs text-text-dim font-medium uppercase tracking-wider mt-1">{label}</p>
      </div>
      <p className="text-[10px] text-text-dim/40 italic">{subtext}</p>
    </div>
  );
}
