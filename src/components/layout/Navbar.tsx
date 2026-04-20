import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, MessageSquare, GraduationCap, History, Globe, LogOut, Users, Target, Brain, Menu, X, Settings, Beaker } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mentor', label: 'Curriculum', icon: MessageSquare, tour: 'neural-link' },
    { id: 'labs', label: 'Laboratories', icon: Beaker, tour: 'laboratories' },
    { id: 'tracking', label: 'Analysis', icon: Target, tour: 'concept-map' },
    { id: 'practice', label: 'Mock Tests', icon: GraduationCap },
    { id: 'flashcards', label: 'Vault', icon: Brain },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'history', label: 'Chronicle', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (profile?.role === 'teacher') {
    navItems.splice(1, 0, { id: 'portal', label: 'Tutor Portal', icon: Target });
  }

  const NavLink = ({ item, onClick }: { item: any, onClick?: () => void }) => (
    <button
      onClick={() => {
        setActiveTab(item.id);
        onClick?.();
      }}
      data-tour={item.tour}
      className={cn(
        "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3",
        activeTab === item.id 
          ? "bg-accent-blue/10 text-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
          : "text-text-dim hover:text-text-main hover:bg-bg-hover"
      )}
    >
      <item.icon className={cn("w-4 h-4 transition-transform", activeTab === item.id && "scale-110")} />
      <span className="tracking-tight">{item.label}</span>
      {activeTab === item.id && (
        <motion.div 
            layoutId="active-pill"
            className="ml-auto w-1 h-4 bg-accent-blue rounded-full"
        />
      )}
    </button>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-72 glass-effect h-screen flex-col py-8 px-6 sticky top-0">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-accent-blue/20">
            C
          </div>
          <div>
            <span className="font-black text-xl text-text-main tracking-tighter uppercase italic">Clarity<span className="text-accent-blue">AI</span></span>
            <div className="text-[8px] font-black tracking-[0.3em] uppercase text-accent-blue opacity-50">Elite Mentor</div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="px-4 text-[10px] text-text-dim uppercase tracking-[0.2em] font-black mb-4 opacity-50">Navigation</div>
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-auto space-y-6 pt-6 border-t border-border-subtle">
          <button
            onClick={() => setActiveTab('nonprofit')}
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 border border-transparent",
                activeTab === 'nonprofit' 
                  ? "bg-accent-blue/5 border-accent-blue/20 text-accent-blue" 
                  : "text-text-dim hover:text-text-main hover:bg-bg-hover"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="tracking-tight italic">ClarityAI Initiative</span>
          </button>

          <div className="flex flex-col gap-2 bg-bg-deep p-4 rounded-2xl border border-border-subtle">
              <div className="text-[9px] text-text-dim uppercase tracking-[0.2em] font-black mb-1 opacity-50">Authenticated As</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-main truncate max-w-[120px]">{user?.email || 'Scholar'}</span>
                <button 
                  onClick={() => auth.signOut()}
                  className="text-text-dim hover:text-red-400 transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header & Side Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border-subtle h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center font-black text-white text-sm">C</div>
            <span className="font-black text-sm text-text-main tracking-tighter uppercase italic">Clarity<span className="text-accent-blue">AI</span></span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-main">
            {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="lg:hidden fixed inset-0 z-40 bg-bg-deep pt-20 px-6 flex flex-col pb-8"
            >
                <div className="flex-1 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink key={item.id} item={item} onClick={() => setIsOpen(false)} />
                    ))}
                    <button
                        onClick={() => { setActiveTab('nonprofit'); setIsOpen(false); }}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                            activeTab === 'nonprofit' ? "bg-accent-blue/10 text-accent-blue" : "text-text-dim"
                        )}
                    >
                        <Globe className="w-4 h-4" />
                        ClarityAI Initiative
                    </button>
                </div>

                <div className="mt-auto border-t border-border-subtle pt-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-bold text-text-main">{user?.email}</span>
                        <button onClick={() => auth.signOut()} className="text-red-400 font-bold text-xs uppercase tracking-widest">Logout</button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
