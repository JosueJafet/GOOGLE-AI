import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Timer, BarChart3, Settings, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { View, Task, FlowSession } from './types';
import Dashboard from './components/Dashboard';
import TaskView from './components/TaskView';
import FocusMode from './components/FocusMode';
import Analytics from './components/Analytics';
import Login from './components/Login';
import SettingsView from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { auth, onAuthStateChanged, signOut, db, collection, query, where, onSnapshot, User, setDoc, doc, deleteDoc, updateDoc, handleFirestoreError, OperationType } from './firebase';
import { Theme } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FlowSession[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zenith-theme') as Theme;
    return saved || 'dark';
  });

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove('light', 'dark');
      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    localStorage.setItem('zenith-theme', theme);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSessions([]);
      return;
    }

    const tasksQuery = query(collection(db, 'tasks'), where('uid', '==', user.uid));
    const sessionsQuery = query(collection(db, 'sessions'), where('uid', '==', user.uid));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => doc.data() as Task);
      setTasks(tasksData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    const unsubSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => doc.data() as FlowSession);
      setSessions(sessionsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions'));

    return () => {
      unsubTasks();
      unsubSessions();
    };
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'uid'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      id,
      uid: user.uid,
      createdAt: Date.now(),
      completed: false,
    };
    try {
      await setDoc(doc(db, 'tasks', id), newTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${id}`);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await updateDoc(doc(db, 'tasks', id), { completed: !task.completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const completeSession = async (session: FlowSession) => {
    if (!user) return;
    const sessionWithUid = { ...session, uid: user.uid };
    try {
      await setDoc(doc(db, 'sessions', session.id), sessionWithUid);
      if (session.taskId) {
        await toggleTask(session.taskId);
      }
      setView('dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sessions/${session.id}`);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-black" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-app-bg text-text-main font-sans overflow-hidden flex-col lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 border-r border-border-main flex-col p-8 space-y-10 bg-sidebar-bg">
        <div className="flex items-center space-x-4 px-2">
          <div className="w-10 h-10 bg-text-main rounded-2xl flex items-center justify-center shadow-2xl shadow-text-main/10">
            <Sparkles className="w-6 h-6 text-app-bg" />
          </div>
          <h1 className="text-2xl font-light tracking-tighter">Zenith Flow</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavItem 
            icon={<ListTodo className="w-5 h-5" />} 
            label="Tasks" 
            active={view === 'tasks'} 
            onClick={() => setView('tasks')} 
          />
          <NavItem 
            icon={<Timer className="w-5 h-5" />} 
            label="Focus Mode" 
            active={view === 'focus'} 
            onClick={() => setView('focus')} 
          />
          <NavItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Analytics" 
            active={view === 'analytics'} 
            onClick={() => setView('analytics')} 
          />
        </nav>

        <div className="pt-8 border-t border-border-main space-y-4">
          <div className="flex items-center space-x-4 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-text-dim/5 border border-border-main overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-text-dim" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
              <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Pro Member</p>
            </div>
          </div>
          <div className="space-y-1">
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={view === 'settings'}
              onClick={() => setView('settings')} 
            />
            <NavItem icon={<LogOut className="w-5 h-5" />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-app-bg pb-24 lg:pb-0">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {view === 'dashboard' && (
                <Dashboard 
                  tasks={tasks} 
                  sessions={sessions} 
                  onStartFocus={(task) => {
                    setActiveTask(task);
                    setView('focus');
                  }}
                />
              )}
              {view === 'tasks' && (
                <TaskView 
                  tasks={tasks} 
                  onAddTask={addTask} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask} 
                />
              )}
              {view === 'focus' && (
                <FocusMode 
                  task={activeTask} 
                  onComplete={completeSession}
                  onCancel={() => setView('dashboard')}
                />
              )}
              {view === 'analytics' && (
                <Analytics sessions={sessions} tasks={tasks} />
              )}
              {view === 'settings' && (
                <SettingsView 
                  theme={theme} 
                  onThemeChange={setTheme} 
                  onProfileUpdate={() => {
                    // Force re-render by creating a new user object
                    if (auth.currentUser) {
                      setUser({ ...auth.currentUser });
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-sidebar-bg/80 backdrop-blur-xl border-t border-border-main flex items-center justify-around px-6 z-40">
        <MobileNavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          active={view === 'dashboard'} 
          onClick={() => setView('dashboard')} 
        />
        <MobileNavItem 
          icon={<ListTodo className="w-5 h-5" />} 
          active={view === 'tasks'} 
          onClick={() => setView('tasks')} 
        />
        <MobileNavItem 
          icon={<Timer className="w-5 h-5" />} 
          active={view === 'focus'} 
          onClick={() => setView('focus')} 
        />
        <MobileNavItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          active={view === 'analytics'} 
          onClick={() => setView('analytics')} 
        />
        <MobileNavItem 
          icon={<Settings className="w-5 h-5" />} 
          active={view === 'settings'} 
          onClick={() => setView('settings')} 
        />
        <button onClick={handleSignOut} className="p-3 text-text-dim">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl transition-all relative",
        active ? "text-text-main bg-text-main/10" : "text-text-dim"
      )}
    >
      {icon}
      {active && <motion.div layoutId="mobile-nav-glow" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-text-main rounded-full blur-[1px]" />}
    </button>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
        active 
          ? "bg-text-main text-app-bg shadow-xl shadow-text-main/5" 
          : "text-text-dim hover:text-text-main hover:bg-text-main/5"
      )}
    >
      <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="font-medium text-sm tracking-tight">{label}</span>
      {active && <motion.div layoutId="nav-glow" className="absolute -left-1 w-1 h-6 bg-text-main rounded-full blur-[2px]" />}
    </button>
  );
}
