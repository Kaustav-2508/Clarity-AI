import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, ListTree, Zap, MessageCircleQuestion, HelpCircle, Eye, Lightbulb, Beaker } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { detectSubject, generateExplanation } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import { LearningMode, ExplanationResult } from '../../types';
import { addPoints, GAMIFICATION_RULES } from '../../lib/gamification';
import { ConceptMap } from './ConceptMap';
import { MentalSandbox } from './MentalSandbox';

export function MentorStage() {
  const { profile, user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [mode, setMode] = useState<LearningMode>('Step-by-Step');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const triggerSearch = async (searchTerm: string) => {
    setLoading(true);
    setResult(null);
    setShowFeedback(false);
    setShowThinking(false);

    try {
      const detected = await detectSubject(searchTerm);
      setSubject(detected);
      const eliteResult = await generateExplanation(searchTerm, mode, profile);
      setResult(eliteResult);

      if (user) {
        await addPoints(user.uid, GAMIFICATION_RULES.LESSON_COMPLETE);
      }

      await addDoc(collection(db, 'doubts'), {
        userId: user?.uid,
        question: searchTerm,
        subject: detected,
        mode: mode,
        explanation: eliteResult.explanation,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query || loading) return;
    triggerSearch(query);
  };

  const handleFeedback = (response: 'Yes' | 'Partially' | 'No') => {
    setShowFeedback(false);
    if (response === 'No') {
        setQuery(`Simplify the previous explanation for: ${query}`);
    } else if (response === 'Partially') {
        setQuery(`Add more examples for: ${query}`);
    } else {
        setResult(null);
        setQuery('');
        setSubject(null);
    }
  };

  const modes = [
    { id: 'Quick', icon: Zap, label: 'Quick', desc: 'Direct & Concise' },
    { id: 'Step-by-Step', icon: ListTree, label: 'Steps', desc: 'Logical Breakdown' },
    { id: 'Deep', icon: Brain, label: 'Deep', desc: 'Conceptual Intuition' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
       <header className="flex items-center justify-between h-12">
        <div className="flex items-center gap-4">
          <span className="subject-tag-professional">{subject || 'General'}</span>
          <h2 className="text-text-main font-medium">Elite Mentorship</h2>
        </div>
        <div className="flex bg-bg-panel p-1 border border-border-subtle rounded-lg">
            {modes.map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setMode(m.id as LearningMode)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                    mode === m.id ? "bg-bg-hover text-text-main shadow-sm" : "text-text-dim hover:text-text-main"
                  )}
                >
                  <m.icon className="w-3 h-3" />
                  {m.label}
                </button>
            ))}
        </div>
      </header>

      <div className="bg-bg-panel border border-border-subtle rounded-xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
        {!result ? (
           <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue relative">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-accent-blue/20 rounded-2xl blur-xl"
                    />
                    <MessageCircleQuestion className="w-8 h-8 relative z-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-text-main">Neural AI Mentorship</h1>
                    <p className="text-text-dim max-w-sm">Deeper reasoning. Visual mapping. Mental sandboxes. Ask anything to begin your elite journey.</p>
                </div>
           </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto"
          >
             {/* Thinking Section */}
             <div className="p-6 border-b border-border-subtle bg-bg-deep/30">
                <button 
                    onClick={() => setShowThinking(!showThinking)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-blue hover:text-white transition-colors"
                >
                    <Eye className="w-3 h-3" />
                    {showThinking ? 'Hide Neural Thinking' : 'Show Neural Thinking'}
                </button>
                <AnimatePresence>
                    {showThinking && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 p-4 rounded-lg bg-bg-deep border border-border-subtle overflow-hidden"
                        >
                            <p className="text-xs text-text-dim italic leading-relaxed font-mono">
                                {result.thinking}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             <div className="p-10 space-y-12">
                {/* Mental Model Card */}
                <div className="professional-card bg-accent-blue/5 border-accent-blue/10 p-6 flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-xl bg-accent-blue flex items-center justify-center shrink-0">
                        <Lightbulb className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue opacity-50 block mb-1">Mental Model</span>
                        <p className="text-text-main font-semibold leading-snug">{result.mentalModel}</p>
                    </div>
                </div>

                {/* Main Explanation */}
                <div className="prose prose-invert max-w-none 
                    prose-headings:text-text-main prose-headings:font-bold prose-headings:mb-4
                    prose-p:text-text-dim prose-p:leading-relaxed prose-p:text-lg
                    prose-li:text-text-dim prose-strong:text-accent-blue prose-code:text-accent-blue
                    prose-pre:bg-bg-deep prose-pre:border prose-pre:border-border-subtle
                  ">
                    <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>

                {/* Concept Map Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                            <Brain className="w-4 h-4 text-accent-blue" />
                            Visual Knowledge Hub
                        </h3>
                    </div>
                    <ConceptMap data={result.conceptMap} />
                </div>

                {/* Interactive Lab Section */}
                <MentalSandbox 
                    title={result.interactiveLab.title}
                    description={result.interactiveLab.description}
                    variables={result.interactiveLab.variables}
                />

                {/* Related Concepts */}
                {result.relatedConcepts && result.relatedConcepts.length > 0 && (
                    <div className="space-y-4 pt-8 border-t border-border-subtle">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim">
                            <ListTree className="w-3 h-3" />
                            Expand Neural Path (Related Concepts)
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.relatedConcepts.map((concept) => (
                                <button 
                                    key={concept}
                                    onClick={() => {
                                        setQuery(concept);
                                        setResult(null);
                                        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
                                        triggerSearch(concept);
                                    }}
                                    className="px-4 py-2 bg-bg-deep border border-border-subtle rounded-xl text-xs font-medium text-text-dim hover:border-accent-blue hover:text-accent-blue transition-all"
                                >
                                    {concept}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             <div ref={scrollRef} className="px-10 pb-12">
                <div className="bg-bg-deep border border-border-subtle p-8 rounded-2xl text-center space-y-6">
                  <h3 className="text-text-main font-bold text-lg">Did this session elevate your understanding?</h3>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                        onClick={() => handleFeedback('Yes')} 
                        className="px-6 py-3 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent-blue hover:text-white transition-all transform hover:-translate-y-1"
                    >
                        ✨ Crystal Clear
                    </button>
                    <button 
                        onClick={() => handleFeedback('Partially')} 
                        className="px-6 py-3 bg-bg-panel border border-border-subtle text-text-main font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-bg-hover transition-all transform hover:-translate-y-1"
                    >
                        📚 Need More Examples
                    </button>
                    <button 
                        onClick={() => handleFeedback('No')} 
                        className="px-6 py-3 bg-bg-panel border border-border-subtle text-text-main font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-bg-hover transition-all transform hover:-translate-y-1"
                    >
                        🔄 Refresh Logic
                    </button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        <div className="p-4 bg-bg-deep/50 border-t border-border-subtle">
            <form onSubmit={handleAsk} className="max-w-3xl mx-auto relative flex items-center gap-3 px-6 py-3 bg-bg-panel border border-border-subtle rounded-2xl group focus-within:border-accent-blue shadow-2xl transition-all">
              <span className="text-text-dim group-focus-within:text-accent-blue transition-colors text-xl">✨</span>
              <input 
                className="flex-1 bg-transparent border-none py-2 text-text-main text-base focus:outline-none placeholder:text-text-dim/50"
                placeholder="Deep dive into any concept... (e.g. 'Mental model of Entropy')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading || !query}
                className="bg-accent-blue hover:bg-opacity-90 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Brain className="w-4 h-4" />
                    </motion.div>
                ) : <Send className="w-4 h-4" />}
                {loading ? 'Synthesizing...' : 'Inquire'}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
