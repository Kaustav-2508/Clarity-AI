import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, Brain, ChevronRight, ChevronLeft, 
  RotateCcw, Plus, Trash2, Save, X, Edit3, 
  BookOpen, CheckCircle2, Layout, Layers, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { addPoints } from '../../lib/gamification';
import { Flashcard } from '../../types';

export function FlashcardSuite() {
  const { user, profile } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [subject, setSubject] = useState(profile?.subjects?.[0] || 'General');
  const [view, setView] = useState<'study' | 'manage'>('study');
  
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  // Real-time flashcards from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'flashcards'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Flashcard)));
    });
  }, [user]);

  const generateFlashcards = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5 high-quality flashcards for the subject: ${subject}. Each card should have a 'front' (question/concept) and 'back' (concise explanation/answer). Appropriate for ${profile?.grade || 'all levels'}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        }
      });

      const generatedData = JSON.parse(response.text || '[]');
      
      // Save all generated cards to Firestore immediately
      for (const card of generatedData) {
        await addDoc(collection(db, 'users', user.uid, 'flashcards'), {
          ...card,
          userId: user.uid,
          subject,
          mastered: false,
          createdAt: Date.now()
        });
      }
      
      await addPoints(user.uid, 15);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCard.front || !newCard.back) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'flashcards'), {
        front: newCard.front,
        back: newCard.back,
        userId: user.uid,
        subject,
        mastered: false,
        createdAt: Date.now()
      });
      setNewCard({ front: '', back: '' });
      setShowManualForm(false);
      await addPoints(user.uid, 5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'flashcards', id));
    if (currentIndex >= cards.length - 1 && cards.length > 1) {
      setCurrentIndex(cards.length - 2);
    }
  };

  const toggleMastery = async (card: Flashcard) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'flashcards', card.id), {
      mastered: !card.mastered
    });
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight flex items-center gap-3">
            <Brain className="text-accent-blue w-8 h-8" />
            Active Recall Vault
          </h1>
          <p className="text-sm text-text-dim mt-1">Don't just read history, master it with neural retrieval.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-bg-panel border border-border-subtle rounded-xl p-1 flex">
                <button 
                    onClick={() => setView('study')}
                    className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                        view === 'study' ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/20" : "text-text-dim hover:text-text-main"
                    )}
                >
                    <Layers className="w-3 h-3" /> Study
                </button>
                <button 
                    onClick={() => setView('manage')}
                    className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                        view === 'manage' ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/20" : "text-text-dim hover:text-text-main"
                    )}
                >
                    <Layout className="w-3 h-3" /> Vault
                </button>
            </div>
            <button 
                onClick={() => setShowManualForm(true)}
                className="professional-button-secondary text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
            >
                <Plus className="w-3.5 h-3.5" /> Manual Create
            </button>
        </div>
      </header>

      {view === 'study' ? (
        <div className="space-y-12">
            <section className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-8">
                    <select 
                        className="bg-bg-panel border border-border-subtle rounded-xl px-4 py-2 text-xs font-bold text-text-main outline-none focus:border-accent-blue transition-all"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    >
                        {profile?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="General">General Knowledge</option>
                    </select>
                    <button 
                        onClick={generateFlashcards}
                        disabled={isLoading}
                        className="professional-button-primary flex items-center gap-2 text-xs shadow-xl shadow-accent-blue/20"
                    >
                        {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate AI Deck
                    </button>
                </div>

                <div className="w-full max-w-xl min-h-[400px] flex flex-col items-center">
                    {cards.length > 0 ? (
                        <div className="w-full space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="relative w-full aspect-[4/3] cursor-pointer group perspective-1000"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                >
                                    <motion.div 
                                        className="w-full h-full relative"
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 bg-bg-panel border border-border-subtle rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] bg-accent-blue/10 px-6 py-1.5 rounded-full">Recall Prompt</span>
                                            <h3 className="text-2xl font-semibold text-text-main leading-relaxed z-10 px-4">
                                                {cards[currentIndex].front}
                                            </h3>
                                            <div className="absolute bottom-8 flex flex-col items-center gap-2">
                                                <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest animate-pulse">Click to see answer</p>
                                                <div className="w-1 h-1 rounded-full bg-accent-blue" />
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div 
                                            className="absolute inset-0 bg-bg-deep border-2 border-accent-blue/30 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl shadow-accent-blue/10"
                                            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                        >
                                            <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-accent-green uppercase tracking-[0.2em] bg-accent-green/10 px-6 py-1.5 rounded-full">Verified Core Knowledge</span>
                                            <div className="max-h-full overflow-y-auto w-full custom-scrollbar pr-2">
                                                <p className="text-text-main text-lg leading-loose font-medium">
                                                    {cards[currentIndex].back}
                                                </p>
                                            </div>
                                            <div className="absolute bottom-8 right-8">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleMastery(cards[currentIndex]);
                                                    }}
                                                    className={cn(
                                                        "p-3 rounded-2xl border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                                                        cards[currentIndex].mastered 
                                                            ? "bg-accent-green text-white border-transparent" 
                                                            : "bg-bg-panel text-text-dim border-border-subtle hover:border-accent-green hover:text-accent-green"
                                                    )}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {cards[currentIndex].mastered ? 'Mastered' : 'Mark as Mastered'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex items-center justify-between px-4">
                                <button onClick={prevCard} className="group p-4 bg-bg-panel hover:bg-bg-hover border border-border-subtle rounded-2xl text-text-dim transition-all active:scale-90">
                                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="text-[12px] font-black text-text-main tracking-[0.3em] font-mono">
                                        {String(currentIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
                                    </div>
                                    <div className="w-32 h-1 bg-bg-panel rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-accent-blue"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <button onClick={nextCard} className="group p-4 bg-bg-panel hover:bg-bg-hover border border-border-subtle rounded-2xl text-text-dim transition-all active:scale-90">
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent-blue/20 blur-3xl rounded-full" />
                                <div className="relative w-32 h-32 bg-bg-panel border border-border-subtle rounded-[3rem] flex items-center justify-center mx-auto text-text-dim/20 shadow-inner">
                                    <Brain className="w-16 h-16" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-bold text-text-main">The Vault is Waiting</h2>
                                <p className="text-sm text-text-dim max-w-sm mx-auto leading-relaxed">
                                    Your personal study engine. Generate AI-powered cards or manually record concepts from your lectures to begin your mastery journey.
                                </p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setShowManualForm(true)} className="professional-button-secondary py-3 px-8 text-sm">Add First Card</button>
                                <button onClick={generateFlashcards} className="professional-button-primary py-3 px-8 text-sm">Auto-Generate</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-border-subtle">
                <div className="group p-8 bg-bg-panel/50 hover:bg-bg-panel transition-all rounded-3xl border border-border-subtle hover:border-accent-blue/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-accent-blue transition-all duration-500" />
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-6">
                        <RotateCcw className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4">Neural Retrieval</h4>
                    <p className="text-[12px] text-text-dim leading-relaxed">Active recall forces your brain to retrieve info. This builds vastly stronger neural paths than passive re-reading or highlighting.</p>
                </div>
                <div className="group p-8 bg-bg-panel/50 hover:bg-bg-panel transition-all rounded-3xl border border-border-subtle hover:border-accent-green/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-accent-green transition-all duration-500" />
                    <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green mb-6">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4">Metacognition</h4>
                    <p className="text-[12px] text-text-dim leading-relaxed">The Mastery Tag helps you track confidence levels. Focus your energy only on what you don't yet know with surgical precision.</p>
                </div>
                <div className="group p-8 bg-bg-panel/50 hover:bg-bg-panel transition-all rounded-3xl border border-border-subtle hover:border-accent-purple/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-purple-500/50 transition-all duration-500" />
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4">Spaced Repetition</h4>
                    <p className="text-[12px] text-text-dim leading-relaxed">AI analyzes your subjects to surface the most critical foundational data, ensuring you learn in the most efficient sequence possible.</p>
                </div>
            </section>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Card Repository ({cards.length})</h3>
                <div className="flex gap-2">
                     <div className="px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-lg text-[10px] font-bold text-accent-green">
                        {cards.filter(c => c.mastered).length} Mastered
                    </div>
                    <div className="px-3 py-1 bg-accent-blue/10 border border-border-subtle rounded-lg text-[10px] font-bold text-accent-blue">
                        {cards.filter(c => !c.mastered).length} Learning
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                    <div key={card.id} className="professional-card p-6 flex items-start gap-4 group">
                        <div className={cn(
                            "w-2 h-2 rounded-full mt-2 shrink-0",
                            card.mastered ? "bg-accent-green" : "bg-accent-blue"
                        )} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase text-text-dim/50 tracking-widest">{card.subject}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => toggleMastery(card)} className="p-1.5 hover:bg-bg-hover rounded text-text-dim hover:text-accent-green">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteCard(card.id)} className="p-1.5 hover:bg-bg-hover rounded text-text-dim hover:text-red-400">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-text-main line-clamp-2 mb-1">{card.front}</h4>
                            <p className="text-[11px] text-text-dim line-clamp-1">{card.back}</p>
                        </div>
                    </div>
                ))}
                {cards.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-border-subtle rounded-3xl">
                        <Layout className="w-10 h-10 text-text-dim/20 mx-auto mb-4" />
                        <p className="text-sm text-text-dim">Your vault is empty. Add cards to see them here.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      <AnimatePresence>
        {showManualForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/90 backdrop-blur-xl">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-lg professional-card p-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-blue" />
                    <button 
                        onClick={() => setShowManualForm(false)}
                        className="absolute top-6 right-6 p-2 hover:bg-bg-hover rounded-xl text-text-dim transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-main tracking-tight">Manual Inscription</h2>
                            <p className="text-xs text-text-dim tracking-wide">Record a specific concept into your long-term memory.</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateManual} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 px-1">Concept or Question</label>
                            <input 
                                required
                                value={newCard.front}
                                onChange={e => setNewCard({...newCard, front: e.target.value})}
                                placeholder="What is the Powerhouse of the cell?"
                                className="w-full bg-bg-deep border border-border-subtle rounded-2xl px-5 py-3.5 text-sm text-text-main outline-none focus:border-accent-blue/50 focus:ring-4 focus:ring-accent-blue/5 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 px-1">Detailed Explanation</label>
                            <textarea 
                                required
                                value={newCard.back}
                                onChange={e => setNewCard({...newCard, back: e.target.value})}
                                placeholder="Mitochondria (produces ATP through cellular respiration)..."
                                className="w-full bg-bg-deep border border-border-subtle rounded-2xl px-5 py-3.5 text-sm text-text-main outline-none focus:border-accent-blue/50 focus:ring-4 focus:ring-accent-blue/5 transition-all h-32 resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 px-1">Subject</label>
                                <select 
                                    className="w-full bg-bg-deep border border-border-subtle rounded-2xl px-5 py-3 text-xs text-text-main font-bold outline-none"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                >
                                    {profile?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="General">General Knowledge</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button 
                                    type="submit"
                                    disabled={isLoading || !newCard.front || !newCard.back}
                                    className="w-full professional-button-primary py-3.5 text-xs font-bold shadow-2xl shadow-accent-blue/20"
                                >
                                    {isLoading ? 'Storing...' : 'Archive Card'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
