import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FlowSession, Task } from '../types';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface AnalyticsProps {
  sessions: FlowSession[];
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics({ sessions, tasks }: AnalyticsProps) {
  // Focus Time Trend (Last 7 Days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const trendData = last7Days.map(day => {
    const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), day));
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
    return {
      date: format(day, 'MMM dd'),
      minutes: totalMinutes,
    };
  });

  // Energy Level Distribution
  const energyData = [
    { name: 'High', value: tasks.filter(t => t.energyRequired === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.energyRequired === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.energyRequired === 'low').length },
  ].filter(d => d.value > 0);

  // Focus Score Distribution
  const scoreData = sessions.map(s => ({
    score: s.focusScore,
    duration: s.duration,
  }));

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgFocusScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length) 
    : 0;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 md:space-y-10 pb-24 md:pb-20">
      <header>
        <h2 className="text-3xl md:text-4xl font-light tracking-tight">Analytics</h2>
        <p className="text-text-dim text-[10px] md:text-sm mt-1">Insights into your productivity and flow patterns.</p>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Clock className="w-5 h-5 text-blue-400" />} 
          label="Total Focus Time" 
          value={`${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`} 
        />
        <MetricCard 
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />} 
          label="Avg. Focus Score" 
          value={`${avgFocusScore}%`} 
        />
        <MetricCard 
          icon={<Target className="w-5 h-5 text-emerald-400" />} 
          label="Completion Rate" 
          value={`${completionRate}%`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Focus Time Trend */}
        <div className="bg-sidebar-bg border border-border-main p-8 rounded-[40px] space-y-6">
          <h3 className="text-xl font-light tracking-tight">Focus Time Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-dim)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--text-dim)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--sidebar-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Distribution */}
        <div className="bg-sidebar-bg border border-border-main p-6 md:p-8 rounded-[40px] space-y-6 flex flex-col">
          <h3 className="text-xl font-light tracking-tight">Energy Distribution</h3>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {energyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--sidebar-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 pr-8">
              {energyData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-text-dim font-medium uppercase tracking-widest">{d.name} Energy</span>
                  <span className="text-sm font-light">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-text-main/5 border border-border-main p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex items-center space-x-4 md:space-x-6">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-text-main/5 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-light tracking-tight">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-text-dim/50 font-bold mt-1">{label}</p>
      </div>
    </div>
  );
}
