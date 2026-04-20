import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X, Brain, Target, Zap, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TourStep {
  title: string;
  description: string;
  icon: any;
  highlight?: string; // CSS selector to highlight
}

const STEPS: TourStep[] = [
  {
    title: "Neuro-Sync Protocols",
    description: "Welcome to CharityAI Elite. We've recalibrated your learning environment with deep conceptual simulations and first-principles reasoning.",
    icon: Sparkles
  },
  {
    title: "AI Mentor Engine",
    description: "Toggle 'Active Thinking' to see recursive logic, explore 'Mental Models', and test hypotheses in the 'Mental Sandbox'.",
    icon: Brain,
    highlight: '[data-tour="neural-link"]'
  },
  {
    title: "Laboratories Catalog",
    description: "Access high-fidelity simulations for Physics, Biology, and beyond. Run 'What-If' scenarios to achieve total mastery.",
    icon: Zap,
    highlight: '[data-tour="laboratories"]'
  },
  {
    title: "Intelligence Metrics",
    description: "Your Cognitive Velocity and performance matrices are visualized here. Watch your neural maps evolve with every problem solved.",
    icon: Activity,
    highlight: '[data-tour="concept-map"]'
  }
];

export function TourGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('clarity_ai_tour_seen');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const closeTour = () => {
    localStorage.setItem('clarity_ai_tour_seen', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md professional-card bg-bg-panel border-accent-blue/30 p-8 relative shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
            <button onClick={closeTour} className="p-2 text-text-dim hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-blue/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-blue/10 rounded-full blur-[80px]" />

        <div className="relative space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue group">
                    <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue mb-1">Step {currentStep + 1} of {STEPS.length}</div>
                   <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter italic leading-none">{step.title}</h2>
                </div>
            </div>

            <p className="text-text-dim text-sm leading-relaxed font-medium">
                {step.description}
            </p>

            <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                        <div key={i} className={cn(
                            "h-1 transition-all rounded-full",
                            i === currentStep ? "w-8 bg-accent-blue" : "w-2 bg-border-subtle"
                        )} />
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {currentStep > 0 && (
                        <button 
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-text-main transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button 
                        onClick={nextStep}
                        className="bg-accent-blue text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-blue/20"
                    >
                        {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next Intelligence'}
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
