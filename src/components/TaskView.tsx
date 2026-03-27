import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Zap, Clock, AlertCircle } from 'lucide-react';
import { Task, EnergyLevel } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'uid'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskView({ tasks, onAddTask, onToggle, onDelete }: TaskViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [duration, setDuration] = useState(25);
  const [priority, setPriority] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({ title, energyRequired: energy, duration, priority });
    setTitle('');
    setIsAdding(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.priority - a.priority;
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 md:space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">Tasks</h2>
          <p className="text-text-dim text-[10px] md:text-sm mt-1">Manage your deep work and routine items.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-text-main text-app-bg p-2 md:p-3 rounded-full hover:scale-110 transition-transform shrink-0"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-text-main/5 border border-border-main rounded-3xl p-8 space-y-6 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Task Title</label>
              <input 
                autoFocus
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you focusing on?"
                className="w-full bg-transparent text-2xl font-light border-none focus:ring-0 p-0 placeholder:text-text-dim/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Energy Required</label>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high'] as EnergyLevel[]).map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEnergy(e)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium border transition-all capitalize",
                        energy === e ? "bg-text-main text-app-bg border-text-main" : "border-border-main text-text-dim hover:border-text-main/20"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Duration (min)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-text-main/5 border border-border-main rounded-xl px-4 py-2 text-sm focus:border-text-main/30 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Priority (1-5)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full accent-text-main"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border-main">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 text-sm font-medium text-text-dim hover:text-text-main transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-text-main text-app-bg px-8 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                Create Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {sortedTasks.map(task => (
          <motion.div 
            layout
            key={task.id} 
            className={cn(
              "group bg-sidebar-bg border border-border-main p-6 rounded-3xl flex items-center space-x-6 transition-all",
              task.completed ? "opacity-50 grayscale" : "hover:border-text-main/20"
            )}
          >
            <button 
              onClick={() => onToggle(task.id)}
              className="text-text-dim hover:text-text-main transition-colors"
            >
              {task.completed ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <Circle className="w-8 h-8" />}
            </button>

            <div className="flex-1 min-w-0">
              <h4 className={cn("text-xl font-light truncate", task.completed && "line-through")}>{task.title}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-text-dim/50">
                  <Zap className={cn("w-3 h-3 mr-1", 
                    task.energyRequired === 'high' ? "text-red-400" : 
                    task.energyRequired === 'medium' ? "text-yellow-400" : "text-blue-400"
                  )} />
                  {task.energyRequired}
                </span>
                <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-text-dim/50">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.duration}m
                </span>
                {task.priority >= 4 && (
                  <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-orange-400">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    High Priority
                  </span>
                )}
              </div>
            </div>

            <button 
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-text-dim hover:text-red-400 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-border-main rounded-[40px]">
            <p className="text-text-dim text-lg font-light">Your task list is empty. Start by adding your first goal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
