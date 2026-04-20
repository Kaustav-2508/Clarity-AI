import { motion } from 'motion/react';
import { Globe, Heart, Shield, Users, ArrowUpRight, CheckCircle, Zap, Sparkles, Target } from 'lucide-react';

export function NonprofitView() {
  const pillars = [
    { 
        title: "Lack of Guidance", 
        desc: "Millions of students fail to reach their potential not because of lack of talent, but lack of elite-level direction.",
        icon: Target 
    },
    { 
        title: "Education Inequality", 
        desc: "Quality private tutoring is a luxury for the 1%. We believe high-tier mentorship is a basic human right.",
        icon: Shield
    },
    { 
        title: "Concept Clarity", 
        desc: "Surface-level learning leads to exam stress. We focus on the 'Neural Why' to build lasting confidence.",
        icon: Zap
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-24 pb-20">
      <section className="text-center space-y-10 pt-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-blue/10 blur-[100px] rounded-full -z-10" />
        
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-accent-blue rounded-[2.5rem] mx-auto flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-accent-blue/40 border-4 border-white/10"
        >
            C
        </motion.div>
        
        <div className="space-y-4">
            <h1 className="text-6xl font-black text-text-main tracking-tight leading-tight uppercase">
                ClarityAI <span className="text-accent-blue opacity-80">Foundation</span>
            </h1>
            <p className="text-text-dim text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                We are a non-profit engineering laboratory dedicated to democratizing elite-level education for every student on Earth.
            </p>
        </div>

        <div className="flex justify-center gap-4">
            <button className="professional-button-primary px-10 py-4 text-sm shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                <Heart className="w-5 h-5 fill-white" />
                Back Our Mission
            </button>
            <button className="professional-button-secondary px-10 py-4 text-sm hover:scale-105 transition-all">
                The Whitepaper
            </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((p, i) => (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={p.title} 
                className="professional-card p-10 group hover:border-accent-blue/30 transition-all relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue mb-8">
                    <p.icon className="w-6 h-6" />
                </div>
                <h3 className="text-text-main font-black uppercase tracking-widest text-xs mb-4">{p.title}</h3>
                <p className="text-text-dim text-sm leading-relaxed font-medium">{p.desc}</p>
            </motion.div>
        ))}
      </section>

      <section className="space-y-16">
        <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-text-main shrink-0 uppercase tracking-tighter">Global Impact Lab</h2>
            <div className="h-px flex-1 bg-border-subtle" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
                <div className="flex gap-8 group">
                    <div className="w-14 h-14 bg-bg-panel border border-border-subtle rounded-2xl flex items-center justify-center shrink-0 group-hover:border-accent-blue/50 transition-all shadow-inner">
                        <Users className="text-accent-blue w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-text-main font-bold text-xl tracking-tight">Radical Personalization</h4>
                        <p className="text-text-dim text-sm mt-2 leading-relaxed">Our neural engines evolve with the individual student's pace, destroying misconceptions before they become mental roadblocks.</p>
                    </div>
                </div>
                <div className="flex gap-8 group">
                    <div className="w-14 h-14 bg-bg-panel border border-border-subtle rounded-2xl flex items-center justify-center shrink-0 group-hover:border-accent-green/50 transition-all shadow-inner">
                        <Shield className="text-accent-green w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-text-main font-bold text-xl tracking-tight">Ethical Integrity</h4>
                        <p className="text-text-dim text-sm mt-2 leading-relaxed">Zero surveillance capitalism. No ads, no data brokerage. Our only success metric is the depth of your understanding.</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-accent-blue to-blue-700 rounded-[4rem] p-16 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-black tracking-[0.4em] uppercase opacity-70">Current Velocity</span>
                </div>
                <h3 className="text-7xl font-black mb-4 tracking-tighter">500K+</h3>
                <p className="text-blue-100 text-lg leading-relaxed font-medium">Concepts mastered by our pilot group with a verifiable 42% average increase in academic confidence.</p>
                <div className="mt-12 flex items-center gap-3 font-black cursor-pointer hover:gap-5 transition-all text-[10px] uppercase tracking-[0.3em]">
                    The Human Impact Report
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
        </div>
      </section>

      <section className="bg-bg-panel border border-border-subtle rounded-[3.5rem] p-16 text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 bg-accent-blue/10 rounded-[2rem] flex items-center justify-center mx-auto relative">
            <Target className="text-accent-blue w-10 h-10" />
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-text-main uppercase tracking-tight">Mentorship as Infrastructure</h2>
            <p className="text-text-dim text-lg leading-relaxed font-medium">
                We don't view ClarityAI as an app, but as digital infrastructure for human potential. By removing the financial barrier to the world's best logic, we unlock the next generation of genius.
            </p>
        </div>
        <div className="pt-6">
             <div className="text-[10px] font-black uppercase text-accent-blue tracking-[0.5em] mb-4">Partner Organizations</div>
             <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 transition-all duration-700">
                <div className="text-xl font-bold tracking-tighter">EDU.GLOBAL</div>
                <div className="text-xl font-bold tracking-tighter">NEURAL_LEARN</div>
                <div className="text-xl font-bold tracking-tighter">HUMAN_PULSE</div>
             </div>
        </div>
      </section>
    </div>
  );
}
