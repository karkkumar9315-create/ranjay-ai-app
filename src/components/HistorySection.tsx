import React, { useState, useEffect } from 'react';
import { HistoryItem, getHistory, deleteHistoryItem, toggleFavoriteHistory, clearHistory } from '../services/storage';
import { saveProjectApi } from '../services/api';
import { Clock, Search, Star, Trash2, Copy, Save, Check, ChevronDown, ChevronUp, Sparkles, Filter, RefreshCw } from 'lucide-react';

interface HistorySectionProps {
  onSavedProject?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onSavedProject }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const toolTypes = ['All', 'Script', 'Thumbnail', 'Ideas', 'Shorts', 'Voiceover', 'Editing', 'TitleSEO', 'CompleteVideo'];

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this history item?')) {
      const updated = deleteHistoryItem(id);
      setHistory(updated);
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteHistory(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (confirm('Clear all generation history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleCopy = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsProject = async (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveProjectApi({
        title: item.title || `${item.toolType} Generation`,
        type: item.toolType,
        topic: item.prompt,
        content: item.content,
      });
      setSavedIds((prev) => [...prev, item.id]);
      if (onSavedProject) onSavedProject();
      setTimeout(() => {
        setSavedIds((prev) => prev.filter((id) => id !== item.id));
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || item.toolType === filterType;
    const matchesFav = !onlyFavorites || item.isFavorite;
    return matchesSearch && matchesType && matchesFav;
  });

  return (
    <div className="space-y-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Generation History & Logs
          </h3>
          <p className="text-[11px] text-slate-400">All recent AI outputs automatically logged here</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>Favorites ({history.filter((h) => h.isFavorite).length})</span>
          </button>

          <button
            onClick={loadHistory}
            className="p-1.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 text-xs"
              title="Clear All History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history by topic or keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Type Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {toolTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`py-0.5 px-2.5 text-[10px] font-bold rounded-full whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/60 p-4">
          No history items found. Generate content with any tool to record history!
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSaved = savedIds.includes(item.id);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-950/90 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all p-3 space-y-2"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`p-1 hover:scale-110 transition-transform ${
                        item.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <span className="text-[9px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 whitespace-nowrap">
                      {item.toolType}
                    </span>

                    <span className="text-xs font-bold text-slate-200 truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-300 animate-fadeIn">
                    <p className="text-[11px] text-slate-400 italic">
                      <strong className="text-slate-300">Prompt:</strong> "{item.prompt}"
                    </p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 max-h-48 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap text-slate-200">
                      {typeof item.content === 'string'
                        ? item.content
                        : JSON.stringify(item.content, null, 2)}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="px-2.5 py-1 text-slate-500 hover:text-rose-400 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={(e) => handleSaveAsProject(item, e)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'Saved to Projects' : 'Save as Project'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
