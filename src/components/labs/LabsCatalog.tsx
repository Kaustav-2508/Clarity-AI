import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, FlaskConical, Target, Zap, Rocket, Atom, Microscope, Cpu, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MentalSandbox } from '../mentor/MentalSandbox';

const LABS = [
  {
    id: 'physics-motion',
    title: 'Kinetic Neural Labs',
    subject: 'Physics',
    icon: Rocket,
    color: 'accent-blue',
    description: 'Explore Newtonian mechanics in a zero-gravity neural environment.',
    variables: ['Mass', 'Initial Force', 'Friction', 'Gravity']
  },
  {
    id: 'code-logic',
    title: 'Logic Gate Optimizer',
    subject: 'Programming',
    icon: Cpu,
    color: 'accent-green',
    description: 'Visualize algorithmic complexity and recursion depth constraints.',
    variables: ['Iterative Depth', 'Memory Allocation', 'Concurrency', 'Cycle Speed']
  },
  {
    id: 'chem-quantum',
    title: 'Quantum Orbit Shells',
    subject: 'Chemistry',
    icon: Atom,
    color: 'purple-500',
    description: 'Synthesize molecular bonds and observe quantum tunneling effects.',
    variables: ['Valence Energy', 'Atomic Radius', 'Electronegativity', 'Thermal Noise']
  },
  {
    id: 'bio-genetic',
    title: 'Genetic Sequence Forge',
    subject: 'Biology',
    icon: Microscope,
    color: 'accent-orange',
    description: 'Model allele distributions and selective pressure outcomes.',
    variables: ['Mutation Rate', 'Population Bias', 'Selection Intensity', 'Drift Factor']
  }
];

export function LabsCatalog() {
  const [selectedLab, setSelectedLab] = useState<typeof LABS[0] | null>(null);

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Interactive Laboratories</h2>
          <p className="text-text-dim mt-2 text-lg">Hands-on mental sandboxes for deep-principled mastery.</p>
        </div>
        <div className="flex gap-4">
            <div className="professional-card px-4 py-2 flex items-center gap-2 border-accent-blue/20">
                <Beaker className="w-4 h-4 text-accent-blue" />
                <span className="text-xs font-bold text-text-main">4 Labs Available</span>
            </div>
        </div>
      </header>

      {selectedLab ? (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <button 
                onClick={() => setSelectedLab(null)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-accent-blue transition-colors"
            >
                ← Return to Laboratories
            </button>
            <MentalSandbox 
                title={selectedLab.title}
                description={selectedLab.description}
                variables={selectedLab.variables}
            />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LABS.map((lab) => (
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              key={lab.id}
              onClick={() => setSelectedLab(lab)}
              className="professional-card p-1 group cursor-pointer overflow-hidden transition-all"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-bg-deep group-hover:scale-110")}>
                    <lab.icon className={cn("w-7 h-7", lab.color === 'accent-blue' ? 'text-accent-blue' : lab.color === 'accent-green' ? 'text-accent-green' : lab.color === 'purple-500' ? 'text-purple-500' : 'text-orange-500')} />
                  </div>
                  <span className="px-3 py-1 bg-bg-deep rounded-full text-[10px] font-black uppercase tracking-widest text-text-dim border border-border-subtle group-hover:border-accent-blue/30 group-hover:text-accent-blue transition-colors">
                    {lab.subject}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-text-main group-hover:text-accent-blue transition-colors">{lab.title}</h3>
                  <p className="text-sm text-text-dim leading-relaxed">{lab.description}</p>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-50">{lab.variables.length} Dynamic Variables</span>
                    <ArrowRight className="w-4 h-4 text-text-dim group-hover:translate-x-1 group-hover:text-accent-blue transition-all" />
                </div>
              </div>
              
              {/* Subtle accent hover bar */}
              <div className={cn("h-1 w-0 group-hover:w-full transition-all duration-500", 
                 lab.color === 'accent-blue' ? 'bg-accent-blue' : 
                 lab.color === 'accent-green' ? 'bg-accent-green' : 
                 lab.color === 'purple-500' ? 'bg-purple-500' : 'bg-orange-500')} 
              />
            </motion.div>
          ))}
          
          <div className="professional-card p-8 border-dashed flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
             <FlaskConical className="w-10 h-10 text-text-dim" />
             <div className="space-y-1">
                <span className="text-sm font-bold text-text-main uppercase tracking-widest">More Labs Coming</span>
                <p className="text-xs text-text-dim">Our AI Engine is synthesizing new specialized environments.</p>
             </div>
          </div>
        </div>
      )}

      {/* Global Sandbox Section */}
      {!selectedLab && (
        <div className="pt-10 border-t border-border-subtle">
            <div className="bg-bg-panel border border-border-subtle rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Neural Customizer</span>
                    </div>
                    <h2 className="text-3xl font-bold text-text-main">Autonomous Sandbox</h2>
                    <p className="text-text-dim text-lg leading-relaxed">
                        Don't see the lab you need? Generate a custom interactive environment by asking the **AI Mentor** about any concept.
                    </p>
                    <button 
                        onClick={() => {/* Link back to mentor */}}
                        className="professional-button-primary px-8"
                    >
                        Head to AI Mentor
                    </button>
                </div>
                <div className="w-full md:w-80 aspect-square bg-bg-deep border border-border-subtle rounded-2xl flex items-center justify-center overflow-hidden relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-40 h-40 border-2 border-dashed border-accent-blue/30 rounded-full flex items-center justify-center"
                    >
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 bg-accent-blue rounded-xl"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
