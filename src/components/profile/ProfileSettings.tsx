import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { Target, Save, X, Plus, GraduationCap, Brain, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ProfileSettings() {
  const { profile, updateProfile, user } = useAuth();
  const [formData, setFormData] = useState({
    grade: profile?.grade || '',
    subjects: [...(profile?.subjects || [])],
    goals: {
      type: profile?.goals?.type || 'school',
      targetExams: [...(profile?.goals?.targetExams || [])]
    },
    weakAreas: [...(profile?.weakAreas || [])],
    strongAreas: [...(profile?.strongAreas || [])]
  });

  const [examInput, setExamInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeExam = (exam: string) => {
    setFormData({
      ...formData,
      goals: {
        ...formData.goals,
        targetExams: formData.goals.targetExams.filter(e => e !== exam)
      }
    });
  };

  const addExam = (e?: any) => {
    e?.preventDefault();
    if (examInput && !formData.goals.targetExams.includes(examInput)) {
      setFormData({
        ...formData,
        goals: {
          ...formData.goals,
          targetExams: [...formData.goals.targetExams, examInput]
        }
      });
      setExamInput('');
    }
  };

  const removeSubject = (sub: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== sub)
    });
  };

  const addSubject = (e?: any) => {
    e?.preventDefault();
    if (subjectInput && !formData.subjects.includes(subjectInput)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput]
      });
      setSubjectInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">
            Neural <span className="text-accent-blue">Configuration</span>
          </h1>
          <p className="text-sm text-text-dim mt-1">Manage your academic profile and exam targets</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-blue text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-blue/20 disabled:opacity-50"
        >
          {saving ? 'Syncing...' : success ? 'Config Saved' : 'Save Config'}
          <Save className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="professional-card p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight italic uppercase">Target Exams</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-50">Define your curriculum destination</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, goals: {...formData.goals, type: 'school'}})}
                  className={cn(
                    "flex-1 p-5 rounded-xl border transition-all text-center text-xs font-bold uppercase tracking-widest", 
                    formData.goals.type === 'school' ? "bg-accent-blue/5 border-accent-blue/30 text-accent-blue" : "bg-bg-deep border-border-subtle text-text-dim"
                  )}
                >
                  Academic Exams
                </button>
                <button 
                  onClick={() => setFormData({...formData, goals: {...formData.goals, type: 'competitive'}})}
                  className={cn(
                    "flex-1 p-5 rounded-xl border transition-all text-center text-xs font-bold uppercase tracking-widest", 
                    formData.goals.type === 'competitive' ? "bg-accent-blue/5 border-accent-blue/30 text-accent-blue" : "bg-bg-deep border-border-subtle text-text-dim"
                  )}
                >
                  Competitive Tests
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest italic">Specific Exam Targets</h3>
                <form onSubmit={addExam} className="relative">
                  <input 
                    className="w-full bg-bg-deep border border-border-subtle rounded-xl px-4 py-4 text-text-main outline-none focus:border-accent-blue/50 transition-all text-sm pr-20"
                    placeholder="Add target exam (e.g. SAT, JEE, MCAT...)"
                    value={examInput}
                    onChange={(e) => setExamInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={addExam}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 mt-4">
                  <AnimatePresence>
                    {formData.goals.targetExams.map((exam) => (
                      <motion.div 
                        key={exam}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 rounded-xl"
                      >
                        <span className="text-xs font-bold text-accent-blue">{exam}</span>
                        <button 
                          onClick={() => removeExam(exam)}
                          className="text-accent-blue/60 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-8 border-t border-border-subtle">
                <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-widest italic">Target Subjects</h3>
                <form onSubmit={addSubject} className="relative">
                  <input 
                    className="w-full bg-bg-deep border border-border-subtle rounded-xl px-4 py-4 text-text-main outline-none focus:border-accent-blue/50 transition-all text-sm pr-20"
                    placeholder="Add study subject (e.g. Physics, History...)"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={addSubject}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 mt-4">
                  <AnimatePresence>
                    {formData.subjects.map((sub) => (
                      <motion.div 
                        key={sub}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green/20 rounded-xl"
                      >
                        <span className="text-xs font-bold text-accent-green">{sub}</span>
                        <button 
                          onClick={() => removeSubject(sub)}
                          className="text-accent-green/60 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="professional-card p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-green/10 rounded-2xl flex items-center justify-center text-accent-green">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight italic uppercase">Academic Level</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-50">Current educational status</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Middle School', 'High School', 'College', 'Post-Grad', 'Competitive prep'].map((g) => (
                <button 
                  key={g}
                  onClick={() => setFormData({...formData, grade: g})}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all text-xs font-bold uppercase tracking-tight",
                    formData.grade === g 
                      ? "bg-accent-green/5 border-accent-green/30 text-accent-green" 
                      : "bg-bg-deep border-border-subtle text-text-dim hover:border-text-dim/30"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="professional-card p-8 bg-accent-blue/5 border-accent-blue/10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-accent-blue" />
              <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Neural Identity</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim opacity-50">Linked Node</div>
                <div className="text-xs font-bold text-text-main truncate">{user?.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim opacity-50">Profile UID</div>
                <div className="text-[10px] font-mono text-text-dim truncate">{user?.uid}</div>
              </div>
              <div className="pt-4 mt-4 border-t border-border-subtle">
                 <div className="flex items-center justify-between mb-4">
                   <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim opacity-50">Network Status</div>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                     <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">Active</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="professional-card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Neural Synthesis</h3>
            </div>
            <p className="text-xs text-text-dim leading-relaxed italic">
              "Changing your target exams will recalibrate the AI mentor to prioritize relevant mental models and curriculum-specific problem sets."
            </p>
            <div className="bg-bg-deep p-4 rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-dim">Adaptive Logic</span>
                <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest">Enabled</span>
              </div>
              <div className="h-1 w-full bg-border-subtle rounded-full overflow-hidden">
                <div className="h-full bg-accent-blue w-[85%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
