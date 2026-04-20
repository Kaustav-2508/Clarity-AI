import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

export function AuthOverlay() {
  const { loginAsGuest, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        console.log("Attempting sign in with:", email);
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        console.log("Attempting sign up with:", email);
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console (Authentication > Sign-in method).");
      } else {
        setError(err.code || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md professional-card p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-blue to-transparent" />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main mb-2 tracking-tight">ClarityAI Mentor</h1>
          <p className="text-text-dim text-sm">Your personal mentor for deep understanding.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-text-dim mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-blue/50 transition-all text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-text-dim mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-bg-deep border border-border-subtle rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-blue/50 transition-all text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-[11px] text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full professional-button-primary shadow-lg shadow-accent-blue/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-text-dim text-xs hover:text-text-main transition-colors underline underline-offset-4"
          >
            {isLogin ? "Need an account? Create one" : "Back to Sign In"}
          </button>
          
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-dim/50 text-[10px] uppercase font-bold tracking-tighter">Social Login</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <button 
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                await loginWithGoogle();
              } catch (err: any) {
                if (err.code === 'auth/operation-not-allowed') {
                  setError("Google sign-in is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).");
                } else {
                  setError(err.code || err.message);
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full professional-button-secondary flex items-center justify-center gap-3 text-sm hover:border-accent-blue/50 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" referrerPolicy="no-referrer" />
            Continue with Google
          </button>

          <button 
            type="button"
            onClick={async () => {
              try {
                await loginAsGuest();
              } catch (err: any) {
                 if (err.code === 'auth/operation-not-allowed') {
                    setError("Anonymous login is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).");
                 } else {
                    setError(err.code || err.message);
                 }
              }
            }}
            className="w-full text-text-dim text-[10px] uppercase tracking-widest hover:text-text-main transition-colors mt-2 font-bold"
          >
            Skip for now (Guest Mode)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
