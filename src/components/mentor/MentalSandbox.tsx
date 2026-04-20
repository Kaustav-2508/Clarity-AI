import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Settings2, Beaker, Zap } from 'lucide-react';

interface MentalSandboxProps {
  title: string;
  description: string;
  variables: string[];
}

export function MentalSandbox({ title, description, variables }: MentalSandboxProps) {
  const [vals, setVals] = useState<Record<string, number>>(
    variables.reduce((acc, v) => ({ ...acc, [v]: 50 }), {})
  );
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleSimulate = () => {
    if (!isRunning) {
      setHistory([...history, { ...vals, timestamp: Date.now() }]);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="professional-card bg-bg-panel border-border-subtle overflow-hidden">
      <div className="p-4 border-b border-border-subtle bg-bg-deep/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Beaker className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-green">Cognitive Simulation Lab v2.0</span>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleSimulate}
                className="flex items-center gap-2 px-4 py-1.5 bg-accent-green text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-emerald-600 active:scale-95 shadow-lg shadow-accent-green/20"
            >
                {isRunning ? (
                    <><RotateCcw className="w-3 h-3" /> Terminate</>
                ) : (
                    <><Play className="w-3 h-3" /> Initialize</>
                )}
            </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
            <div className="space-y-3">
                <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
                    {title}
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    </motion.div>
                </h4>
                <p className="text-xs text-text-dim leading-relaxed font-medium">{description}</p>
            </div>

            <div className="space-y-6 pt-4 border-t border-border-subtle">
                {variables.map((v) => (
                    <div key={v} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim flex items-center gap-2">
                                <Settings2 className="w-3 h-3" />
                                {v}
                            </label>
                            <span className="text-xs font-mono text-accent-green font-black px-2 py-0.5 bg-accent-green/10 rounded">{vals[v]} quantum units</span>
                        </div>
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            value={vals[v]}
                            onChange={(e) => setVals({ ...vals, [v]: parseInt(e.target.value) })}
                            className="w-full accent-accent-green h-1 bg-bg-deep rounded-full appearance-none cursor-pointer border border-border-subtle"
                        />
                    </div>
                ))}
            </div>

            {history.length > 0 && (
                <div className="pt-6 border-t border-border-subtle">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-dim opacity-50 block mb-3">Simulation History</span>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {history.slice(-5).map((h, i) => (
                            <div key={i} className="px-3 py-1 bg-bg-deep border border-border-subtle rounded text-[9px] font-mono text-text-dim shrink-0">
                                #{i+1}: {Object.values(h)[0] as number}%
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="relative aspect-square rounded-2xl bg-bg-deep border border-border-subtle flex items-center justify-center overflow-hidden shadow-inner">
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
            />
            
            {/* Visualizer Engine */}
            <div className="relative z-10 w-full h-full p-12">
                <AnimatePresence mode="wait">
                    {isRunning ? (
                        <motion.div 
                            key="running"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <div className="relative">
                                {/* Orbitals */}
                                {[1, 2, 3].map((circle) => (
                                    <motion.div
                                        key={circle}
                                        className="absolute inset-0 border border-accent-green/20 rounded-full"
                                        style={{ margin: -circle * 20 }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10 / circle, repeat: Infinity, ease: "linear" }}
                                    />
                                ))}

                                {/* Core Entity */}
                                <motion.div 
                                    animate={{ 
                                        scale: Object.values(vals).reduce((a, b) => a + b, 0) / (variables.length * 40),
                                        rotate: vals[variables[0]] * 3.6 || 0,
                                        borderRadius: ["30%", "50%", "40%", "30%"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-32 h-32 bg-gradient-to-tr from-accent-green to-cyan-400 shadow-[0_0_80px_rgba(16,185,129,0.3)] relative group"
                                >
                                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-subtle flex items-center justify-center">
                                <Zap className="w-8 h-8 text-border-subtle" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-dim opacity-50 animate-pulse">Neural Lab Offline</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Real-time Telemetry Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-accent-green bg-bg-panel/80 backdrop-blur-md p-3 rounded-xl border border-border-subtle uppercase">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-accent-green animate-ping" /> FPS: 60.0</span>
                    <span className="opacity-50">LATENCY: 0.02ms</span>
                </div>
                <div className="font-black">INTEGRITY: 99.8%</div>
            </div>
        </div>
      </div>
    </div>
  );
}
