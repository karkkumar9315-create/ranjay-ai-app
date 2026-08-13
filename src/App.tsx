import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/tabs/HomeTab';
import { CreateTab } from './components/tabs/CreateTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { CreatorChat } from './components/tools/CreatorChat';
import { SettingsTab } from './components/tabs/SettingsTab';
import { OnboardingModal } from './components/OnboardingModal';
import { getPreferences } from './services/storage';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    if (!prefs.onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col items-center">
      {/* Mobile-first Container Frame */}
      <div className="w-full max-w-md sm:max-w-2xl min-h-screen flex flex-col bg-slate-950 border-x border-slate-900 shadow-2xl relative">
        {/* Top Sticky Header */}
        <Header />

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          {activeTab === 'home' && <HomeTab onNavigateToAiChat={() => setActiveTab('chat')} />}
          {activeTab === 'create' && <CreateTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'chat' && <CreatorChat />}
          {activeTab === 'settings' && <SettingsTab onRestartOnboarding={() => setShowOnboarding(true)} />}
        </main>

        {/* Bottom Floating Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

        {/* Onboarding Flow Modal */}
        {showOnboarding && (
          <OnboardingModal
            initialPreferences={getPreferences()}
            onComplete={() => setShowOnboarding(false)}
            onClose={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
