import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { StudentProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  loginAsGuest: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (u) {
        const docRef = doc(db, 'users', u.uid);
        
        // Listen for real-time updates to profile
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as StudentProfile);
          } else {
             // Default profile for new users
             setProfile({
                userId: u.uid,
                grade: '',
                subjects: [],
                role: 'student',
                points: 0,
                badges: [],
                goals: { type: 'school', targetExams: [] },
                onboarded: false
              });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile Error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Guest login failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    
    // Hardened profile assembly to satisfy firestore create rules
    const baseProfile: StudentProfile = profile || {
      userId: user.uid,
      grade: '',
      subjects: [],
      role: 'student',
      points: 0,
      badges: [],
      goals: { type: 'school', targetExams: [] },
      onboarded: false
    };

    const newProfile = { 
      ...baseProfile, 
      ...updates, 
      userId: user.uid, 
      email: user.email || 'guest@clarity.ai' 
    };
    
    await setDoc(docRef, newProfile, { merge: true });
    setProfile(newProfile as StudentProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
