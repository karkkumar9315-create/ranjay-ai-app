import React, { useState } from 'react';
import { generateShortsApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { ShortsPackage } from '../../types';
import { Smartphone, Copy, Save, Sparkles, Loader2, Check, Share2, Play } from 'lucide-react';
import { ttsPlayer } from '../../services/audio';

interface ShortsMakerProps {
  onSaved?: () => void;
}

export const ShortsMaker: React.FC<ShortsMakerProps> = ({ onSaved }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('30 sec');
  const [language, setLanguage] = useState('Hinglish');
  const [style, setStyle] = useState('Fast-paced viral');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortsData, setShortsData] = useState<ShortsPackage | null>(null);

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateShortsApi({ topic, duration, language, style });
      setShortsData(data);
      addHistoryItem({
        toolType: 'Shorts',
        title: data.title || topic,
        prompt: topic,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Shorts creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!shortsData) return;
    const text = `
TITLE: ${shortsData.title}
HOOK: ${shortsData.hook}
SCRIPT: ${shortsData.script}
VOICEOVER: ${shortsData.voiceover}
CAPTION: ${shortsData.caption}
HASHTAGS: ${shortsData.hashtags}
EDITING NOTES: ${shortsData.editingNotes}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!shortsData) return;
    try {
      await saveProjectApi({
        title: shortsData.title || topic,
        type: 'Shorts',
        topic,
        content: shortsData,
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayVoice = () => {
    if (!shortsData?.voiceover) return;
    if (isPlayingVoice) {
      ttsPlayer.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      ttsPlayer.speak(shortsData.voiceover, {
        lang: language === 'Hindi' ? 'hi-IN' : 'en-IN',
        onEnd: () => setIsPlayingVoice(false),
        onError: () => setIsPlayingVoice(false),
      });
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold">
          📱
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">SHORTS / REELS MAKER</h2>
          <p className="text-xs text-slate-400">Complete vertical video package for YouTube Shorts, IG & FB Reels</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Shorts / Reel Topic <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Unbelievable cricket catch or secret iPhone trick..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="15 sec">15 sec</option>
              <option value="30 sec">30 sec</option>
              <option value="60 sec">60 sec</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Bhojpuri">Bhojpuri</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="Fast-paced viral">Fast-paced viral</option>
              <option value="Storytelling">Storytelling</option>
              <option value="Fact-burst">Fact-burst</option>
              <option value="Comedy Skit">Comedy Skit</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Building Shorts Package...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Complete Shorts Package</span>
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
      {shortsData && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-pink-400 flex items-center gap-1.5">
              ✨ Shorts Package Ready
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAll}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied All' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleSave}
                className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Project'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300">
            <div>
              <span className="font-bold text-pink-400 block mb-0.5">Title:</span>
              <p className="font-bold text-slate-100 text-sm">{shortsData.title}</p>
            </div>

            <div>
              <span className="font-bold text-amber-400 block mb-0.5">Hook (0-3s):</span>
              <p className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-lg italic">
                "{shortsData.hook}"
              </p>
            </div>

            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">Spoken Script:</span>
              <p className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] whitespace-pre-line text-slate-200">
                {shortsData.script}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePlayVoice}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1 px-2.5 rounded-lg flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingVoice ? 'Stop Voiceover' : 'Preview Voiceover'}</span>
              </button>
            </div>

            {shortsData.visualPrompts && shortsData.visualPrompts.length > 0 && (
              <div>
                <span className="font-bold text-cyan-400 block mb-1">Scene Visual Prompts:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {shortsData.visualPrompts.map((vp, idx) => (
                    <li key={idx}><strong className="text-slate-300">Scene {idx + 1}:</strong> {vp}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="font-bold text-purple-400 block mb-0.5">Caption:</span>
                <p className="bg-slate-900 p-2 rounded text-slate-300">{shortsData.caption}</p>
              </div>
              <div>
                <span className="font-bold text-purple-400 block mb-0.5">Hashtags:</span>
                <p className="bg-slate-900 p-2 rounded text-pink-400 font-mono">{shortsData.hashtags}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-indigo-400 block mb-0.5">CapCut Editing Notes:</span>
              <p className="text-slate-400">{shortsData.editingNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
