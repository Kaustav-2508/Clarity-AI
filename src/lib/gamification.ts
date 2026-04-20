import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { StudentProfile } from '../types';

export const GAMIFICATION_RULES = {
  LESSON_COMPLETE: 50,
  PROBLEM_CORRECT: 20,
  DAILY_STREAK: 100,
  BADGE_MASTER: 500,
};

export async function addPoints(userId: string, points: number) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    points: increment(points)
  });
}

export async function checkAndAwardBadges(userId: string, profile: StudentProfile) {
  const userRef = doc(db, 'users', userId);
  const newBadges: string[] = [];

  // Logic for awarding badges
  if (profile.totalTopicsStudied && profile.totalTopicsStudied >= 10 && !profile.badges?.includes('Top Learner')) {
    newBadges.push('Top Learner');
  }
  
  if (profile.streak && profile.streak >= 7 && !profile.badges?.includes('Week Warrior')) {
    newBadges.push('Week Warrior');
  }

  if (newBadges.length > 0) {
    await updateDoc(userRef, {
      badges: arrayUnion(...newBadges),
      points: increment(newBadges.length * GAMIFICATION_RULES.BADGE_MASTER)
    });
    return newBadges;
  }
  return [];
}

export async function getLeaderboard() {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    email: d.data().email,
    points: d.data().points || 0
  }));
}
