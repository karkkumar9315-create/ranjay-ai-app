import React, { useState } from 'react';
import { generateIdeasApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { ContentIdea } from '../../types';
import { Lightbulb, Copy, Save, Sparkles, Loader2, Check, ArrowRight, Filter } from 'lucide-react';

interface IdeaGeneratorProps {
  onSelectIdeaForScript?: (ideaTitle: string) => void;
  onSaved?: () => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onSelectIdeaForScript, onSaved }) => {
  const [niche, setNiche] = useState('Cricket');
  const [language, setLanguage] = useState('Hinglish');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const categories = [
    'All',
    'Trending-style',
    'Educational',
    'Entertainment',
    'Suspense',
    'Emotional',
    'Facts',
    'Gaming',
  ];

  const handleGenerate = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateIdeasApi({ niche, language });
      setIdeas(data);
      addHistoryItem({
        toolType: 'Ideas',
        title: `20 Content Ideas for ${niche}`,
        prompt: niche,
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIdea = (idea: ContentIdea) => {
    const text = `TITLE: ${idea.title}\nHook: ${idea.hook}\nConcept: ${idea.concept}\nDuration: ${idea.duration} | Format: ${idea.suggestedFormat}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAll = async () => {
    if (ideas.length === 0) return;
    try {
      await saveProjectApi({
        title: `20 Content Ideas for ${niche}`,
        type: 'Ideas',
        topic: niche,
        content: ideas,
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIdeas =
    selectedCategory === 'All'
      ? ideas
      : ideas.filter((i) => i.category === selectedCategory);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
          💡
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">CONTENT IDEA GENERATOR</h2>
          <p className="text-xs text-slate-400">Generate 20+ viral content concepts by niche & category</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Niche / Topic <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Cricket, Tech Reviews, AI Tools, Personal Finance, Street Food..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Bhojpuri">Bhojpuri</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !niche.trim()}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating 20 Viral Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Generate 20 Content Ideas</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Result list */}
      {ideas.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              🔥 {ideas.length} Content Ideas Generated for "{niche}"
            </h3>
            <button
              onClick={handleSaveAll}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved All Ideas' : 'Save Ideas Pack'}</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 px-3 text-xs rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ideas List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredIdeas.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.category}
                    </span>
                    <span className="text-slate-400 font-mono">{item.duration} • {item.platform}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{idx + 1}. {item.title}</h4>
                  <p className="text-[11px] text-amber-200/90 italic my-1">"{item.hook}"</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.concept}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyIdea(item)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onSelectIdeaForScript && (
                    <button
                      onClick={() => onSelectIdeaForScript(item.title)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <span>Create Script</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
