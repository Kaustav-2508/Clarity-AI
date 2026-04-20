import { motion } from 'motion/react';
import { Brain, Sparkles, Target, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ClarityLedger() {
  const { profile } = useAuth();
  
  const ledgers = [
    { title: 'Curriculum Rationale', icon: Target, text: `Your current path in ${profile?.subjects?.[0] || 'your core subjects'} was selected based on your reported weakness in ${profile?.weakAreas?.[0] || 'foundational areas'}. We are prioritizing First-Principles learning to build a robust neural foundation.` },
    { title: 'Neural Velocity', icon: Zap, text: 'We detected increased latency in your response to complex problems. Your curriculum now integrates more spaced-repetition sessions to stabilize your retention curve.' },
    { title: 'Elite Focus', icon: Brain, text: `Your goal is ${profile?.goals?.targetExams?.[0] || 'Competitive Excellence'}. Our simulation parameters have been adjusted to match those specific testing environments.` }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-blue italic">The Neural Ledger</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ledgers.map((l, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            key={l.title}
            className="professional-card bg-bg-deep p-6 border border-border-subtle group"
          >
            <div className="flex items-center gap-3 mb-4 text-accent-blue">
                <l.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{l.title}</span>
            </div>
            <p className="text-[10px] text-text-dim leading-relaxed font-medium group-hover:text-text-main transition-colors">{l.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
