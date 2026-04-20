/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserGrade = 'School' | 'High School' | 'College' | 'Competitive Exams' | 'Other';
export type UserRole = 'student' | 'teacher';

export interface StudentProfile {
  userId: string; // Added userId
  grade: string;
  subjects: string[];
  role: UserRole;
  goals: {
    type: 'school' | 'competitive';
    targetExams: string[];
  };
  weakAreas?: string[];
  strongAreas?: string[];
  streak?: number;
  totalTopicsStudied?: number;
  points?: number;
  badges?: string[];
  onboarded: boolean;
  assignments?: { // New assignment progress tracking
    taskId: string;
    progress: number;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
}

export type LearningMode = 'Quick' | 'Step-by-Step' | 'Deep';

export interface ExplanationResult {
  thinking: string;
  explanation: string;
  mentalModel: string;
  conceptMap: {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string; value: number }[];
  };
  interactiveLab: {
    title: string;
    description: string;
    variables: string[];
  };
  relatedConcepts: string[];
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  subject?: string;
  mode?: LearningMode;
  explanationType?: 'concept' | 'problem' | 'doubt';
  timestamp: number;
}

export interface ConceptExplanation {
  title: string;
  definition: string;
  intuition: string;
  example: string;
  steps: string[];
  commonMistakes: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface PracticeProblem {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: number;
  priority: 'high' | 'medium' | 'low';
  subject?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  subject: string;
  goal: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  subject: string;
  creatorId: string;
  members: string[]; // UIDs
  inviteCode: string;
  resources: { title: string; url: string; addedBy: string }[];
  createdAt: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  studentId?: string; // If null, assigned to group
  groupId?: string;
  title: string;
  description: string;
  subject: string;
  dueDate: number;
  completed: boolean;
  tasks: string[]; 
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  milestone: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  subject: string;
  mastered: boolean;
  createdAt: number;
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  examType: string; // e.g., SAT, JEE, MCAT
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  totalQuestions: number;
  problems: PracticeProblem[];
  isPYQ: boolean;
  year?: number;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  timestamp: number;
}
