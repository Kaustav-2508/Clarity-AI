import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { generatePracticeProblems, analyzeError, generateSessionFeedback } from '../../lib/gemini';
import { PracticeProblem, MockTest } from '../../types';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, Loader2, AlertCircle, Trophy, Clock, ShieldCheck, FileText, LayoutGrid, Timer, Target, Brain, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { addDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { addPoints, GAMIFICATION_RULES } from '../../lib/gamification';
import { PYQSelector } from './PYQSelector';

type PracticeMode = 'Menu' | 'Setup' | 'Practice' | 'Summary';

const EXAM_CONFIGS: Record<string, { timePerQuestion: number, defaultCount: number, date?: string }> = {
  'SAT': { timePerQuestion: 75, defaultCount: 10 },
  'JEE': { timePerQuestion: 180, defaultCount: 5 },
  'MCAT': { timePerQuestion: 95, defaultCount: 10 },
  'NEET': { timePerQuestion: 60, defaultCount: 10 },
  'GRE': { timePerQuestion: 105, defaultCount: 10 },
  'GMAT': { timePerQuestion: 120, defaultCount: 10 },
  'LSAT': { timePerQuestion: 90, defaultCount: 10 },
  'ICSE': { timePerQuestion: 90, defaultCount: 15, date: '2026-03-01' },
  'ISC': { timePerQuestion: 95, defaultCount: 15, date: '2026-02-25' },
  'CBSE-10': { timePerQuestion: 90, defaultCount: 15, date: '2026-03-05' },
  'CBSE-12': { timePerQuestion: 100, defaultCount: 15, date: '2026-03-02' },
  'StateBoard-MH': { timePerQuestion: 85, defaultCount: 15, date: '2026-03-10' },
  'StateBoard-KA': { timePerQuestion: 85, defaultCount: 15, date: '2026-03-12' },
  'StateBoard-TN': { timePerQuestion: 85, defaultCount: 15, date: '2026-03-08' },
  'IB-DP': { timePerQuestion: 85, defaultCount: 10, date: '2026-05-01' },
  'IGCSE': { timePerQuestion: 80, defaultCount: 15, date: '2026-05-15' },
  'A-Level': { timePerQuestion: 95, defaultCount: 12, date: '2026-06-01' },
  'Gaokao': { timePerQuestion: 110, defaultCount: 20, date: '2026-06-07' },
  'Abitur': { timePerQuestion: 90, defaultCount: 15, date: '2026-05-20' },
  'Default': { timePerQuestion: 90, defaultCount: 5 }
};

function SessionFeedback({ results, subject, exam, profile }: { results: any[], subject: string, exam: string, profile: any }) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const data = await generateSessionFeedback(results, subject, exam, profile);
                setFeedback(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [results, subject, exam]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-4 bg-bg-hover animate-pulse rounded w-3/4" />
                <div className="h-4 bg-bg-hover animate-pulse rounded w-1/2" />
                <div className="h-4 bg-bg-hover animate-pulse rounded w-2/3" />
            </div>
        );
    }

    return (
        <div className="prose prose-invert prose-p:text-text-dim prose-p:text-sm prose-p:leading-relaxed prose-strong:text-text-main max-w-none">
            <ReactMarkdown>{feedback || ''}</ReactMarkdown>
        </div>
    );
}

export function PracticeStage({ setActiveTab }: { setActiveTab?: (tab: any) => void }) {
  const { profile, user } = useAuth();
  const [mode, setMode] = useState<PracticeMode>('Menu');
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedSubject, setSelectedSubject] = useState(profile?.subjects?.[0] || 'Mathematics');
  const [selectedExam, setSelectedExam] = useState(profile?.goals?.targetExams?.[0] || 'SAT');
  const [practiceType, setPracticeType] = useState<'Adaptive' | 'Mock' | 'PYQ'>('Adaptive');
  const [results, setResults] = useState<{ correct: boolean, timeSpent: number }[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'practice_results'), where('userId', '==', user.uid));
    return onSnapshot(q, (snapshot) => {
      setSessionHistory(snapshot.docs.map(d => d.data()));
    });
  }, [user]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && mode === 'Practice') {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !showResult && problems.length > 0 && mode === 'Practice') {
        handleCheck();
    }
  }, [timeLeft, showResult, problems.length, mode]);

  const startPractice = async () => {
    setLoading(true);
    setProblems([]);
    setCurrentIndex(0);
    setShowResult(false);
    setResults([]);
    
    const config = EXAM_CONFIGS[selectedExam] || EXAM_CONFIGS.Default;
    const initialTime = config.timePerQuestion * config.defaultCount;
    setTimeLeft(initialTime);
    setStartTime(Date.now());

    try {
      const result = await generatePracticeProblems(selectedSubject, difficulty, selectedExam, profile);
      setProblems(result);
      setMode('Practice');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    const current = problems[currentIndex];
    const correct = current.correctAnswer === selectedOption;
    setIsCorrect(correct);
    setShowResult(true);

    const timeSpentOnQuestion = (EXAM_CONFIGS[selectedExam]?.timePerQuestion || 90) - (timeLeft % (EXAM_CONFIGS[selectedExam]?.timePerQuestion || 90));
    setResults([...results, { correct, timeSpent: timeSpentOnQuestion }]);

    if (correct && user) {
        await addPoints(user.uid, GAMIFICATION_RULES.PROBLEM_CORRECT);
    }

    if (!correct) {
      setAnalyzing(true);
      const errAnalysis = await analyzeError(current.question, selectedOption || 'None', current.explanation);
      setAnalysis(errAnalysis);
      setAnalyzing(false);
    }
  };

  const nextProblem = async () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setAnalysis(null);
    } else {
      setMode('Summary');
      if (user && results.length > 0) {
        const correctCount = results.filter(r => r.correct).length;
        await addDoc(collection(db, 'practice_results'), {
            userId: user.uid,
            subject: selectedSubject,
            examType: selectedExam,
            totalQuestions: problems.length,
            correctAnswers: correctCount,
            score: (correctCount / problems.length) * 100,
            mode: practiceType,
            difficulty,
            timestamp: Date.now()
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 text-center space-y-8">
        <div className="relative">
            <div className="w-24 h-24 border-b-2 border-accent-blue rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-blue w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter italic">Synthesizing Assessment</h2>
            <p className="text-text-dim text-sm max-w-xs mx-auto">Retrieving elite-level curriculum problems & marking keys from the Neural Hub...</p>
        </div>
      </div>
    );
  }

  if (mode === 'Summary') {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = problems.length > 0 ? (correctCount / problems.length) * 100 : 0;
    const avgTime = results.reduce((acc, r) => acc + r.timeSpent, 0) / (problems.length || 1);

    return (
      <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
        <header className="text-center space-y-4">
            <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue mx-auto">
                <Trophy className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase italic">Session <span className="text-accent-blue">Summary</span></h1>
            <p className="text-text-dim text-sm uppercase tracking-widest font-black">Neural Calibration Complete</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="professional-card p-8 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Accuracy</div>
                <div className="text-4xl font-black text-text-main">{accuracy.toFixed(0)}%</div>
                <div className="h-1.5 w-full bg-bg-deep rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-accent-blue" style={{ width: `${accuracy}%` }} />
                </div>
            </div>
            <div className="professional-card p-8 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Avg Speed</div>
                <div className="text-4xl font-black text-accent-green">{avgTime.toFixed(1)}s</div>
                <div className="text-[9px] font-bold text-text-dim/60 uppercase">Seconds per question</div>
            </div>
            <div className="professional-card p-8 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Experience gained</div>
                <div className="text-4xl font-black text-yellow-500">+{correctCount * 10}XP</div>
                <div className="text-[9px] font-bold text-text-dim/60 uppercase">Knowledge Points Sync'd</div>
            </div>
        </div>

        <div className="professional-card p-10 space-y-8 bg-gradient-to-br from-bg-panel to-bg-deep">
            <div className="flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-accent-blue animate-pulse" />
                <h3 className="text-xl font-bold text-text-main uppercase tracking-tight italic">Elite Session Retro</h3>
            </div>
            <SessionFeedback results={results} subject={selectedSubject} exam={selectedExam} profile={profile} />
        </div>

        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-dim ml-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Component Analysis
            </h3>
            <div className="grid grid-cols-1 gap-4">
                {problems.map((prob, idx) => (
                    <div key={prob.id} className="professional-card p-6 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                                results[idx]?.correct ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-500"
                            )}>
                                {results[idx]?.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-text-main group-hover:text-accent-blue transition-colors truncate max-w-md">
                                    {prob.question}
                                </div>
                                <div className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
                                    Difficulty: {prob.difficulty} • Time: {results[idx]?.timeSpent}s
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-center">
            <button 
                onClick={() => setMode('Menu')}
                className="professional-button-primary px-12 py-4"
            >
                Return to Battleground
            </button>
        </div>
      </div>
    );
  }  if (mode === 'Setup') {
    return (
      <div className="max-w-3xl mx-auto space-y-12 pb-20 px-4">
        <header className="space-y-2 text-center">
            <h1 className="text-4xl font-black text-text-main tracking-tighter uppercase italic">Mission <span className="text-accent-blue">Parameters</span></h1>
            <p className="text-text-dim text-sm font-medium uppercase tracking-widest">Calibrate your assessment environment</p>
        </header>

        <div className="space-y-12 px-6 py-10 bg-bg-panel border border-border-subtle rounded-[2.5rem]">
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Target Exam
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.keys(EXAM_CONFIGS).filter(e => e !== 'Default').map(exam => (
                        <button 
                            key={exam}
                            onClick={() => { setSelectedExam(exam); setSelectedPreset(null); }}
                            className={cn(
                                "p-4 rounded-xl border text-[10px] font-bold uppercase transition-all",
                                selectedExam === exam ? "bg-accent-blue/10 border-accent-blue text-accent-blue shadow-lg shadow-accent-blue/5" : "bg-bg-deep border-border-subtle text-text-dim hover:border-text-dim/30"
                            )}
                        >
                            {exam}
                        </button>
                    ))}
                </div>
                {selectedExam !== 'Default' && EXAM_CONFIGS[selectedExam]?.date && (
                    <div className={cn(
                        "mt-4 p-4 rounded-xl border flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest",
                        new Date() > new Date(EXAM_CONFIGS[selectedExam]!.date!) ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-accent-blue/10 border-accent-blue/50 text-accent-blue"
                    )}>
                        <Calendar className="w-4 h-4" />
                        {new Date() > new Date(EXAM_CONFIGS[selectedExam]!.date!) ? 
                            `Exam Date Passed: ${new Date(EXAM_CONFIGS[selectedExam]!.date!).toLocaleDateString()}` : 
                            `Upcoming Exam: ${new Date(EXAM_CONFIGS[selectedExam]!.date!).toLocaleDateString()}`
                        }
                    </div>
                )}
            </div>

            {practiceType === 'PYQ' ? (
                <PYQSelector 
                    selectedExam={selectedExam} 
                    onSelect={(preset) => {
                        setSelectedPreset(preset);
                        setDifficulty(preset.difficulty);
                    }} 
                />
            ) : (
                <>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-2 flex items-center gap-2">
                            <LayoutGrid className="w-3 h-3" /> Core Subject
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {(profile?.subjects || ['Mathematics', 'Physics', 'History']).map(sub => (
                                <button 
                                    key={sub}
                                    onClick={() => setSelectedSubject(sub)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all",
                                        selectedSubject === sub ? "bg-accent-green/10 border-accent-green text-accent-green shadow-lg shadow-accent-green/5" : "bg-bg-deep border-border-subtle text-text-dim hover:border-text-dim/30"
                                    )}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-2 flex items-center gap-2">
                            <Brain className="w-3 h-3" /> Neural Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={cn(
                                        "p-5 rounded-xl border text-[10px] font-black uppercase transition-all",
                                        difficulty === d 
                                            ? d === 'Easy' ? "bg-accent-green/10 border-accent-green text-accent-green shadow-lg shadow-accent-green/10" :
                                              d === 'Medium' ? "bg-accent-blue/10 border-accent-blue text-accent-blue shadow-lg shadow-accent-blue/10" :
                                              "bg-red-500/10 border-red-500 text-red-400 shadow-lg shadow-red-500/10"
                                            : "bg-bg-deep border-border-subtle text-text-dim hover:border-text-dim/30"
                                    )}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {selectedPreset && (
                <div className="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-yellow-500" />
                        <div className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">
                            Breakthrough Selected: {selectedPreset.title}
                        </div>
                    </div>
                    <button onClick={() => setSelectedPreset(null)} className="text-[9px] font-black text-text-dim hover:text-red-400 uppercase tracking-widest">Clear</button>
                </div>
            )}
        </div>

        <div className="flex gap-4">
            <button 
                onClick={() => setMode('Menu')}
                className="flex-1 professional-button-secondary py-5 text-xs font-black uppercase tracking-widest"
            >
                Abort
            </button>
            <button 
                onClick={startPractice}
                disabled={practiceType === 'PYQ' && !selectedPreset}
                className="flex-2 professional-button-primary py-5 text-xs font-black uppercase tracking-widest disabled:grayscale disabled:opacity-50 transition-all"
            >
                Initialize Battleground
            </button>
        </div>
      </div>
    );
  }

  if (mode === 'Menu' || problems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 px-4 md:px-0">
        <section className="space-y-2">
           <div className="text-[10px] font-black uppercase text-accent-blue tracking-[0.4em] mb-4">Assessment Hub</div>
           <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter uppercase leading-none">
             Elite <span className="text-accent-blue">Battleground</span>
           </h1>
           <p className="text-text-dim text-lg max-w-xl font-medium">Test your neural retention with curriculum-mapped mock tests and previous year breakthroughs.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="professional-card p-10 space-y-6 group hover:border-accent-blue/50 transition-all border-dashed border-2">
                <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                    <Timer className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-text-main uppercase tracking-tight">Adaptive Blitz</h3>
                   <p className="text-text-dim text-xs mt-2 leading-relaxed">Dynamic difficulty tailored to your current proficiency profile.</p>
                </div>
                <button onClick={() => { setPracticeType('Adaptive'); setMode('Setup'); }} className="professional-button-primary w-full py-4 text-[10px] uppercase font-black">Configure Setup</button>
            </div>

            <div className="professional-card p-10 space-y-6 group hover:border-accent-green/50 transition-all border-dashed border-2">
                <div className="w-14 h-14 bg-accent-green/10 rounded-2xl flex items-center justify-center text-accent-green">
                    <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-text-main uppercase tracking-tight">Full Mock Test</h3>
                   <p className="text-text-dim text-xs mt-2 leading-relaxed">Proctoring simulation with time-boxed questions from your target exams.</p>
                </div>
                <button onClick={() => { setPracticeType('Mock'); setMode('Setup'); }} className="professional-button-primary w-full bg-accent-green shadow-accent-green/20 uppercase font-black text-[10px] tracking-widest">Initialize Mock</button>
            </div>

            <div className="professional-card p-10 space-y-6 group hover:border-yellow-500/50 transition-all border-dashed border-2">
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
                    <FileText className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-text-main uppercase tracking-tight">PYQ Bank</h3>
                   <p className="text-text-dim text-xs mt-2 leading-relaxed">Exact questions from Previous Year breakthroughs for {profile?.goals?.targetExams?.[0] || 'Competitive Exams'}.</p>
                </div>
                <button onClick={() => { setPracticeType('PYQ'); setMode('Setup'); }} className="professional-button-primary w-full bg-yellow-500 shadow-yellow-500/20 uppercase font-black text-[10px] tracking-widest text-black">Decrypt Archive</button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-bg-panel border border-border-subtle p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group">
                <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue shrink-0 group-hover:scale-110 transition-transform">
                    <Target className="w-10 h-10" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xl font-black text-text-main uppercase tracking-tight">Neural Analytics</h4>
                    <p className="text-text-dim text-sm font-medium">Review your performance trends and calibration history through the Learning Chronicle.</p>
                </div>
                <ArrowRight className="hidden md:block ml-auto w-6 h-6 text-accent-blue opacity-50" />
            </div>

            <button 
                onClick={() => setActiveTab?.('history')}
                className="professional-card p-8 rounded-[2.5rem] bg-accent-blue/5 border-accent-blue/20 flex flex-col items-center justify-center gap-4 hover:bg-accent-blue/10 transition-all"
            >
                <History className="w-8 h-8 text-accent-blue" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue">View History</span>
            </button>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-0 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-effect p-6 rounded-3xl border border-border-subtle sticky top-20 z-10">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue font-black italic">
            {currentIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className="subject-tag-professional">{practiceType === 'Adaptive' ? 'Proficiency' : practiceType} Mode</span>
                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">{currentProblem.subject}</span>
                {timeLeft !== null && (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ml-2",
                        timeLeft < 30 ? "bg-red-500/10 text-red-400 animate-pulse" : "bg-bg-deep text-text-dim"
                    )}>
                        <Clock className="w-3 h-3" />
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                )}
            </div>
            <div className="h-1.5 w-48 bg-bg-deep rounded-full mt-3 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
                    className="h-full bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-text-dim" />
                <span className="font-mono text-lg font-bold text-text-main">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
            </div>
            <button 
                onClick={() => setMode('Menu')}
                className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 transition-colors"
            >
                Terminate Session
            </button>
        </div>
      </header>

      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-8"
      >
        <div className="lg:col-span-3 space-y-8">
            <div className="professional-card p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <LayoutGrid className="w-5 h-5 text-border-subtle" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-main leading-none tracking-tighter mb-12">
                   {currentProblem.question}
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                    {currentProblem.options?.map((opt, i) => (
                    <button 
                        key={opt}
                        disabled={showResult}
                        onClick={() => setSelectedOption(opt)}
                        className={cn(
                        "p-6 text-left rounded-2xl border-2 transition-all group flex items-center gap-6",
                        selectedOption === opt 
                            ? "bg-accent-blue/5 border-accent-blue shadow-lg shadow-accent-blue/5" 
                            : "bg-bg-panel border-border-subtle hover:border-text-dim/30"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                            selectedOption === opt ? "bg-accent-blue text-white" : "bg-bg-hover text-text-dim"
                        )}>
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className={cn(
                            "text-sm font-medium leading-relaxed",
                            selectedOption === opt ? "text-text-main" : "text-text-dim"
                        )}>{opt}</span>
                    </button>
                    ))}
                </div>

                <div className="mt-12 flex justify-end">
                    {!showResult ? (
                        <button 
                            disabled={!selectedOption}
                            onClick={handleCheck}
                            className="professional-button-primary px-10 py-4 shadow-2xl active:scale-95 disabled:grayscale"
                        >
                            Verify Logic Path
                        </button>
                    ) : (
                        <button 
                            onClick={nextProblem}
                            className="professional-button-secondary px-10 py-4 flex items-center gap-3 group"
                        >
                            Execute Next Problem
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
                {showResult ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className={cn(
                            "professional-card p-10 relative overflow-hidden border-2",
                            isCorrect ? "border-accent-green/30" : "border-red-500/30"
                        )}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                                    isCorrect ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-500"
                                )}>
                                    {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                </div>
                                <h3 className={cn("text-2xl font-black uppercase tracking-tighter", isCorrect ? "text-accent-green" : "text-red-400")}>
                                    {isCorrect ? "Perfect Logic" : "Neural Friction"}
                                </h3>
                            </div>
                            
                            <div className="prose prose-invert prose-p:text-text-dim prose-p:text-sm prose-p:leading-relaxed prose-strong:text-text-main">
                                <ReactMarkdown>{currentProblem.explanation}</ReactMarkdown>
                            </div>
                        </div>

                        {!isCorrect && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="professional-card p-10 border-dashed border-2 bg-gradient-to-br from-bg-panel to-bg-deep"
                            >
                                <div className="flex items-center gap-3 mb-6 text-accent-blue font-black uppercase tracking-[0.3em] text-[10px]">
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    AI Error Analysis
                                </div>
                                {analyzing ? (
                                    <div className="space-y-4">
                                        <div className="h-4 bg-bg-hover animate-pulse rounded w-3/4" />
                                        <div className="h-4 bg-bg-hover animate-pulse rounded w-1/2" />
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-p:text-text-dim prose-p:text-sm leading-none italic">
                                        <ReactMarkdown>{analysis || ''}</ReactMarkdown>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <div className="professional-card p-12 text-center space-y-8 h-full flex flex-col items-center justify-center border-dashed border-2">
                        <div className="w-20 h-20 bg-bg-hover rounded-full flex items-center justify-center text-text-dim/30">
                            <Brain className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-text-dim uppercase tracking-widest italic">Awaiting Response</h3>
                            <p className="text-[10px] text-text-dim/60 leading-relaxed uppercase tracking-[0.2em] max-w-[200px] mx-auto">
                                The Assessment Hub is monitoring your neural patterns for logic gaps...
                            </p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
