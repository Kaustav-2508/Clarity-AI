import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Zap, Brain, Rocket, ChevronRight, Activity, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { ProgressChart } from '../common/ProgressChart';

export function EliteTracking() {
  const { profile, user } = useAuth();
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformance() {
      if (!user) return;
      const q = query(
        collection(db, 'practice_results'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setPerformance(snap.docs.map(d => d.data()));
      setLoading(false);
    }
    fetchPerformance();
  }, [user]);

  const insights = [
    {
      title: 'Cognitive Velocity',
      value: '1.4x',
      status: 'improving',
      desc: 'Your speed in problem-solving has increased by 14% this week.',
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      title: 'Mental Resilience',
      value: 'Elite',
      status: 'stable',
      desc: 'Accuracy remains above 90% during high-difficulty sessions.',
      icon: Target,
      color: 'text-accent-blue'
    },
    {
      title: 'Active Recall Mastery',
      value: '82%',
      status: 'warning',
      desc: 'Retention for "Organic Chemistry" is dipping. Schedule review.',
      icon: Brain,
      color: 'text-accent-green'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">
            Elite <span className="text-accent-blue">Trajectory</span>
          </h1>
          <p className="text-sm text-text-dim mt-1">AI-Powered Neural Performance Tracking</p>
        </div>
        <div className="flex items-center gap-3 p-1 bg-bg-panel border border-border-subtle rounded-xl">
             <div className="px-4 py-2 bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest rounded-lg">Real-time Analysis</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={insight.title}
            className="professional-card p-6 group hover:border-accent-blue/50 transition-all cursor-crosshair"
          >
            <div className="flex items-center justify-between mb-4">
               <div className={cn("p-2 rounded-lg bg-bg-deep", insight.color)}>
                  <insight.icon className="w-5 h-5" />
               </div>
               <Activity className="w-4 h-4 text-text-dim opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">{insight.title}</h3>
                <div className="text-3xl font-black text-text-main tracking-tight">{insight.value}</div>
            </div>
            <p className="text-xs text-text-dim mt-4 leading-relaxed">{insight.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="professional-card p-8 space-y-8">
           <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight">Performance Matrix</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mt-1">Cross-Subject Proficiency Data</p>
              </div>
              <button className="p-2 hover:bg-bg-hover rounded-lg text-text-dim transition-colors">
                <TrendingUp className="w-5 h-5" />
              </button>
           </div>
           <ProgressChart data={[
             { day: 'Mon', progress: 40 },
             { day: 'Tue', progress: 55 },
             { day: 'Wed', progress: 45 },
             { day: 'Thu', progress: 70 },
             { day: 'Fri', progress: 85 }
           ]} />

           <div className="space-y-8">
              {['Physics', 'Mathematics', 'Biology'].map((subject, i) => (
                <div key={subject} className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-main uppercase tracking-wider">{subject}</span>
                    <span className="font-mono text-accent-blue font-black">{85 - i * 5}% Intelligence Quotient</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg-deep rounded-full overflow-hidden border border-border-subtle">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${85 - i * 5}%` }}
                        transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                        className="h-full bg-gradient-to-r from-accent-blue to-cyan-400 rounded-full"
                     />
                  </div>
                </div>
              ))}
           </div>
           <div className="bg-bg-deep/50 border border-border-subtle p-6 rounded-2xl flex items-start gap-4">
              <Rocket className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-text-main">Elite Recommendation</h4>
                <p className="text-xs text-text-dim mt-1 leading-relaxed">Based on current trends, your "Newtonian Mechanics" accuracy is high but speed is low. We have queued a <b>Timed Challenge</b> in your Curriculum.</p>
              </div>
           </div>
        </div>

        <div className="professional-card p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight">Chronicle of Growth</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-accent-green mt-1">Success Milestones</p>
              </div>
              <Calendar className="w-5 h-5 text-accent-green" />
           </div>

           <div className="flex-1 space-y-6">
              {[
                { event: 'Streak Maintained', date: 'Today', status: 'success', pts: '+50' },
                { event: 'Mock Test Finished', date: 'Yesterday', status: 'success', pts: '+200' },
                { event: 'Weak Area Identified', date: '2 days ago', status: 'neutral', pts: 'Analysis' },
                { event: 'Goal Threshold Hit', date: 'Last Week', status: 'success', pts: 'Awarded' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-3 h-3 rounded-full mt-1", item.status === 'success' ? 'bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-accent-blue')}></div>
                    {i !== 3 && <div className="w-px h-full bg-border-subtle my-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                       <h5 className="text-sm font-bold text-text-main group-hover:text-accent-blue transition-colors">{item.event}</h5>
                       <span className="text-[10px] font-mono text-text-dim">{item.pts}</span>
                    </div>
                    <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold mt-1 opacity-50">{item.date}</p>
                  </div>
                </div>
              ))}
           </div>

           <button className="w-full py-4 mt-8 bg-accent-blue text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2">
              <Award className="w-4 h-4" />
              Download Full Progress Transcript
           </button>
        </div>
      </div>
    </div>
  );
}
