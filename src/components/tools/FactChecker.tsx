import React, { useState } from 'react';
import { factCheckApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { FactCheckResult, FactClaim } from '../../types';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Copy,
  Save,
  Share2,
  Check,
  ShieldCheck,
  RotateCcw,
  FileText,
  Zap,
  ArrowRight,
  ExternalLink,
  Edit3
} from 'lucide-react';

interface FactCheckerProps {
  initialScript?: string;
  onSaved?: () => void;
}

export const FactChecker: React.FC<FactCheckerProps> = ({ initialScript = '', onSaved }) => {
  const [textInput, setTextInput] = useState(initialScript);
  const [factCheckMode, setFactCheckMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [activeTab, setActiveTab] = useState<'claims' | 'fixedScript'>('claims');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingScript, setEditingScript] = useState(false);
  const [customFixedScript, setCustomFixedScript] = useState('');

  const samplePrompts = [
    {
      label: '🚀 NASA Spacesuit Claim',
      text: 'NASA confirmed that one astronaut spacesuit costs exactly ₹100 crore ($12 million) and is 100% indestructible in deep space.',
    },
    {
      label: '🌍 Earth Orbit Scientific Fact',
      text: 'Earth takes approximately 365 days to orbit around the Sun, while precisely completing one full revolution every 365.25 days.',
    },
    {
      label: '🏏 Viral Cricket Record',
      text: 'Virat Kohli has scored 100 centuries in T20 International matches and holds the absolute world record for highest T20 score.',
    },
    {
      label: '🩺 Health & Science Fact',
      text: 'Drinking 8 glasses of water daily is 100% scientifically proven by WHO to cure all kidney diseases instantly.',
    },
  ];

  const handleRunFactCheck = async (textToAnalyze?: string) => {
    const content = textToAnalyze || textInput;
    if (!content.trim()) {
      setError('Please paste or type a script, paragraph, or factual claims to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await factCheckApi({
        text: content,
        factCheckMode,
      });

      setResult(data);
      setCustomFixedScript(data.fixedScript || '');
      setActiveTab('claims');

      // Add to history
      addHistoryItem({
        toolType: 'FactCheck',
        title: `Fact Check: ${content.substring(0, 30)}...`,
        prompt: content,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Fact check analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProject = async () => {
    if (!result) return;
    try {
      const title = `Fact-Checked: ${textInput.substring(0, 25)}...`;
      await saveProjectApi({
        title,
        type: 'FactCheck',
        topic: textInput.substring(0, 40),
        platform: 'YouTube / Shorts',
        language: 'Hinglish',
        content: {
          ...result,
          fixedScript: customFixedScript || result.fixedScript,
        },
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'RANJAY AI Fact Check Result',
          text: `Content Accuracy Score: ${result.summary.accuracyScore}%\n\nFact-Checked Script:\n${
            customFixedScript || result.fixedScript
          }`,
        });
      } catch (err) {
        // Share cancelled
      }
    } else if (result) {
      handleCopy(`Accuracy Score: ${result.summary.accuracyScore}%\n\n${customFixedScript || result.fixedScript}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: CheckCircle2,
          label: '🟢 VERIFIED / WELL-SUPPORTED',
        };
      case 'NEEDS_VERIFICATION':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: AlertTriangle,
          label: '🟡 NEEDS VERIFICATION',
        };
      case 'LIKELY_INCORRECT':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: XCircle,
          label: '🔴 LIKELY INCORRECT',
        };
      case 'OPINION':
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: HelpCircle,
          label: '⚪ OPINION / SUBJECTIVE',
        };
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">AI Fact Checker & Content Accuracy</h2>
              <p className="text-xs text-slate-400">Verify claims, spot unverified numbers & generate fact-checked scripts</p>
            </div>
          </div>

          {/* Fact-Check Mode Toggle */}
          <button
            onClick={() => setFactCheckMode(!factCheckMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              factCheckMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fact-Check Mode: {factCheckMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-300 block">
            Paste Script, Paragraph, Facts or YouTube/Shorts Draft:
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={5}
            placeholder="Paste script here... e.g., NASA confirmed that one spacesuit costs exactly ₹100 crore..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
          />

          {/* Quick Sample Test Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Quick Test Samples:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTextInput(s.text);
                    handleRunFactCheck(s.text);
                  }}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleRunFactCheck()}
            disabled={loading || !textInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Claims & Checking Evidence...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Claims & Check Facts</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Fact Check Results */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Accuracy Score Card */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${
                    result.summary.accuracyScore >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : result.summary.accuracyScore >= 50
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {result.summary.accuracyScore}%
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100">Content Accuracy Score</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{result.summary.accuracyNote}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSaveProject}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Saved!' : 'Save Project'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs"
                  title="Share Result"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Claims Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold">Total Claims</span>
                <span className="text-sm font-extrabold text-slate-100">{result.summary.totalClaims}</span>
              </div>
              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 block text-[10px] font-bold">🟢 Verified</span>
                <span className="text-sm font-extrabold text-emerald-300">{result.summary.verifiedClaims}</span>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-amber-400 block text-[10px] font-bold">🟡 Need Verification</span>
                <span className="text-sm font-extrabold text-amber-300">{result.summary.needsVerificationClaims}</span>
              </div>
              <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 block text-[10px] font-bold">🔴 Incorrect</span>
                <span className="text-sm font-extrabold text-rose-300">{result.summary.likelyIncorrectClaims}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-slate-300 block text-[10px] font-bold">⚪ Opinion / Style</span>
                <span className="text-sm font-extrabold text-slate-200">{result.summary.opinionClaims}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs: Detailed Claims vs Fixed Script */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'claims'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Claims Analysis ({result.claims.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fixedScript')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'fixedScript'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ FIX MY SCRIPT (Fact-Checked Version)</span>
            </button>
          </div>

          {/* Tab 1: Detailed Claims Cards */}
          {activeTab === 'claims' && (
            <div className="space-y-3">
              {result.claims.map((claim, idx) => {
                const badge = getStatusBadge(claim.status);
                const Icon = badge.icon;

                return (
                  <div
                    key={claim.id || idx}
                    className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${badge.bg}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{claim.statusLabel || badge.label}</span>
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Confidence: <strong className="text-slate-200">{claim.confidence || 'Medium'}</strong>
                      </span>
                    </div>

                    {/* Claim Text */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        CLAIM #{idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                        "{claim.claim}"
                      </p>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                      <span className="font-bold text-slate-400 block text-[11px]">Explanation:</span>
                      <p className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        {claim.explanation}
                      </p>
                    </div>

                    {/* Correction if available */}
                    {claim.correction && claim.status !== 'VERIFIED' && (
                      <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                        <span className="font-bold block text-[11px] text-emerald-400">
                          Suggested Accurate Correction / Safer Wording:
                        </span>
                        <p className="font-medium leading-relaxed">{claim.correction}</p>
                      </div>
                    )}

                    {/* Source / Reference */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium">Source / Evidence Reference:</span>
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        {claim.source || 'Unable to reliably verify this claim.'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {result.visualPromptAccuracyNotes && (
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Visual Prompt Accuracy Inspection</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {result.visualPromptAccuracyNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Fix My Script Side-by-Side Comparison */}
          {activeTab === 'fixedScript' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-100">Fact-Checked Fixed Script</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingScript(!editingScript)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{editingScript ? 'Done Editing' : 'Edit Script'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(customFixedScript || result.fixedScript)}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Fixed Script'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Questionable claims replaced with verified facts & grounded language while preserving storytelling engagement.
                </p>

                {editingScript ? (
                  <textarea
                    value={customFixedScript}
                    onChange={(e) => setCustomFixedScript(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                  />
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-100 leading-relaxed whitespace-pre-line font-sans">
                    {customFixedScript || result.fixedScript}
                  </div>
                )}
              </div>

              {/* Original Comparison Box */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-400">Original Submitted Script</h4>
                <p className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed whitespace-pre-line line-clamp-6">
                  {result.originalScript}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
