import React, { useState } from 'react';
import { generateEditingPlanApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { EditingPlan } from '../../types';
import { Scissors, Copy, Save, Sparkles, Loader2, Check } from 'lucide-react';

interface EditingAssistantProps {
  onSaved?: () => void;
}

export const EditingAssistant: React.FC<EditingAssistantProps> = ({ onSaved }) => {
  const [footageDescription, setFootageDescription] = useState('');
  const [videoType, setVideoType] = useState('Short / Reel / YouTube Video');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<EditingPlan | null>(null);

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!footageDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateEditingPlanApi({ footageDescription, videoType });
      setPlan(data);
      addHistoryItem({
        toolType: 'Editing',
        title: `Editing Plan: ${footageDescription.substring(0, 30)}...`,
        prompt: footageDescription,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Editing plan generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!plan) return;
    const text = `
EDITING PLAN FOR: ${footageDescription}

1. TIMELINE OVERVIEW: ${plan.timelineOverview}
2. CUTS & TRIMMING: ${plan.cutsAndTrimming}
3. ZOOMS & PANS: ${plan.zoomsAndPans}
4. SLOW-MO & SPEED RAMPING: ${plan.slowMotionAndSpeedRamping}
5. TRANSITIONS: ${plan.transitions}
6. TEXT & ANIMATIONS: ${plan.textAndAnimations}
7. SOUND EFFECTS (SFX): ${plan.soundEffects}
8. MUSIC TIMING: ${plan.musicTiming}
9. MASKING & EFFECTS: ${plan.motionEffectsAndMasking}
10. COLOR GRADING: ${plan.colorGrading}
11. ENDING: ${plan.endingCTA}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!plan) return;
    try {
      await saveProjectApi({
        title: footageDescription.substring(0, 30) + '...',
        type: 'Editing',
        topic: footageDescription,
        content: plan,
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
          ✂️
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">CAPCUT & VIDEO EDITING ASSISTANT</h2>
          <p className="text-xs text-slate-400">Step-by-step editing roadmap, cuts, transitions, SFX & speed ramping</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Describe Your Recorded Footage <span className="text-orange-400">*</span>
          </label>
          <textarea
            value={footageDescription}
            onChange={(e) => setFootageDescription(e.target.value)}
            rows={3}
            placeholder="e.g. I have a 2-minute cricket clip with a sixer shot and crowd cheering..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Format</label>
          <select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="Short / Reel / YouTube Video">Short / Reel / TikTok (Vertical 9:16)</option>
            <option value="YouTube Long Video">YouTube Long Video (Horizontal 16:9)</option>
            <option value="Facebook Reel">Facebook Reel / Square Video</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !footageDescription.trim()}
          className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating Editing Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Generate CapCut Editing Plan</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Output */}
      {plan && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
              ✨ CapCut Video Editing Blueprint
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Plan' : 'Copy Plan'}</span>
              </button>

              <button
                onClick={handleSave}
                className="bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div>
              <span className="font-bold text-orange-400 block mb-0.5">Timeline Overview:</span>
              <p>{plan.timelineOverview}</p>
            </div>
            <div>
              <span className="font-bold text-cyan-400 block mb-0.5">Cuts & Trimming:</span>
              <p>{plan.cutsAndTrimming}</p>
            </div>
            <div>
              <span className="font-bold text-amber-400 block mb-0.5">Zooms & Pans:</span>
              <p>{plan.zoomsAndPans}</p>
            </div>
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">Slow Motion & Speed Ramping:</span>
              <p>{plan.slowMotionAndSpeedRamping}</p>
            </div>
            <div>
              <span className="font-bold text-purple-400 block mb-0.5">Transitions:</span>
              <p>{plan.transitions}</p>
            </div>
            <div>
              <span className="font-bold text-indigo-400 block mb-0.5">Text & Animations:</span>
              <p>{plan.textAndAnimations}</p>
            </div>
            <div>
              <span className="font-bold text-rose-400 block mb-0.5">Sound Effects (SFX):</span>
              <p>{plan.soundEffects}</p>
            </div>
            <div>
              <span className="font-bold text-blue-400 block mb-0.5">Music Timing & Ducking:</span>
              <p>{plan.musicTiming}</p>
            </div>
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Masking & Motion FX:</span>
              <p>{plan.motionEffectsAndMasking}</p>
            </div>
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5">Color Grading Preset:</span>
              <p>{plan.colorGrading}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
