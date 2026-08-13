import React, { useState } from 'react';
import { ProjectItem } from '../types';
import { X, Copy, Trash2, Check, Save, Star, Share2, Edit3, Code, Eye, ChevronDown, ChevronUp, CopyCheck } from 'lucide-react';
import { deleteProjectApi, saveProjectApi } from '../services/api';
import { toggleFavoriteProject, getFavoriteProjectIds } from '../services/storage';

interface ProjectModalProps {
  project: ProjectItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onDeleted, onUpdated }) => {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [isEditing, setIsEditing] = useState(false);
  const [isFav, setIsFav] = useState(() => getFavoriteProjectIds().includes(project.id));
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Content string or object state
  const [rawText, setRawText] = useState(() => {
    return typeof project.content === 'string'
      ? project.content
      : JSON.stringify(project.content, null, 2);
  });

  const [editableContent, setEditableContent] = useState<any>(project.content);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    title: true,
    script: true,
    scenes: true,
    editing: true,
    seo: true,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleCopySection = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    const textToCopy = typeof editableContent === 'string' ? editableContent : JSON.stringify(editableContent, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = typeof editableContent === 'string' ? editableContent : JSON.stringify(editableContent, null, 2);
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: shareText,
      });
    } else {
      handleCopyAll();
    }
  };

  const handleToggleFavorite = () => {
    const updated = toggleFavoriteProject(project.id);
    setIsFav(updated);
    if (onUpdated) onUpdated();
  };

  const handleDuplicate = async () => {
    try {
      await saveProjectApi({
        title: `Copy of ${project.title}`,
        type: project.type,
        topic: project.topic,
        platform: project.platform,
        language: project.language,
        content: editableContent,
      });
      alert(`Project "${project.title}" duplicated!`);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete project "${project.title}"?`)) {
      try {
        await deleteProjectApi(project.id);
        onDeleted(project.id);
        onClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveEdits = async () => {
    try {
      let finalContent = editableContent;
      if (viewMode === 'raw') {
        try {
          finalContent = JSON.parse(rawText);
        } catch {
          finalContent = rawText;
        }
      }
      await saveProjectApi({
        title: project.title,
        type: project.type,
        topic: project.topic,
        platform: project.platform,
        language: project.language,
        content: finalContent,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      if (onUpdated) onUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper renderer for structured content
  const renderFormattedContent = () => {
    if (!editableContent || typeof editableContent !== 'object') {
      return (
        <pre className="whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
          {String(editableContent || rawText)}
        </pre>
      );
    }

    const c = editableContent;

    return (
      <div className="space-y-3 text-xs text-slate-200">
        {/* Title / Hook Header */}
        {(c.title || c.hook) && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            {c.title && (
              <div>
                <span className="text-[10px] font-bold text-cyan-400 block uppercase">Project Title</span>
                <p className="font-bold text-slate-100 text-sm">{c.title}</p>
              </div>
            )}
            {c.hook && (
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Attention Hook</span>
                <p className="text-amber-200 italic bg-amber-500/10 p-2 rounded border border-amber-500/20">"{c.hook}"</p>
              </div>
            )}
          </div>
        )}

        {/* Fact Check Analysis Section */}
        {c.summary && Array.isArray(c.claims) && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">🔎 Fact Check & Accuracy Breakdown</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-bold">
                Score: {c.summary.accuracyScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">Total Claims</span>
                <strong className="text-slate-200 text-xs">{c.summary.totalClaims}</strong>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-emerald-300">
                <span className="block">🟢 Verified</span>
                <strong className="text-xs">{c.summary.verifiedClaims}</strong>
              </div>
              <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20 text-amber-300">
                <span className="block">🟡 Unverified</span>
                <strong className="text-xs">{c.summary.needsVerificationClaims}</strong>
              </div>
              <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20 text-rose-300">
                <span className="block">🔴 Incorrect</span>
                <strong className="text-xs">{c.summary.likelyIncorrectClaims}</strong>
              </div>
            </div>

            {c.fixedScript && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 block mb-1">FACT-CHECKED FIXED SCRIPT</span>
                <p className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-line leading-relaxed">
                  {c.fixedScript}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Complete Script / Main Text Section */}
        {(c.script || c.concept || c.timelineOverview || c.voiceoverText) && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('script')}
              className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left font-bold text-slate-200 border-b border-slate-800/80"
            >
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span>📝 Core Script & Content</span>
              </span>
              {openSections.script ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.script && (
              <div className="p-3 space-y-2">
                {c.script && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-400 text-[10px]">FULL SCRIPT TEXT</span>
                      <button
                        onClick={() => handleCopySection(c.script, 'script')}
                        className="text-[10px] text-cyan-400 font-bold flex items-center gap-1"
                      >
                        {copiedSection === 'script' ? 'Copied!' : 'Copy Script'}
                      </button>
                    </div>
                    <p className="whitespace-pre-line bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono text-[11px]">
                      {c.script}
                    </p>
                  </div>
                )}

                {c.voiceoverText && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="font-bold text-cyan-400 text-[10px] block mb-1">VOICEOVER NARRATION</span>
                    <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">{c.voiceoverText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scene Breakdown */}
        {Array.isArray(c.sceneBreakdown) && c.sceneBreakdown.length > 0 && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('scenes')}
              className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left font-bold text-purple-400 border-b border-slate-800/80"
            >
              <span>🎬 Scene-by-Scene Breakdown ({c.sceneBreakdown.length} Scenes)</span>
              {openSections.scenes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.scenes && (
              <div className="p-3 space-y-2">
                {c.sceneBreakdown.map((s: any, i: number) => (
                  <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold text-purple-300">
                      <span>Scene {i + 1}</span>
                      <span>{s.time}</span>
                    </div>
                    {s.visual && <p><strong className="text-slate-400">Visual:</strong> {s.visual}</p>}
                    {s.voiceover && <p><strong className="text-slate-400">Audio:</strong> "{s.voiceover}"</p>}
                    {s.onScreenText && <p><strong className="text-slate-400">Text:</strong> {s.onScreenText}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Titles & SEO */}
        {(c.titles || c.youtubeDescription || c.hashtags) && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('seo')}
              className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left font-bold text-blue-400 border-b border-slate-800/80"
            >
              <span>📝 Title, Description & Hashtags</span>
              {openSections.seo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.seo && (
              <div className="p-3 space-y-2 text-[11px]">
                {Array.isArray(c.titles) && (
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">TITLE OPTIONS</span>
                    <ul className="list-disc list-inside space-y-1 bg-slate-900 p-2 rounded">
                      {c.titles.map((t: any, i: number) => (
                        <li key={i} className="font-semibold text-slate-200">
                          {typeof t === 'string' ? t : t.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(c.youtubeDescription || c.description) && (
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">DESCRIPTION</span>
                    <p className="whitespace-pre-line bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[10px]">
                      {c.youtubeDescription || c.description}
                    </p>
                  </div>
                )}

                {c.hashtags && (
                  <div>
                    <span className="font-bold text-cyan-400 block mb-1">HASHTAGS</span>
                    <p className="bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[10px]">
                      {Array.isArray(c.hashtags) ? c.hashtags.join(' ') : c.hashtags}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Visual Prompt or Image */}
        {c.aiPrompt && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-purple-400 text-[10px] uppercase block">AI Image Prompt</span>
            <p className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-purple-200">
              {c.aiPrompt}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-xl border transition-all ${
                isFav ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <div>
              <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {project.type}
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{project.title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {project.platform} • {project.language} • {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
              className="p-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl flex items-center gap-1"
              title="Toggle Formatted / Raw Code"
            >
              {viewMode === 'formatted' ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 font-sans">
          {isEditing ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-cyan-400 block">Edit Project Data / JSON:</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSaveEdits}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          ) : viewMode === 'formatted' ? (
            renderFormattedContent()
          ) : (
            <pre className="whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
              {rawText}
            </pre>
          )}

          {saveSuccess && (
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl mt-3 text-center">
              ✓ Saved edits successfully!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleDelete}
            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDuplicate}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <CopyCheck className="w-4 h-4" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Content'}</span>
            </button>

            <button
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl text-xs font-semibold"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyAll}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
