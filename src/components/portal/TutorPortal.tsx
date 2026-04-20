import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, getDocs, addDoc, 
  onSnapshot, doc, updateDoc, getDoc, orderBy 
} from 'firebase/firestore';
import { 
  Users, Target, BookOpen, Clock, AlertTriangle, 
  LineChart, Plus, Search, ChevronRight, User,
  CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { StudentProfile, Assignment } from '../../types';
import { cn } from '../../lib/utils';

export function TutorPortal() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: ''
  });

  useEffect(() => {
    if (!user) return;
    // For a real app, we'd have a 'student_teacher' mapping collection.
    // Here we'll allow searching for any student by email.
  }, [user]);

  const handleSearch = async () => {
    if (!searchEmail) return;
    const q = query(collection(db, 'users'), where('email', '==', searchEmail), where('role', '==', 'student'));
    const snap = await getDocs(q);
    if (!snap.empty) {
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  useEffect(() => {
    if (!selectedStudent) return;
    const q = query(collection(db, 'assignments'), where('studentId', '==', selectedStudent.id));
    return onSnapshot(q, (snap) => {
        setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
    });
  }, [selectedStudent]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudent) return;
    await addDoc(collection(db, 'assignments'), {
      ...newAssignment,
      teacherId: user.uid,
      studentId: selectedStudent.id,
      completed: false,
      dueDate: new Date(newAssignment.dueDate).getTime(),
      createdAt: Date.now(),
      tasks: []
    });
    setNewAssignment({ title: '', description: '', subject: '', dueDate: '' });
    setShowAssign(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Tutor Command Center</h1>
          <p className="text-sm text-text-dim">Monitor progress and guide your students to success.</p>
        </div>
        <div className="flex bg-bg-panel border border-border-subtle rounded-lg p-1">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input 
                    className="bg-transparent border-none pl-9 pr-4 py-1.5 text-xs text-text-main outline-none w-64"
                    placeholder="Search students by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <button onClick={handleSearch} className="px-3 py-1 bg-accent-blue text-white rounded-md text-[10px] font-bold">Search</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-2">Managed Students</h3>
            <div className="space-y-2">
                {students.map(s => (
                    <button 
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={cn(
                            "w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all",
                            selectedStudent?.id === s.id 
                                ? "bg-bg-hover border-accent-blue" 
                                : "professional-card"
                        )}
                    >
                        <div className="w-10 h-10 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-text-main truncate">{s.email.split('@')[0]}</div>
                            <div className="text-[10px] text-text-dim uppercase font-bold tracking-tighter">{s.grade}</div>
                        </div>
                    </button>
                ))}
                {students.length === 0 && (
                    <p className="text-center py-10 text-xs text-text-dim bg-bg-panel/30 border border-dashed border-border-subtle rounded-xl">
                        Find students using the search bar above.
                    </p>
                )}
            </div>
        </aside>

        <main className="lg:col-span-3">
            {selectedStudent ? (
                <div className="space-y-6">
                    <div className="professional-card p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                                    <User className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-text-main tracking-tight">{selectedStudent.email}</h2>
                                    <div className="flex gap-2 mt-2">
                                        <span className="subject-tag-professional">{selectedStudent.grade}</span>
                                        <span className="px-3 py-1 bg-accent-green/10 text-accent-green border border-accent-green/20 rounded-full text-[10px] font-bold">14 Day Streak</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAssign(true)}
                                className="professional-button-primary flex items-center gap-2 text-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Create Assignment
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-bg-deep p-4 rounded-xl border border-border-subtle">
                                <span className="text-[10px] text-text-dim uppercase font-bold block mb-1">Knowledge Points</span>
                                <div className="text-xl font-bold text-accent-blue">{selectedStudent.points || 0} XP</div>
                            </div>
                            <div className="bg-bg-deep p-4 rounded-xl border border-border-subtle">
                                <span className="text-[10px] text-text-dim uppercase font-bold block mb-1">Topics Mastered</span>
                                <div className="text-xl font-bold text-text-main">{selectedStudent.totalTopicsStudied || 0}</div>
                            </div>
                            <div className="bg-bg-deep p-4 rounded-xl border border-border-subtle">
                                <span className="text-[10px] text-text-dim uppercase font-bold block mb-1">Weak Areas</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedStudent.weakAreas?.map((wa: string) => (
                                        <span key={wa} className="px-2 py-0.5 bg-red-400/10 text-red-400 rounded text-[9px] font-bold">{wa}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="professional-card p-6">
                            <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent-blue" />
                                Active Assignments
                            </h3>
                            <div className="space-y-3">
                                {assignments.length ? assignments.map(as => (
                                    <div key={as.id} className="p-4 bg-bg-hover/50 border border-border-subtle rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-text-main">{as.title}</div>
                                            <div className="text-[10px] text-text-dim mt-1">Due {new Date(as.dueDate).toLocaleDateString()}</div>
                                        </div>
                                        {as.completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-accent-green" />
                                        ) : (
                                            <span className="text-[9px] font-bold text-text-dim bg-bg-deep px-2 py-1 rounded">PENDING</span>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-center py-6 text-[10px] text-text-dim">No assignments active.</p>
                                )}
                            </div>
                        </div>

                        <div className="professional-card p-6">
                             <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-accent-green" />
                                Difficulty Analysis
                            </h3>
                            <div className="space-y-4">
                                {selectedStudent.weakAreas?.length ? (
                                    selectedStudent.weakAreas.map((wa: string) => (
                                        <div key={wa} className="space-y-1.5">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-text-main font-bold">{wa}</span>
                                                <span className="text-red-400">Critical Revise</span>
                                            </div>
                                            <div className="h-1 bg-bg-deep rounded-full overflow-hidden">
                                                <div className="h-full bg-red-400" style={{ width: '85%' }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-text-dim">
                                        <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-[10px]">No major difficulties detected yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-bg-panel border border-border-subtle rounded-[2rem] flex items-center justify-center text-text-dim shadow-inner">
                        <Users className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main">No Student Selected</h2>
                        <p className="text-sm text-text-dim max-w-xs mt-2">Select a student from the sidebar to view their detailed performance and assign training tasks.</p>
                    </div>
                </div>
            )}
        </main>
      </div>

      <AnimatePresence>
        {showAssign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md professional-card p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center text-accent-blue">
                            <Target className="w-5 h-5" />
                         </div>
                        <h2 className="text-xl font-bold text-text-main">Post Assignment</h2>
                    </div>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Learning Goal</label>
                            <input 
                                required
                                className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-accent-blue/50"
                                placeholder="e.g. Master Calculus Limits"
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Instructions</label>
                            <textarea 
                                required
                                className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-accent-blue/50 h-24"
                                placeholder="Read Chapter 4 and complete Practice Set A..."
                                value={newAssignment.description}
                                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Subject</label>
                                <input 
                                    required
                                    className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-main outline-none focus:border-accent-blue/50"
                                    value={newAssignment.subject}
                                    onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Due Date</label>
                                <input 
                                    required
                                    type="date"
                                    className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-main outline-none focus:border-accent-blue/50"
                                    value={newAssignment.dueDate}
                                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-6">
                            <button type="button" onClick={() => setShowAssign(false)} className="flex-1 professional-button-secondary text-sm">Cancel</button>
                            <button type="submit" className="flex-1 professional-button-primary text-sm shadow-lg shadow-accent-blue/20">Assign Task</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
