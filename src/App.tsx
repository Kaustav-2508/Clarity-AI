/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { AuthOverlay } from './components/auth/AuthOverlay';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';
import { MentorStage } from './components/mentor/MentorStage';
import { PracticeStage } from './components/practice/PracticeStage';
import { NonprofitView } from './components/nonprofit/NonprofitView';
import { HistoryView } from './components/history/HistoryView';
import { GroupView } from './components/groups/GroupView';
import { TutorPortal } from './components/portal/TutorPortal';
import { FlashcardSuite } from './components/flashcards/FlashcardSuite';
import { EliteTracking } from './components/tracking/EliteTracking';
import { LabsCatalog } from './components/labs/LabsCatalog';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { StudyPlanView } from './components/studyplan/StudyPlanView';
import { TourGuide } from './components/layout/TourGuide';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mentor' | 'labs' | 'tracking' | 'practice' | 'history' | 'nonprofit' | 'groups' | 'portal' | 'flashcards' | 'settings' | 'studyplan'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center text-accent-blue">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono tracking-widest uppercase">ClarityAI Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthOverlay />;
  
  // If user is logged in but profile is null (e.g. firestore error), show a specialized error or skip to onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-8">
        <div className="professional-card p-10 max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-text-main">Connection Error</h2>
          <p className="text-sm text-text-dim">Unable to synchronize your scholarship profile. Please check your connection or sign out and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="professional-button-primary w-full"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!profile.onboarded) return <OnboardingFlow />;

  return (
    <div className="min-h-screen bg-bg-deep text-text-main font-sans selection:bg-accent-blue/30 flex flex-col lg:flex-row">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 h-[calc(100vh-64px)] lg:h-screen mt-16 lg:mt-0">
        <TourGuide />
        <div className="max-w-6xl mx-auto relative">
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}><Dashboard setActiveTab={setActiveTab} /></div>
          <div className={activeTab === 'mentor' ? 'block' : 'hidden'}><MentorStage /></div>
          <div className={activeTab === 'labs' ? 'block' : 'hidden'}><LabsCatalog /></div>
          <div className={activeTab === 'tracking' ? 'block' : 'hidden'}><EliteTracking /></div>
          <div className={activeTab === 'practice' ? 'block' : 'hidden'}><PracticeStage setActiveTab={setActiveTab} /></div>
          <div className={activeTab === 'flashcards' ? 'block' : 'hidden'}><FlashcardSuite /></div>
          <div className={activeTab === 'portal' ? 'block' : 'hidden'}><TutorPortal /></div>
          <div className={activeTab === 'history' ? 'block' : 'hidden'}><HistoryView /></div>
          <div className={activeTab === 'studyplan' ? 'block' : 'hidden'}><StudyPlanView /></div>
          <div className={activeTab === 'nonprofit' ? 'block' : 'hidden'}><NonprofitView /></div>
          <div className={activeTab === 'groups' ? 'block' : 'hidden'}><GroupView /></div>
          <div className={activeTab === 'settings' ? 'block' : 'hidden'}><ProfileSettings /></div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

