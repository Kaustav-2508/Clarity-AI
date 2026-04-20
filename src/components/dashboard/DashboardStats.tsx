import { motion } from 'motion/react';
import { Star, Zap, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function DashboardStats() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Knowledge Points', value: `${profile?.points || 0} XP`, icon: Star, color: 'text-accent-blue', detail: 'Elite Tier' },
    { label: 'Current Streak', value: `${profile?.streak || 0} Days`, icon: Zap, color: 'text-orange-400', detail: 'Top 5%' },
    { label: 'Focus Minutes', value: '342m', icon: Clock, color: 'text-accent-green', detail: '+12% vs LW' },
    { label: 'Accuracy', value: '88%', icon: CheckCircle, color: 'text-accent-blue', detail: 'Cognitive Sync' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={stat.label}
          className="professional-card p-6 group hover:border-accent-blue/30 transition-all cursor-crosshair"
        >
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 bg-bg-deep rounded-lg flex items-center justify-center">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-text-dim/70 truncate">{stat.label}</span>
          </div>
          <div className="text-2xl font-black text-text-main tracking-tighter uppercase italic">{stat.value}</div>
          <div className="mt-2 text-[9px] font-bold text-text-dim/50 uppercase tracking-widest flex items-center gap-2">
             <div className="w-1 h-1 bg-accent-blue rounded-full" />
             {stat.detail}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
