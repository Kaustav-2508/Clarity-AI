import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Target, Clock, Trophy, ChevronRight, Activity, Calendar, LayoutGrid, Award } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PracticeHistoryView() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'practice_results'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: new Date(d.data().timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
      setResults(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-bg-panel animate-pulse rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-bg-panel animate-pulse rounded-3xl" />)}
        </div>
      </div>
    );
  }

  const chartData = results.slice(-10); // Last 10 sessions

  const stats = {
    avgScore: results.reduce((acc, r) => acc + r.score, 0) / (results.length || 1),
    totalQuestions: results.reduce((acc, r) => acc + r.totalQuestions, 0),
    totalSessions: results.length,
    highestScore: Math.max(...results.map(r => r.score), 0)
  };

  return (
    <div className="space-y-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Accuracy', value: `${stats.avgScore.toFixed(1)}%`, icon: Target, color: 'text-accent-blue' },
          { label: 'Total Questions', value: stats.totalQuestions, icon: Activity, color: 'text-accent-green' },
          { label: 'Neural Syncs', value: stats.totalSessions, icon: LayoutGrid, color: 'text-purple-400' },
          { label: 'Peak Logic', value: `${stats.highestScore.toFixed(0)}%`, icon: Award, color: 'text-yellow-500' }
        ].map((stat, i) => (
          <div key={i} className="professional-card p-6 flex flex-col items-center justify-center text-center space-y-2 group hover:border-accent-blue/30 transition-all">
            <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
            <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">{stat.label}</div>
            <div className="text-2xl font-black text-text-main">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="professional-card p-10 h-[400px] flex flex-col space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-accent-blue" />
                <h3 className="text-sm font-black uppercase tracking-widest text-text-main italic">Neural Growth Analytics</h3>
            </div>
            <div className="text-[10px] text-text-dim font-bold uppercase tracking-tighter">Last 10 Assessment Sessions</div>
        </div>
        
        <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis 
                    dataKey="date" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontWeight: 800 }}
                />
                <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontWeight: 800 }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151', 
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#f3f4f6'
                    }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* History Log */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
            <Clock className="w-4 h-4 text-text-dim" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-dim">Battleground Ledger</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
            {results.slice().reverse().map((result) => (
                <div key={result.id} className="professional-card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-accent-blue/30 transition-all">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                            result.score >= 80 ? "bg-accent-green/10 text-accent-green" : 
                            result.score >= 50 ? "bg-accent-blue/10 text-accent-blue" : 
                            "bg-red-500/10 text-red-400"
                        )}>
                            {result.score.toFixed(0)}%
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                    result.mode === 'PYQ' ? "bg-yellow-500/10 text-yellow-500" :
                                    result.mode === 'Mock' ? "bg-accent-green/10 text-accent-green" :
                                    "bg-accent-blue/10 text-accent-blue"
                                )}>
                                    {result.mode} MODE
                                </span>
                                <div className="text-[10px] font-black text-text-main uppercase group-hover:text-accent-blue transition-colors">
                                    {result.subject}
                                </div>
                            </div>
                            <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {formatDate(result.timestamp)}
                                <div className="h-1 w-1 rounded-full bg-border-subtle" />
                                <Trophy className="w-3 h-3" />
                                {result.correctAnswers}/{result.totalQuestions} Questions Correct
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-dim/50 group-hover:text-accent-blue transition-colors">
                        View Analysis <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            ))}
            
            {results.length === 0 && (
                <div className="text-center py-16 opacity-30">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No neural footprints detected</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
