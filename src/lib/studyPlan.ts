
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  completed: boolean;
  subject: string;
}

export const getStudyPlan = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data()?.studyPlan || [];
};

export const addTask = async (userId: string, task: Omit<StudyTask, 'id' | 'completed'>) => {
  const newTask = {
    ...task,
    id: crypto.randomUUID(),
    completed: false
  };
  await updateDoc(doc(db, 'users', userId), {
    studyPlan: arrayUnion(newTask)
  });
  return newTask;
};

export const toggleTask = async (userId: string, taskId: string, completed: boolean) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const plan = userDoc.data()?.studyPlan || [];
  const updatedPlan = plan.map((t: StudyTask) => t.id === taskId ? { ...t, completed } : t);
  await updateDoc(doc(db, 'users', userId), { studyPlan: updatedPlan });
};
