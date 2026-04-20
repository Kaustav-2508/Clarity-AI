import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar, ChevronRight, Lock, Sparkles, Brain, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PYQPreset {
    id: string;
    exam: string;
    year: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    premium?: boolean;
}

const PRESETS: PYQPreset[] = [
    { id: 'sat-2023-oct', exam: 'SAT', year: '2023', title: 'October Digital SAT Practice', difficulty: 'Medium' },
    { id: 'sat-2023-mar', exam: 'SAT', year: '2023', title: 'March Digital SAT Practice', difficulty: 'Hard' },
    { id: 'jee-2024-jan', exam: 'JEE', year: '2024', title: 'January Session 1 (Shift 1)', difficulty: 'Hard' },
    { id: 'jee-2023-apr', exam: 'JEE', year: '2023', title: 'April Session 2 (Shift 2)', difficulty: 'Hard' },
    { id: 'neet-2023-may', exam: 'NEET', year: '2023', title: 'National Eligibility Cum Entrance', difficulty: 'Medium' },
    { id: 'mcat-2024-jan', exam: 'MCAT', year: '2024', title: 'Physical & Biological Sciences', difficulty: 'Hard' },
    { id: 'mcat-2023-sep', exam: 'MCAT', year: '2023', title: 'Psychological & Social Foundations', difficulty: 'Medium' },
    { id: 'gre-2024-feb', exam: 'GRE', year: '2024', title: 'Quantitative Reasoning Focus', difficulty: 'Medium' }
];

export function PYQSelector({ selectedExam, onSelect }: { selectedExam: string, onSelect: (preset: PYQPreset) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filtered = PRESETS.filter(p => 
        p.exam === selectedExam && 
        (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.year.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2 italic">
                        <FileText className="w-4 h-4 text-yellow-500" />
                        PYQ Archives: {selectedExam}
                    </h3>
                    <p className="text-[10px] text-text-dim uppercase font-bold tracking-tighter">Choose a breakthrough session to simulate</p>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                    <input 
                        type="text"
                        placeholder="Filter archives..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-deep border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-[10px] uppercase font-black tracking-widest text-text-main outline-none focus:border-yellow-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        className="professional-card p-6 text-left group hover:border-yellow-500/30 transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">
                                    {preset.year} • {preset.difficulty}
                                </div>
                                <div className="text-sm font-bold text-text-main group-hover:text-yellow-500 transition-colors">
                                    {preset.title}
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-dim group-hover:text-yellow-500 transition-colors" />
                    </button>
                ))}

                {filtered.length === 0 && (
                    <div className="md:col-span-2 py-12 text-center opacity-30 border-2 border-dashed border-border-subtle rounded-3xl">
                        <Lock className="w-8 h-8 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">No matching breakthroughs found</p>
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-r from-yellow-500/5 to-transparent p-6 rounded-3xl border border-yellow-500/10 flex items-center gap-6">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 flex-shrink-0">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-0.5">AI Synthesis Mode</h4>
                    <p className="text-[10px] text-text-dim font-medium leading-relaxed">
                        ClarityAI can synthesize unique breakthroughs based on {selectedExam} patterns if archival data is limited.
                    </p>
                </div>
            </div>
        </div>
    );
}
