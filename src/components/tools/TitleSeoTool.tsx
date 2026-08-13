import React, { useState } from 'react';
import { generateTitlesApi, generateSeoApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { TitleOption, SeoPackage } from '../../types';
import { FileText, Copy, Save, Sparkles, Loader2, Check, Tag, List } from 'lucide-react';

interface TitleSeoToolProps {
  onSaved?: () => void;
}

export const TitleSeoTool: React.FC<TitleSeoToolProps> = ({ onSaved }) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Hinglish');
  const [activeTab, setActiveTab] = useState<'titles' | 'seo'>('titles');

  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titles, setTitles] = useState<TitleOption[]>([]);
  const [seo, setSeo] = useState<SeoPackage | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSeo, setCopiedSeo] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerateTitles = async () => {
    if (!topic.trim()) return;
    setLoadingTitles(true);
    setError(null);
    try {
      const data = await generateTitlesApi({ topic, language });
      setTitles(data);
      addHistoryItem({
        toolType: 'TitleSEO',
        title: `10 Titles for ${topic}`,
        prompt: topic,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Title generation failed');
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleGenerateSeo = async () => {
    if (!topic.trim()) return;
    setLoadingSeo(true);
    setError(null);
    try {
      const data = await generateSeoApi({ topic, language });
      setSeo(data);
      addHistoryItem({
        toolType: 'TitleSEO',
        title: `SEO Package for ${topic}`,
        prompt: topic,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'SEO generation failed');
    } finally {
      setLoadingSeo(false);
    }
  };

  const handleCopyTitle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopySeo = () => {
    if (!seo) return;
    const text = `
YOUTUBE DESCRIPTION:
${seo.youtubeDescription}

INSTAGRAM CAPTION:
${seo.instagramCaption}

HASHTAGS:
${seo.hashtags ? seo.hashtags.join(' ') : ''}

TAGS:
${seo.platformTags}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSeo(true);
    setTimeout(() => setCopiedSeo(false), 2000);
  };

  const handleSave = async () => {
    try {
      await saveProjectApi({
        title: `Titles & SEO for ${topic}`,
        type: 'TitleSEO',
        topic,
        content: { titles, seo },
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
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
          📝
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">TITLE, CAPTIONS & SEO GENERATOR</h2>
          <p className="text-xs text-slate-400">10 Viral title options, descriptions, captions, hashtags & search tags</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video Topic / Keyword <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to grow on YouTube Shorts in 2026..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Bhojpuri">Bhojpuri</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateTitles}
            disabled={loadingTitles || !topic.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
          >
            {loadingTitles ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <List className="w-3.5 h-3.5" />}
            <span>Generate 10 Titles</span>
          </button>

          <button
            onClick={handleGenerateSeo}
            disabled={loadingSeo || !topic.trim()}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
          >
            {loadingSeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
            <span>Generate SEO & Captions</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      {(titles.length > 0 || seo) && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('titles')}
                className={`py-1.5 px-3 text-xs font-bold rounded-lg border transition-all ${
                  activeTab === 'titles'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                10 Titles ({titles.length})
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`py-1.5 px-3 text-xs font-bold rounded-lg border transition-all ${
                  activeTab === 'seo'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                SEO & Captions
              </button>
            </div>

            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Titles List */}
          {activeTab === 'titles' && titles.length > 0 && (
            <div className="space-y-2">
              {titles.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {t.style}
                    </span>
                    <p className="text-xs font-bold text-slate-100">{t.title}</p>
                  </div>
                  <button
                    onClick={() => handleCopyTitle(t.title, idx)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1 shrink-0"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SEO Output */}
          {activeTab === 'seo' && seo && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="flex justify-end">
                <button
                  onClick={handleCopySeo}
                  className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                >
                  {copiedSeo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSeo ? 'Copied' : 'Copy SEO Metadata'}</span>
                </button>
              </div>

              <div>
                <span className="font-bold text-blue-400 block mb-0.5">YouTube Description:</span>
                <p className="bg-slate-900 p-2.5 rounded font-mono text-[11px] whitespace-pre-line text-slate-200">
                  {seo.youtubeDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-indigo-400 block mb-0.5">Instagram Caption:</span>
                  <p className="bg-slate-900 p-2 rounded text-slate-200">{seo.instagramCaption}</p>
                </div>
                <div>
                  <span className="font-bold text-purple-400 block mb-0.5">Facebook Caption:</span>
                  <p className="bg-slate-900 p-2 rounded text-slate-200">{seo.facebookCaption}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-0.5">Hashtags:</span>
                <p className="bg-slate-900 p-2 rounded text-emerald-300 font-mono">
                  {seo.hashtags ? seo.hashtags.join(' ') : ''}
                </p>
              </div>

              <div>
                <span className="font-bold text-amber-400 block mb-0.5">Platform Tags (YouTube Tag Box):</span>
                <p className="bg-slate-900 p-2 rounded text-slate-300 font-mono select-all">
                  {seo.platformTags}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
