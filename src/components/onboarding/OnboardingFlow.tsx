import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function OnboardingFlow() {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    grade: '',
    subjects: [] as string[],
    role: 'student' as 'student' | 'teacher',
    goals: { type: 'school' as 'school' | 'competitive', targetExams: [] as string[] },
    weakAreas: [] as string[],
    onboarded: true
  });

  const [examInput, setExamInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');

  const handleComplete = async () => {
    await updateProfile(formData);
  };

  const nextStep = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between mb-8">
            {[0, 1, 2, 3, 4].map((s) => (
                <div key={s} className={cn("h-1 flex-1 mx-1 rounded-full transition-all", s <= step ? "bg-accent-blue" : "bg-bg-panel")} />
            ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="professional-card p-12 shadow-2xl"
        >
          {step === 0 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Welcome to ClarityAI</h2>
                <p className="text-text-dim text-sm">Tell us your role to customize your experience.</p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <button 
                  onClick={() => { setFormData({...formData, role: 'student'}); setStep(1); }}
                  className="p-8 rounded-xl border border-border-subtle hover:border-accent-blue bg-bg-panel text-center group transition-all"
                >
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="text-accent-blue w-6 h-6" />
                  </div>
                  <div className="text-text-main font-bold">Student</div>
                  <p className="text-xs text-text-dim mt-2">I want to learn and master subjects.</p>
                </button>
                <button 
                  onClick={() => { setFormData({...formData, role: 'teacher'}); setStep(1); }}
                  className="p-8 rounded-xl border border-border-subtle hover:border-accent-green bg-bg-panel text-center group transition-all"
                >
                  <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target className="text-accent-green w-6 h-6" />
                  </div>
                  <div className="text-text-main font-bold">Teacher / Tutor</div>
                  <p className="text-xs text-text-dim mt-2">I want to guide students and track progress.</p>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="w-12 h-12 bg-accent-blue/10 rounded flex items-center justify-center mb-4">
                <GraduationCap className="text-accent-blue w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">Select your Grade</h2>
              <p className="text-text-dim text-sm">Tell us where you are currently studying.</p>
              <div className="grid grid-cols-2 gap-3 pt-4">
                {['Middle School', 'High School', 'College / University', 'Post-Grad', 'Competitive prep'].map((g) => (
                  <button 
                    key={g}
                    onClick={() => { setFormData({...formData, grade: g}); nextStep(); }}
                    className={cn(
                        "p-4 rounded-lg border text-left transition-all text-sm",
                        formData.grade === g 
                          ? "bg-bg-hover border-accent-blue text-text-main" 
                          : "bg-bg-panel border-border-subtle text-text-dim hover:border-text-dim/30"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="w-12 h-12 bg-accent-blue/10 rounded flex items-center justify-center mb-4">
                <Target className="text-accent-blue w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">What are your goals?</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, goals: {...formData.goals, type: 'school'}})}
                  className={cn(
                    "flex-1 p-5 rounded-lg border transition-all text-center text-sm", 
                    formData.goals.type === 'school' ? "bg-bg-hover border-accent-blue text-text-main" : "bg-bg-panel border-border-subtle text-text-dim"
                  )}
                >
                  School/College Exams
                </button>
                <button 
                  onClick={() => setFormData({...formData, goals: {...formData.goals, type: 'competitive'}})}
                  className={cn(
                    "flex-1 p-5 rounded-lg border transition-all text-center text-sm", 
                    (formData.goals.type as string) === 'competitive' ? "bg-bg-hover border-accent-blue text-text-main" : "bg-bg-panel border-border-subtle text-text-dim"
                  )}
                >
                  Competitive Exams
                </button>
              </div>
              <div className="pt-4">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-text-dim mb-2 font-bold">Target Exams (Press Enter)</label>
                <input 
                  className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-3 text-text-main mb-4 outline-none focus:border-accent-blue/50 transition-all text-sm"
                  placeholder="e.g. SAT, JEE, GRE, Finals..."
                  value={examInput}
                  onChange={(e) => setExamInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && examInput) {
                        setFormData({...formData, goals: {...formData.goals, targetExams: [...formData.goals.targetExams, examInput]}});
                        setExamInput('');
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                    {formData.goals.targetExams.map(ex => (
                      <span key={ex} className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-[10px] uppercase font-bold text-accent-blue">{ex}</span>
                    ))}
                </div>
              </div>
              <button 
                disabled={formData.goals.targetExams.length === 0}
                onClick={nextStep}
                className="w-full professional-button-primary disabled:opacity-50 mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="w-12 h-12 bg-red-400/10 rounded flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">Focus Areas</h2>
              <p className="text-text-dim text-sm">Which subjects or topics do you find difficult? (Optional)</p>
              <div className="pt-4">
                <input 
                  className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-3 text-text-main mb-4 outline-none focus:border-accent-blue/50 transition-all text-sm"
                  placeholder="e.g. Quantum Physics, Organic Chem, Calculus..."
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subjectInput) {
                        setFormData({...formData, weakAreas: [...formData.weakAreas, subjectInput]});
                        setSubjectInput('');
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                    {formData.weakAreas.map(wa => (
                      <span key={wa} className="px-3 py-1 bg-red-400/10 border border-red-400/20 rounded-full text-[10px] uppercase font-bold text-red-400">{wa}</span>
                    ))}
                </div>
              </div>
              <button 
                onClick={nextStep}
                className="w-full professional-button-primary mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-accent-green w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight">All Set!</h2>
              <p className="text-text-dim text-sm max-w-xs mx-auto">
                Your profile is ready. ClarityAI will now adapt to your learning style and goals.
              </p>
              <button 
                onClick={handleComplete}
                className="w-full professional-button-primary mt-8 shadow-xl shadow-accent-blue/20"
              >
                Enter Workspace
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
