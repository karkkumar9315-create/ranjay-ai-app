import React, { useState } from 'react';
import { generateScriptApi, factCheckApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { ScriptPackage, FactCheckResult } from '../../types';
import { Video, Copy, Save, RotateCcw, Share2, Check, Edit3, Sparkles, Loader2, Play, Search, ShieldCheck } from 'lucide-react';
import { ttsPlayer } from '../../services/audio';

interface ScriptGeneratorProps {
  initialTopic?: string;
  onSaved?: () => void;
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ initialTopic = '', onSaved }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [platform, setPlatform] = useState('YouTube Shorts');
  const [duration, setDuration] = useState('60 sec');
  const [language, setLanguage] = useState('Hinglish');
  const [style, setStyle] = useState('Informative');
  const [factCheckMode, setFactCheckMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const [factCheckingLoading, setFactCheckingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptData, setScriptData] = useState<ScriptPackage | null>(null);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSavedSuccess(false);
    setFactCheckResult(null);

    try {
      const data = await generateScriptApi({
        topic,
        platform,
        duration,
        language,
        style,
        factCheckMode,
      });
      setScriptData(data);

      addHistoryItem({
        toolType: 'Script',
        title: data.title || topic,
        prompt: topic,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Script generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFactCheckCurrentScript = async () => {
    if (!scriptData?.script) return;
    setFactCheckingLoading(true);
    try {
      const result = await factCheckApi({
        text: scriptData.script,
        factCheckMode: true,
      });
      setFactCheckResult(result);
    } catch (e: any) {
      setError(e.message || 'Fact check failed');
    } finally {
      setFactCheckingLoading(false);
    }
  };

  const handleApplyFixedScript = () => {
    if (scriptData && factCheckResult?.fixedScript) {
      setScriptData({
        ...scriptData,
        script: factCheckResult.fixedScript,
        voiceoverText: factCheckResult.fixedScript,
      });
    }
  };

  const handleCopy = () => {
    if (!scriptData) return;
    const textToCopy = `
TITLE: ${scriptData.title}
HOOK: ${scriptData.hook}
INTRO: ${scriptData.introduction}

COMPLETE SCRIPT:
${scriptData.script}

VOICEOVER TEXT:
${scriptData.voiceoverText}

ON-SCREEN TEXT:
${scriptData.onScreenText}

CTA: ${scriptData.cta}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!scriptData) return;
    try {
      await saveProjectApi({
        title: scriptData.title || topic,
        type: 'Script',
        topic,
        platform,
        language,
        content: scriptData,
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (!scriptData) return;
    if (navigator.share) {
      navigator.share({
        title: scriptData.title,
        text: scriptData.script,
      });
    } else {
      handleCopy();
    }
  };

  const handlePlayAudio = () => {
    if (!scriptData?.voiceoverText) return;
    if (isPlayingVoice) {
      ttsPlayer.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      ttsPlayer.speak(scriptData.voiceoverText, {
        lang: language === 'Hindi' ? 'hi-IN' : 'en-IN',
        onEnd: () => setIsPlayingVoice(false),
        onError: () => setIsPlayingVoice(false),
      });
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
          🎬
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">AI SCRIPT GENERATOR</h2>
          <p className="text-xs text-slate-400">Create full viral scripts with scenes & voiceovers</p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Video Topic / Concept <span className="text-cyan-400">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 5 AI tools every student must use in 2026..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="YouTube">YouTube</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
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
              <option value="15 sec">15 sec</option>
              <option value="30 sec">30 sec</option>
              <option value="60 sec">60 sec</option>
              <option value="3 min">3 min</option>
              <option value="5 min">5 min</option>
              <option value="10 min">10 min</option>
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Informative">Informative</option>
              <option value="Emotional">Emotional</option>
              <option value="Funny">Funny</option>
              <option value="Suspense">Suspense</option>
              <option value="Motivational">Motivational</option>
              <option value="Storytelling">Storytelling</option>
              <option value="News">News</option>
              <option value="Documentary">Documentary</option>
              <option value="Cinematic">Cinematic</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fact-Check Mode</label>
            <button
              onClick={() => setFactCheckMode(!factCheckMode)}
              className={`w-full py-2 px-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                factCheckMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{factCheckMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Script with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Viral Script</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Script Result Display */}
      {scriptData && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
              ✨ Generated Script
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Done Editing' : 'Edit Content'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFactCheckCurrentScript}
              disabled={factCheckingLoading}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {factCheckingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Verify Facts</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>

            <button
              onClick={handlePlayAudio}
              className={`flex-1 ${
                isPlayingVoice ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-200'
              } font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlayingVoice ? 'Stop Audio' : 'Listen Voice'}</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Project'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Fact Check Inspection Section */}
          {factCheckResult && (
            <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-slate-100">Fact Check Inspection</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    Accuracy: {factCheckResult.summary.accuracyScore}%
                  </span>
                  {factCheckResult.fixedScript && (
                    <button
                      onClick={handleApplyFixedScript}
                      className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Apply Verified Script</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Claims Checked</span>
                  <strong className="text-slate-100">{factCheckResult.summary.totalClaims}</strong>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-300">
                  <span className="block text-[10px]">🟢 Verified</span>
                  <strong>{factCheckResult.summary.verifiedClaims}</strong>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-300">
                  <span className="block text-[10px]">🟡 Unverified</span>
                  <strong>{factCheckResult.summary.needsVerificationClaims}</strong>
                </div>
                <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-300">
                  <span className="block text-[10px]">🔴 Likely Incorrect</span>
                  <strong>{factCheckResult.summary.likelyIncorrectClaims}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                {factCheckResult.summary.accuracyNote}
              </p>
            </div>
          )}

          {/* Detailed Script Blocks */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300">
            {/* Title */}
            <div>
              <span className="font-bold text-cyan-400 block mb-0.5">1. Title:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={scriptData.title}
                  onChange={(e) => setScriptData({ ...scriptData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                />
              ) : (
                <p className="font-semibold text-slate-100 text-sm">{scriptData.title}</p>
              )}
            </div>

            {/* Hook */}
            <div>
              <span className="font-bold text-amber-400 block mb-0.5">2. Hook (0-5s):</span>
              {isEditing ? (
                <textarea
                  value={scriptData.hook}
                  onChange={(e) => setScriptData({ ...scriptData, hook: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 h-16"
                />
              ) : (
                <p className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-amber-200 italic">
                  "{scriptData.hook}"
                </p>
              )}
            </div>

            {/* Intro */}
            <div>
              <span className="font-bold text-indigo-400 block mb-0.5">3. Introduction:</span>
              <p>{scriptData.introduction}</p>
            </div>

            {/* Complete Script */}
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">4. Complete Script:</span>
              {isEditing ? (
                <textarea
                  value={scriptData.script}
                  onChange={(e) => setScriptData({ ...scriptData, script: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 h-40 font-mono text-xs"
                />
              ) : (
                <p className="whitespace-pre-line leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {scriptData.script}
                </p>
              )}
            </div>

            {/* Scene Breakdown */}
            {scriptData.sceneBreakdown && scriptData.sceneBreakdown.length > 0 && (
              <div>
                <span className="font-bold text-purple-400 block mb-1">5. Scene-by-Scene Breakdown:</span>
                <div className="space-y-2">
                  {scriptData.sceneBreakdown.map((scene, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[11px] text-purple-300 font-bold">
                        <span>Scene {idx + 1}</span>
                        <span>{scene.time}</span>
                      </div>
                      <p><strong className="text-slate-400">Visual:</strong> {scene.visual}</p>
                      <p><strong className="text-slate-400">Voiceover:</strong> "{scene.voiceover}"</p>
                      {scene.onScreenText && (
                        <p><strong className="text-slate-400">Overlay Text:</strong> {scene.onScreenText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voiceover & On-screen text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">6. Voiceover Text:</span>
                <p className="bg-slate-900 p-2 rounded text-[11px] text-slate-300">{scriptData.voiceoverText}</p>
              </div>
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">7. On-Screen Text:</span>
                <p className="bg-slate-900 p-2 rounded text-[11px] text-slate-300">{scriptData.onScreenText}</p>
              </div>
            </div>

            {/* Visuals & B-roll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-blue-400 block mb-0.5">8. Visual Suggestions:</span>
                <p className="text-slate-400">{scriptData.visualSuggestions}</p>
              </div>
              <div>
                <span className="font-bold text-blue-400 block mb-0.5">9. B-Roll Suggestions:</span>
                <p className="text-slate-400">{scriptData.brollSuggestions}</p>
              </div>
            </div>

            {/* Ending & CTA */}
            <div>
              <span className="font-bold text-rose-400 block mb-0.5">10. Ending & CTA:</span>
              <p><strong className="text-slate-400">Ending:</strong> {scriptData.ending}</p>
              <p><strong className="text-rose-400">CTA:</strong> {scriptData.cta}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
