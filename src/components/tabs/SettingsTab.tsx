import React, { useState, useEffect } from 'react';
import { Settings, Shield, Cpu, Globe, Trash2, Check, Smartphone, Info, RefreshCw, Moon, Sun, Monitor, FileText, Lock } from 'lucide-react';
import { getPreferences, savePreferences, UserPreferences, clearHistory } from '../../services/storage';

interface SettingsTabProps {
  onRestartOnboarding?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onRestartOnboarding }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(() => getPreferences());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | null>(null);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (prefs.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [prefs.theme]);

  const updatePref = (key: keyof UserPreferences, value: any) => {
    const updated = savePreferences({ [key]: value });
    setPrefs(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all AI generation history?')) {
      clearHistory();
      alert('Generation history cleared');
    }
  };

  const handleClearAllData = () => {
    if (confirm('Reset all local storage and preferences? This will restart the app.')) {
      localStorage.clear();
      alert('Application reset complete.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          RANJAY AI Settings & Preferences
        </h2>
        <p className="text-xs text-slate-400">Configure theme, default language, platform & AI system</p>
      </div>

      {/* Theme Selection */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">App Interface Theme</h3>
        </div>
        <p className="text-xs text-slate-400">Choose your visual theme preference</p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'dark', label: 'Dark Futuristic', icon: Moon },
            { id: 'light', label: 'Light Clean', icon: Sun },
            { id: 'system', label: 'System Default', icon: Monitor },
          ].map((themeItem) => {
            const Icon = themeItem.icon;
            const isSelected = prefs.theme === themeItem.id;
            return (
              <button
                key={themeItem.id}
                onClick={() => updatePref('theme', themeItem.id as any)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{themeItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language & Platform Preferences */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100">Studio Generation Defaults</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Default Language</label>
            <select
              value={prefs.defaultLanguage}
              onChange={(e) => updatePref('defaultLanguage', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Hinglish">Hinglish (Hindi + English Mix)</option>
              <option value="Hindi">Hindi (शुद्ध हिंदी)</option>
              <option value="English">English</option>
              <option value="Bhojpuri">Bhojpuri</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Default Platform</label>
            <select
              value={prefs.defaultPlatform}
              onChange={(e) => updatePref('defaultPlatform', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="YouTube">YouTube Longform</option>
              <option value="Instagram Reels">Instagram Reels</option>
              <option value="Facebook Reels">Facebook Reels</option>
            </select>
          </div>
        </div>

        {savedSuccess && <p className="text-xs text-emerald-400 font-semibold">✓ Preferences updated</p>}
      </div>

      {/* Onboarding & Setup Re-run */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Creator Onboarding</h3>
          <p className="text-xs text-slate-400">Re-open initial setup guide and preferences</p>
        </div>

        <button
          onClick={() => {
            if (onRestartOnboarding) onRestartOnboarding();
          }}
          className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restart Guide</span>
        </button>
      </div>

      {/* System Engine Status */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">AI Engine Status</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Gemini 3.6 Flash Script & Text Engine</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Gemini 3.1 Flash Lite Image Generator</span>
            <span className="text-emerald-400 font-bold">Enabled</span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Gemini TTS Speech & Native Synthesis</span>
            <span className="text-emerald-400 font-bold">Connected</span>
          </div>
        </div>
      </div>

      {/* Storage Management */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100">Data & Cache Management</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleClearHistory}
            className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold"
          >
            Clear History Logs
          </button>

          <button
            onClick={handleClearAllData}
            className="flex-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold"
          >
            Reset All App Data
          </button>
        </div>
      </div>

      {/* Info Modals Trigger Buttons */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => setActiveModal('about')}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex flex-col items-center gap-1 text-slate-300 font-bold"
        >
          <Info className="w-4 h-4 text-cyan-400" />
          <span>About Us</span>
        </button>

        <button
          onClick={() => setActiveModal('privacy')}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex flex-col items-center gap-1 text-slate-300 font-bold"
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveModal('terms')}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex flex-col items-center gap-1 text-slate-300 font-bold"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Terms of Service</span>
        </button>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {activeModal === 'about' && 'About RANJAY AI Studio'}
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service'}
            </h3>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed max-h-60 overflow-y-auto">
              {activeModal === 'about' && (
                <>
                  <p><strong>RANJAY AI</strong> is an all-in-one mobile AI creator studio engineered for YouTube, YouTube Shorts, Instagram Reels, and Facebook Reels creators.</p>
                  <p>Version 1.0 • Built with Gemini 3.6 Flash & Google AI Studio.</p>
                </>
              )}
              {activeModal === 'privacy' && (
                <>
                  <p>Your creator inputs and generated assets are stored securely. All AI generation requests pass through server-side proxy routes to safeguard API keys and maintain client privacy.</p>
                  <p>No personal credentials or secret keys are exposed in client code.</p>
                </>
              )}
              {activeModal === 'terms' && (
                <>
                  <p>RANJAY AI provides creative assistance for video scripts, thumbnails, and SEO metadata. Users retain full rights to all generated content for publication on YouTube, Instagram, and Facebook.</p>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
