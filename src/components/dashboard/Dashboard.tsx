import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { BookOpen, Brain, ArrowUpRight, CheckCircle, Clock, GraduationCap } from 'lucide-react';
import { generateStudyPlan } from '../../lib/gemini';
import { getLeaderboard } from '../../lib/gamification';
import { StudyTask } from '../../types';
import { cn } from '../../lib/utils';
import { AssignmentTracker } from './AssignmentTracker';
import { DashboardStats } from './DashboardStats';
import { ConceptMap } from '../mentor/ConceptMap';

export function Dashboard({ setActiveTab }: { setActiveTab: (tab: any) => void }) {
  const { profile, user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Mocked neural map for the dashboard to show 'Unique' insight
  const neuralData = {
    nodes: [
      { id: profile?.subjects?.[0] || 'Subject 1', group: 1 },
      { id: profile?.subjects?.[1] || 'Subject 2', group: 1 },
      { id: 'Critical Thinking', group: 2 },
      { id: 'Advanced Logic', group: 2 },
      { id: 'Mastery', group: 1 },
    ],
    links: [
      { source: profile?.subjects?.[0] || 'Subject 1', target: 'Critical Thinking', value: 2 },
      { source: profile?.subjects?.[1] || 'Subject 2', target: 'Critical Thinking', value: 1 },
      { source: 'Critical Thinking', target: 'Advanced Logic', value: 5 },
      { source: 'Advanced Logic', target: 'Mastery', value: 3 },
    ]
  };

  useEffect(() => {
    async function loadTasks() {
      if (!user || !profile) return;
      
      const q = query(collection(db, 'study_tasks'), where('userId', '==', user.uid), limit(5));
      const snap = await getDocs(q);
      if (snap.empty) {
        setLoadingTasks(true);
        const autoTasks = await generateStudyPlan(profile);
        setTasks(autoTasks.map((t: any, i: number) => ({ ...t, id: String(i), completed: false })));
      } else {
        setTasks(snap.docs.map(d => ({ ...d.data(), id: d.id } as StudyTask)));
      }
      setLoadingTasks(false);
    }
    loadTasks();
    
    getLeaderboard().then(setLeaderboard);
  }, [user, profile]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="subject-tag-professional">{profile?.subjects?.[0] || 'General'}</span>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Welcome back, {user?.displayName || 'Scholar'}</h1>
            <p className="text-sm text-text-dim mt-0.5">Ready to master some new concepts today?</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('mentor')}
          className="professional-button-primary shadow-[0_2px_10px_rgba(59,130,246,0.3)] active:scale-95"
        >
          Resume Learning
        </button>
      </header>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-10">
          <AssignmentTracker />
          <div className="professional-card p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-lg font-bold text-text-main uppercase tracking-tight">Academic Performance</h2>
                   <p className="text-[10px] text-text-dim uppercase tracking-widest font-black opacity-50">Subject Proficiency Neural Map</p>
                </div>
                <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue">
                    <BookOpen className="w-5 h-5" />
                </div>
            </div>
            
            {/* Neural Map for Dashboard */}
            <div className="mb-12">
               <ConceptMap data={neuralData} />
            </div>

            <div className="space-y-6">
               {(profile?.subjects?.length ? profile.subjects : ['General']).slice(0, 3).map((wa) => (
                   <div key={wa} className="group cursor-pointer space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-sm text-text-main font-bold uppercase tracking-tight">{wa}</span>
                         <span className="text-xs text-accent-blue font-black font-mono">78%</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '78%' }}
                          className="h-full bg-accent-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        />
                      </div>
                   </div>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => setActiveTab('practice')} className="professional-card p-8 group cursor-pointer border-dashed border-2 hover:border-accent-blue/50 transition-all">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-text-dim group-hover:text-accent-blue transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Simulated Assessment</h3>
                <p className="text-xs text-text-dim mt-2 leading-relaxed">Attempt a 15-minute proctored mock test for {profile?.goals?.targetExams?.[0] || 'Competitive Exams'}.</p>
            </div>

            <div onClick={() => setActiveTab('flashcards')} className="professional-card p-8 group cursor-pointer border-dashed border-2 hover:border-accent-green/50 transition-all">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-accent-green/10 rounded-2xl flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-text-dim group-hover:text-accent-green transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Active Recall Vault</h3>
                <p className="text-xs text-text-dim mt-2 leading-relaxed">Review 12 pending neural nodes to maintain your 14-day streak.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="professional-card p-8 h-full">
            <h2 className="text-lg font-semibold text-text-main mb-6">Next Steps</h2>
            {loadingTasks ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-bg-hover animate-pulse rounded-lg" />)}
                </div>
            ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-bg-hover/50 rounded-xl border border-border-subtle group hover:border-accent-blue/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        {task.completed ? <CheckCircle className="w-4 h-4 text-accent-green" /> : <div className="w-4 h-4 border border-text-dim/30 rounded" />}
                        <span className={cn("text-xs", task.completed ? "text-text-dim line-through" : "text-text-main font-medium")}>{task.title}</span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-text-dim group-hover:text-accent-blue" />
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-6 border-t border-border-subtle">
                     <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        Target Exam: {profile?.goals?.targetExams?.[0] || 'Finals'}
                     </div>
                     <div className="text-lg font-bold text-red-500 mt-1">42 Days Left</div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
