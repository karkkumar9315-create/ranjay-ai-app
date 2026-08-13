import React, { useState } from 'react';
import { Sparkles, Video, Image as ImageIcon, Zap, ArrowRight, Check, Rocket, Globe, Shield, Play, X } from 'lucide-react';
import { savePreferences, getPreferences, UserPreferences } from '../services/storage';

interface OnboardingModalProps {
  initialPreferences?: UserPreferences;
  onComplete?: (updated: UserPreferences) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialPreferences,
  onComplete,
  onClose,
}) => {
  const prefs = initialPreferences || getPreferences();
  const [step, setStep] = useState<1 | 2>(1);
  const [platform, setPlatform] = useState(prefs?.defaultPlatform || 'YouTube Shorts');
  const [language, setLanguage] = useState(prefs?.defaultLanguage || 'Hinglish');
  const [niche, setNiche] = useState(prefs?.creatorNiche || 'Tech & AI');
  const [goal, setGoal] = useState(prefs?.creatorGoal || 'Grow Viral Following');

  const platforms = [
    { id: 'YouTube Shorts', name: 'YouTube Shorts', icon: '📱', desc: 'Short viral videos (15s-60s)' },
    { id: 'YouTube', name: 'YouTube Longform', icon: '🎬', desc: 'Detailed 3-10 min videos' },
    { id: 'Instagram Reels', name: 'Instagram Reels', icon: '📸', desc: 'Aesthetic & trend content' },
    { id: 'Facebook Reels', name: 'Facebook Reels', icon: '🌐', desc: 'Wide audience distribution' },
  ];

  const languages = [
    { id: 'Hinglish', name: 'Hinglish (Mix)', desc: 'Most popular for Indian creators' },
    { id: 'Hindi', name: 'Hindi (शुद्ध)', desc: 'Clear Hindi narration' },
    { id: 'English', name: 'English (Global)', desc: 'International audience' },
    { id: 'Bhojpuri', name: 'Bhojpuri', desc: 'Regional viral appeal' },
  ];

  const niches = ['Tech & AI', 'Gaming', 'Vlog & Lifestyle', 'Facts & Mystery', 'Education & Finance', 'Entertainment & Skits', 'Motivation & Business'];

  const handleFinish = () => {
    const updated = savePreferences({
      onboarded: true,
      defaultPlatform: platform,
      defaultLanguage: language,
      creatorNiche: niche,
      creatorGoal: goal,
    });
    if (onComplete) onComplete(updated);
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    savePreferences({ onboarded: true });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-fadeIn my-auto">
        
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Indicator */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-200">RANJAY AI STUDIO</span>
          </div>
          <div className="flex items-center gap-2">
            <span>STEP {step} OF 2</span>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screen 1: Welcome & Value Pitch */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-3xl">
                  ⚡
                </div>
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 tracking-tight">
                RANJAY AI
              </h1>
              <p className="text-sm font-bold text-slate-200">
                Create. Edit. Grow. With AI.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your complete all-in-one mobile AI creator studio for YouTube, Shorts, Instagram Reels & Facebook Reels.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xl">🎬</span>
                <h4 className="text-xs font-bold text-slate-200">AI Scriptwriter</h4>
                <p className="text-[10px] text-slate-400">Hooks, scenes & voiceover scripts</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xl">🖼️</span>
                <h4 className="text-xs font-bold text-slate-200">AI Thumbnail</h4>
                <p className="text-[10px] text-slate-400">Image analysis & high-CTR prompts</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xl">📱</span>
                <h4 className="text-xs font-bold text-slate-200">Viral Shorts Package</h4>
                <p className="text-[10px] text-slate-400">11-part end-to-end production</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xl">✂️</span>
                <h4 className="text-xs font-bold text-slate-200">CapCut Editing Plan</h4>
                <p className="text-[10px] text-slate-400">Cuts, transitions, SFX & music</p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>Set Creator Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 2: Preference Configuration */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                Customize Your Creator Studio
              </h2>
              <p className="text-xs text-slate-400">Select default options so AI generates tailored content for you</p>
            </div>

            {/* Platform Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Primary Content Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      platform === p.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Default Language</label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      language === l.id
                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{l.name}</div>
                    <div className="text-[10px] text-slate-400">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Niche Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Creator Niche / Category</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl"
              >
                Back
              </button>

              <button
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Launch Creator Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
