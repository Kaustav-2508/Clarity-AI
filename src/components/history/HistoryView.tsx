import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Calendar, Trash2, Search, ExternalLink, Filter, BookOpen, Clock, Brain, Activity, BarChart3 } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { PracticeHistoryView } from './PracticeHistoryView';

export function HistoryView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'concepts' | 'performance'>('performance');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || activeTab !== 'concepts') return;
    const q = query(
      collection(db, 'doubts'), 
      where('userId', '==', user.uid), 
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user, activeTab]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await deleteDoc(doc(db, 'doubts', id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const filteredHistory = history.filter(item => 
    item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 pt-10 px-4 md:px-0">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setActiveTab('performance')}
                className={cn(
                    "text-3xl font-black tracking-tighter uppercase transition-all flex items-center gap-3",
                    activeTab === 'performance' ? "text-text-main opacity-100" : "text-text-dim opacity-30 hover:opacity-50"
                )}
            >
                Performance
            </button>
            <button 
                onClick={() => setActiveTab('concepts')}
                className={cn(
                    "text-3xl font-black tracking-tighter uppercase transition-all flex items-center gap-3",
                    activeTab === 'concepts' ? "text-text-main opacity-100" : "text-text-dim opacity-30 hover:opacity-50"
                )}
            >
                Archive
            </button>
          </div>
          <p className="text-text-dim text-sm max-w-xl font-medium">
            {activeTab === 'performance' 
                ? "Quantifying your progress across competitive assessment domains." 
                : "Your conceptual audit log. Revisit logic paths and breakthroughs."}
          </p>
        </div>
        
        {activeTab === 'concepts' && (
            <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
                className="w-full bg-bg-panel border border-border-subtle rounded-xl pl-9 pr-4 py-3 text-[10px] uppercase font-black tracking-widest text-text-main outline-none focus:border-accent-blue/50 transition-all"
                placeholder="Search concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
        )}
      </header>

      <div className="px-4 md:px-0">
        <AnimatePresence mode="wait">
            {activeTab === 'performance' ? (
                <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                >
                    <PracticeHistoryView />
                </motion.div>
            ) : (
                <motion.div 
                    key="concepts"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]"
                >
                    <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-bg-panel animate-pulse rounded-2xl border border-border-subtle" />)}
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-20 px-10 bg-bg-panel/30 border border-dashed border-border-subtle rounded-3xl">
                            <Brain className="w-10 h-10 text-text-dim/20 mx-auto mb-4" />
                            <p className="text-sm text-text-dim italic">No matching history found. Initiate a dialogue with Mentor to begin.</p>
                            </div>
                        ) : (
                            filteredHistory.map((item) => (
                            <motion.div 
                                layoutId={item.id}
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                                selectedItem?.id === item.id 
                                    ? "bg-bg-hover border-accent-blue shadow-lg shadow-accent-blue/5" 
                                    : "bg-bg-panel border-border-subtle hover:border-text-dim/30"
                                )}
                            >
                                {selectedItem?.id === item.id && (
                                    <div className="absolute left-0 top-0 w-1 h-full bg-accent-blue" />
                                )}
                                <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest", 
                                    selectedItem?.id === item.id ? "bg-accent-blue text-white" : "bg-accent-blue/10 text-accent-blue"
                                )}>
                                    {item.subject}
                                </span>
                                <button onClick={(e) => handleDelete(item.id, e)} className="p-1 text-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                                <h3 className={cn("text-sm font-bold leading-snug line-clamp-2", selectedItem?.id === item.id ? "text-text-main" : "text-text-dim")}>{item.question}</h3>
                            </motion.div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedItem ? (
                            <div className="bg-bg-panel border border-border-subtle rounded-[2.5rem] p-10 h-full">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-accent-blue">{selectedItem.subject}</div>
                                            <div className="text-[10px] font-bold text-text-dim uppercase">{formatDate(selectedItem.timestamp)}</div>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-main leading-tight">{selectedItem.question}</h2>
                                    <div className="prose prose-invert prose-p:text-text-dim prose-p:leading-relaxed prose-strong:text-text-main max-w-none">
                                        <ReactMarkdown>{selectedItem.explanation}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-[2.5rem] opacity-30">
                                <Brain className="w-12 h-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Select a concept to expand</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
