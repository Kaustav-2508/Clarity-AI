import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, arrayUnion, orderBy 
} from 'firebase/firestore';
import { 
  Users, Plus, Search, MessageSquare, BookOpen, 
  Send, UserPlus, Shield, Sparkles, ChevronLeft 
} from 'lucide-react';
import { Group, GroupMessage } from '../../types';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

export function GroupView() {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    subject: profile?.subjects?.[0] || 'General'
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    return onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(
      collection(db, 'groups', selectedGroup.id, 'messages'), 
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroupMessage)));
    });
  }, [selectedGroup]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'groups'), {
      ...newGroupData,
      creatorId: user.uid,
      members: [user.uid],
      inviteCode: code,
      createdAt: Date.now(),
      resources: []
    });
    setShowCreate(false);
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode) return;
    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()));
    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const groupDoc = snapshot.docs[0];
            updateDoc(doc(db, 'groups', groupDoc.id), {
                members: arrayUnion(user.uid)
            });
            setInviteCode('');
            setShowJoin(false);
        }
    }, { onlyOnce: true } as any);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage || !selectedGroup) return;
    await addDoc(collection(db, 'groups', selectedGroup.id, 'messages'), {
      groupId: selectedGroup.id,
      senderId: user.uid,
      senderName: user.displayName || 'Learner',
      text: newMessage,
      createdAt: Date.now()
    });
    setNewMessage('');
  };

  if (selectedGroup) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col bg-bg-panel border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
        <header className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-panel/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedGroup(null)} className="p-2 hover:bg-bg-hover rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-text-dim" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-text-main">{selectedGroup.name}</h2>
                    <span className="text-[10px] uppercase font-bold text-accent-blue tracking-widest">{selectedGroup.subject}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-md text-[11px] font-bold text-accent-blue">
                    CODE: {selectedGroup.inviteCode}
                </div>
                <div className="flex -space-x-2">
                    {selectedGroup.members.slice(0, 3).map(m => (
                        <div key={m} className="w-8 h-8 rounded-full bg-bg-hover border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-dim">
                            {m.substring(0, 2).toUpperCase()}
                        </div>
                    ))}
                    {selectedGroup.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-bg-deep border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-dim">
                            +{selectedGroup.members.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 bg-bg-deep/30">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.senderId === user?.uid ? "items-end" : "items-start")}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] font-bold text-text-dim uppercase">{msg.senderName}</span>
                                <span className="text-[9px] text-text-dim/50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={cn(
                                "max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed",
                                msg.senderId === user?.uid 
                                    ? "bg-accent-blue text-white rounded-tr-none" 
                                    : "bg-bg-panel border border-border-subtle text-text-main rounded-tl-none"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-bg-panel border-t border-border-subtle flex gap-3">
                    <input 
                        className="flex-1 bg-bg-deep border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-main focus:outline-none focus:border-accent-blue/50"
                        placeholder="Say something to the group..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!newMessage}
                        className="p-2 bg-accent-blue text-white rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <aside className="w-72 border-l border-border-subtle bg-bg-panel/30 p-6 overflow-y-auto hidden lg:block">
                <section className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Shield className="w-3 h-3 text-accent-blue" />
                           Group Mission
                        </h3>
                        <p className="text-xs text-text-dim leading-relaxed">{selectedGroup.description}</p>
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                         <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                           <BookOpen className="w-3 h-3 text-accent-green" />
                           Study Resources
                        </h3>
                        <div className="space-y-2">
                            {selectedGroup.resources?.length ? selectedGroup.resources.map((res, i) => (
                                <a key={i} href={res.url} target="_blank" className="block p-3 rounded-lg bg-bg-hover/50 hover:bg-bg-hover transition-colors border border-border-subtle group">
                                    <div className="text-xs font-medium text-text-main group-hover:text-accent-blue transition-colors">{res.title}</div>
                                    <div className="text-[10px] text-text-dim mt-1">Shared by {res.addedBy}</div>
                                </a>
                            )) : (
                                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border-subtle">
                                    <p className="text-[10px] text-text-dim">No resources shared yet. Help your peers by sharing useful links!</p>
                                </div>
                            )}
                            <button className="w-full py-2 border border-dashed border-border-subtle rounded-lg text-[10px] font-bold text-text-dim hover:text-text-main hover:border-text-dim transition-all mt-2">
                                + Share Resource
                            </button>
                        </div>
                    </div>
                </section>
            </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Collaborative Study Groups</h1>
          <p className="text-sm text-text-dim">Connect with peers to master subjects together.</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setShowJoin(true)}
              className="professional-button-secondary text-xs flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Join Group
            </button>
            <button 
              onClick={() => setShowCreate(true)}
              className="professional-button-primary text-xs flex items-center gap-2 shadow-lg shadow-accent-blue/20"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div 
            layoutId={group.id}
            key={group.id} 
            onClick={() => setSelectedGroup(group)}
            className="professional-card p-6 cursor-pointer group hover:border-accent-blue/50"
          >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-text-dim/50 uppercase">{group.members.length} members</span>
            </div>
            <h3 className="text-text-main font-bold mb-1">{group.name}</h3>
            <div className="text-[10px] uppercase font-bold text-accent-blue tracking-widest mb-3">{group.subject}</div>
            <p className="text-xs text-text-dim line-clamp-2 mb-4 leading-relaxed">{group.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <span className="text-[10px] text-text-dim/40 font-mono">CODE: {group.inviteCode}</span>
                <button className="text-xs font-bold text-accent-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enter Workspace <Plus className="w-3 h-3" />
                </button>
            </div>
          </motion.div>
        ))}

        {groups.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-bg-panel border border-border-subtle rounded-3xl flex items-center justify-center mx-auto text-text-dim">
                    <Users className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-main">No groups found</h3>
                    <p className="text-sm text-text-dim">Create a new group for your friends or join an existing one.</p>
                </div>
            </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md professional-card p-8"
                >
                    <h2 className="text-xl font-bold text-text-main mb-6">Create Study Group</h2>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Group Name</label>
                            <input 
                                required
                                className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-accent-blue/50"
                                value={newGroupData.name}
                                onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Description</label>
                            <textarea 
                                required
                                className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-accent-blue/50 h-24"
                                value={newGroupData.description}
                                onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Subject</label>
                            <select 
                                className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-accent-blue/50"
                                value={newGroupData.subject}
                                onChange={(e) => setNewGroupData({...newGroupData, subject: e.target.value})}
                            >
                                {profile?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 professional-button-secondary text-sm">Cancel</button>
                            <button type="submit" className="flex-1 professional-button-primary text-sm">Create Group</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}

        {showJoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm professional-card p-8 text-center"
                >
                    <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-accent-blue w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text-main mb-2">Join a Group</h2>
                    <p className="text-xs text-text-dim mb-6">Enter the 6-digit invite code provided by your peer.</p>
                    <input 
                        className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-3 text-center text-lg font-mono text-text-main mb-6 outline-none focus:border-accent-blue/50 tracking-[0.5rem] uppercase"
                        maxLength={6}
                        placeholder="XXXXXX"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setShowJoin(false)} className="flex-1 professional-button-secondary text-sm">Cancel</button>
                        <button onClick={handleJoinGroup} disabled={inviteCode.length < 6} className="flex-1 professional-button-primary text-sm disabled:opacity-50">Join Now</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
