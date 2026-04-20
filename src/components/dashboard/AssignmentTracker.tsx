import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, CheckCircle2, Circle, Clock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { StudyTask } from '../../types';

export function AssignmentTracker() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      if (!user) return;
      const q = query(collection(db, 'study_tasks'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyTask)));
      setLoading(false);
    }
    fetchTasks();
  }, [user]);

  const toggleTask = async (taskId: string, current: boolean) => {
    const taskRef = doc(db, 'study_tasks', taskId);
    await updateDoc(taskRef, {
      completed: !current,
      completedAt: !current ? Date.now() : null
    });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !current } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <ClipboardList className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight uppercase italic">Intellectual Contracts</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-50">Assignment Progress Tracking</p>
            </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-bg-deep border border-border-subtle rounded-full overflow-hidden">
            <Sparkles className="w-3 h-3 text-accent-blue" />
            <span className="text-[10px] font-black text-text-main uppercase tracking-tighter">AI Managed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-bg-panel animate-pulse rounded-2xl" />)
        ) : (
            <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                    <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "professional-card p-5 group flex items-start gap-4 transition-all hover:translate-y-[-2px] hover:shadow-xl",
                            task.completed ? "opacity-60 grayscale-[0.5]" : "border-l-4 border-l-purple-500"
                        )}
                    >
                        <button 
                            onClick={() => toggleTask(task.id, !!task.completed)}
                            className={cn(
                                "mt-1 transition-colors",
                                task.completed ? "text-accent-green" : "text-text-dim hover:text-purple-400"
                            )}
                        >
                            {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">{task.subject}</span>
                                {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-text-dim">
                                        <Clock className="w-3 h-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            <h3 className={cn("text-sm font-bold text-text-main truncate", task.completed && "line-through")}>{task.title}</h3>
                            <p className="text-[11px] text-text-dim mt-1 line-clamp-1">{task.description}</p>
                            
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1 flex-1 bg-bg-deep rounded-full overflow-hidden">
                                     <div className="h-full bg-purple-500" style={{ width: task.completed ? '100%' : '20%' }} />
                                </div>
                                <span className="text-[10px] font-black text-text-main">{task.completed ? '100%' : '20%'}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        )}

        {!loading && tasks.length === 0 && (
            <div className="col-span-full py-12 text-center bg-bg-panel border border-dashed border-border-subtle rounded-[2rem]">
                <div className="w-12 h-12 bg-bg-deep rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-dim opacity-30">
                    <ClipboardList className="w-6 h-6" />
                </div>
                <p className="text-xs text-text-dim font-medium uppercase tracking-widest">No active contracts found.</p>
                <button className="text-[10px] font-black text-accent-blue uppercase mt-4 hover:tracking-widest transition-all">Generate Recommended Schedule</button>
            </div>
        )}
      </div>
    </div>
  );
}
