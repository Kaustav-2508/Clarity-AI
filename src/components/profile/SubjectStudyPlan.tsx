import { StudyPlan } from '../../types';
import { motion } from 'motion/react';
import { Target, CheckCircle2 } from 'lucide-react';

export function SubjectStudyPlan({ plan }: { plan: StudyPlan }) {
  return (
    <div className="professional-card p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Target className="w-6 h-6 text-accent-blue" />
        <h3 className="text-xl font-black uppercase tracking-tighter text-text-main italic">{plan.subject} Plan: {plan.goal}</h3>
      </div>
      <div className="space-y-3">
        {plan.tasks.map(task => (
           <div key={task.id} className="flex items-start gap-4 p-4 bg-bg-deep rounded-xl border border-border-subtle group hover:border-accent-blue/30 transition-all">
             <CheckCircle2 className={`w-5 h-5 ${task.completed ? 'text-accent-green' : 'text-text-dim'}`} />
             <div>
                <h4 className="font-bold text-text-main">{task.title}</h4>
                <p className="text-[10px] text-text-dim font-medium">{task.description}</p>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
