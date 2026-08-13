import React, { useState } from 'react';
import { generateCompleteVideoApi, factCheckApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { CompleteVideoPackage, FactCheckResult } from '../../types';
import { Rocket, Copy, Save, Sparkles, Loader2, Check, Share2, Play, Search, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ttsPlayer } from '../../services/audio';

interface CompleteVideoCreatorProps {
  onSaved?: () => void;
}

export const CompleteVideoCreator: React.FC<CompleteVideoCreatorProps> = ({ onSaved }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube Shorts');
  const [duration, setDuration] = useState('60 sec');
  const [language, setLanguage] = useState('Hinglish');
  const [factCheckMode, setFactCheckMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const [factCheckingLoading, setFactCheckingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pkg, setPkg] = useState<CompleteVideoPackage | null>(null);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setFactCheckResult(null);

    try {
      const data = await generateCompleteVideoApi({
        topic,
        platform,
        duration,
        language,
        factCheckMode,
      });
      setPkg(data);

      // If Fact-Check Mode is ON, run fact check automatically on generated script
      if (factCheckMode && data.script) {
        runFactCheckOnScript(data.script);
      }

      addHistoryItem({
        toolType: 'CompleteVideo',
        title: `Complete Video Package: ${topic}`,
        prompt: topic,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Complete video creation failed');
    } finally {
      setLoading(false);
    }
  };

  const runFactCheckOnScript = async (scriptText: string) => {
    setFactCheckingLoading(true);
    try {
      const result = await factCheckApi({
        text: scriptText,
        factCheckMode: true,
      });
      setFactCheckResult(result);
    } catch (e) {
      console.error('Fact check auto error:', e);
    } finally {
      setFactCheckingLoading(false);
    }
  };

  const handleApplyFixedScript = () => {
    if (pkg && factCheckResult?.fixedScript) {
      setPkg({
        ...pkg,
        script: factCheckResult.fixedScript,
        voiceoverText: factCheckResult.fixedScript,
      });
    }
  };

  const handleCopyAll = () => {
    if (!pkg) return;
    const text = `
COMPLETE VIDEO PACKAGE: ${topic}

1. HOOK: ${pkg.hook}
2. SCRIPT: ${pkg.script}
3. VOICEOVER: ${pkg.voiceoverText}
4. TITLES: ${pkg.titles ? pkg.titles.join('\n') : ''}
5. DESCRIPTION: ${pkg.description}
6. CAPTION: ${pkg.caption}
7. HASHTAGS: ${pkg.hashtags}
${factCheckResult ? `\nFACT CHECK ACCURACY SCORE: ${factCheckResult.summary.accuracyScore}%` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!pkg) return;
    try {
      await saveProjectApi({
        title: topic,
        type: 'CompleteVideo',
        topic,
        platform,
        language,
        content: {
          ...pkg,
          factCheck: factCheckResult || undefined,
        },
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayVoice = () => {
    if (!pkg?.voiceoverText) return;
    if (isPlayingVoice) {
      ttsPlayer.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      ttsPlayer.speak(pkg.voiceoverText, {
        lang: language === 'Hindi' ? 'hi-IN' : 'en-IN',
        onEnd: () => setIsPlayingVoice(false),
        onError: () => setIsPlayingVoice(false),
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-cyan-500/30">
          🚀
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400">
              CREATE COMPLETE VIDEO
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              ALL-IN-ONE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Generate Hook, Script, Scenes, Prompts, Voiceover, Editing Plan & SEO in 1-Click
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1">
            Video Topic / Core Concept <span className="text-cyan-400">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. India's secret superpower in 2026 or 3 mindblowing space facts..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="YouTube Long">YouTube Long Video</option>
              <option value="Instagram Reels">Instagram Reels</option>
              <option value="Facebook Reels">Facebook Reels</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="30 sec">30 sec</option>
              <option value="60 sec">60 sec</option>
              <option value="3 min">3 min</option>
              <option value="5 min">5 min</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Bhojpuri">Bhojpuri</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fact-Check Mode</label>
            <button
              onClick={() => setFactCheckMode(!factCheckMode)}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                factCheckMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{factCheckMode ? 'ON (Strict)' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm tracking-wide"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Synthesizing Complete Video Package...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 fill-current" />
              <span>Generate Full Video Suite</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Complete Package Viewer */}
      {pkg && (
        <div className="space-y-4 pt-4 border-t border-cyan-500/30 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
              🎉 11-Part Master Creator Suite Complete
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => runFactCheckOnScript(pkg.script)}
                disabled={factCheckingLoading}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5"
              >
                {factCheckingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Check Facts</span>
              </button>

              <button
                onClick={handleCopyAll}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied All' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleSave}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Project'}</span>
              </button>
            </div>
          </div>

          {/* Fact Check Inspection Section */}
          {factCheckResult && (
            <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-extrabold text-slate-100">🔎 Fact Check & Accuracy Inspection</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    Accuracy Score: {factCheckResult.summary.accuracyScore}%
                  </span>
                  {factCheckResult.fixedScript && factCheckResult.fixedScript !== pkg.script && (
                    <button
                      onClick={handleApplyFixedScript}
                      className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Apply Fact-Checked Script</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Claims Breakdown Pill Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Claims</span>
                  <strong className="text-slate-100">{factCheckResult.summary.totalClaims}</strong>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-300">
                  <span className="block text-[10px]">🟢 Verified</span>
                  <strong>{factCheckResult.summary.verifiedClaims}</strong>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-300">
                  <span className="block text-[10px]">🟡 Need Verification</span>
                  <strong>{factCheckResult.summary.needsVerificationClaims}</strong>
                </div>
                <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-300">
                  <span className="block text-[10px]">🔴 Incorrect</span>
                  <strong>{factCheckResult.summary.likelyIncorrectClaims}</strong>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-slate-300 col-span-2 sm:col-span-1">
                  <span className="block text-[10px]">⚪ Opinion / Style</span>
                  <strong>{factCheckResult.summary.opinionClaims}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                {factCheckResult.summary.accuracyNote}
              </p>
            </div>
          )}

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            {/* Concept */}
            {pkg.contentIdea && (
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">1. Core Concept:</span>
                <p>{pkg.contentIdea.concept} (<strong className="text-slate-400">Audience:</strong> {pkg.contentIdea.targetAudience})</p>
              </div>
            )}

            {/* Hook */}
            <div>
              <span className="font-bold text-amber-400 block mb-0.5">2. Viral Hook (0-3s):</span>
              <p className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-200 font-bold italic">
                "{pkg.hook}"
              </p>
            </div>

            {/* Full Script */}
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">3. Full Spoken Script:</span>
              <p className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] whitespace-pre-line text-slate-200">
                {pkg.script}
              </p>
            </div>

            {/* Voiceover preview */}
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-400 text-[11px]">4. Voiceover Audio Track</span>
              <button
                onClick={handlePlayVoice}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded text-[11px] flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingVoice ? 'Stop Audio' : 'Listen Voice'}</span>
              </button>
            </div>

            {/* Scene Breakdown */}
            {pkg.sceneBreakdown && pkg.sceneBreakdown.length > 0 && (
              <div>
                <span className="font-bold text-purple-400 block mb-1">5. Scene-by-Scene Breakdown:</span>
                <div className="space-y-1.5">
                  {pkg.sceneBreakdown.map((sc, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                      <span className="text-purple-300 font-bold">{sc.time}:</span> {sc.visual} | "{sc.voiceover}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Prompts */}
            {pkg.visualPrompts && (
              <div>
                <span className="font-bold text-blue-400 block mb-0.5">6. AI Visual Prompts:</span>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                  {pkg.visualPrompts.map((vp, i) => (
                    <li key={i}>{vp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Editing Plan */}
            {pkg.editingPlan && (
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-orange-400 block mb-1">7. CapCut Editing Plan:</span>
                <p>Pacing: {pkg.editingPlan.pacing} • Transitions: {pkg.editingPlan.transitions}</p>
                <p>Music: {pkg.editingPlan.sfxAndMusic} • Text Style: {pkg.editingPlan.textStyle}</p>
              </div>
            )}

            {/* Titles */}
            {pkg.titles && (
              <div>
                <span className="font-bold text-indigo-400 block mb-0.5">8. Title Options:</span>
                <ul className="list-disc list-inside text-slate-200">
                  {pkg.titles.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description, Caption, Hashtags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">9. YouTube Description:</span>
                <p className="bg-slate-900 p-2 rounded text-slate-300">{pkg.description}</p>
              </div>
              <div>
                <span className="font-bold text-purple-400 block mb-0.5">10 & 11. Caption & Hashtags:</span>
                <p className="bg-slate-900 p-2 rounded text-slate-300">{pkg.caption}</p>
                <p className="mt-1 text-pink-400 font-mono font-bold">{pkg.hashtags}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
