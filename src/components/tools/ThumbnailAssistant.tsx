import React, { useState } from 'react';
import { analyzeThumbnailApi, generateThumbnailImageApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { ThumbnailConcept } from '../../types';
import { Image, Upload, Copy, Save, Sparkles, Loader2, Check, Download, RefreshCw, AlertCircle } from 'lucide-react';

interface ThumbnailAssistantProps {
  onSaved?: () => void;
}

export const ThumbnailAssistant: React.FC<ThumbnailAssistantProps> = ({ onSaved }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('16:9');

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingImageGen, setLoadingImageGen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concept, setConcept] = useState<ThumbnailConcept | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMime(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setError(null);
    try {
      const data = await analyzeThumbnailApi({
        imageBase64: selectedImage || undefined,
        mimeType: imageMime,
        description,
        format: format === '16:9' ? 'YouTube Thumbnail (16:9)' : format === '9:16' ? 'Shorts Cover (9:16)' : 'Square (1:1)',
      });
      setConcept(data);
      addHistoryItem({
        toolType: 'Thumbnail',
        title: description || 'Thumbnail Concept',
        prompt: description || 'Thumbnail design breakdown',
        content: data,
      });
    } catch (err: any) {
      setError(err.message || 'Thumbnail analysis failed');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!concept?.aiPrompt) return;
    setLoadingImageGen(true);
    setError(null);
    try {
      const url = await generateThumbnailImageApi({
        prompt: concept.aiPrompt,
        aspectRatio: format,
      });
      setGeneratedImageUrl(url);
    } catch (err: any) {
      setError(err.message || 'Image generation unavailable or key limit reached. Use prompt directly.');
    } finally {
      setLoadingImageGen(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!concept?.aiPrompt) return;
    navigator.clipboard.writeText(concept.aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSave = async () => {
    if (!concept) return;
    try {
      await saveProjectApi({
        title: description || 'Thumbnail Concept',
        type: 'Thumbnail',
        content: {
          ...concept,
          generatedImageUrl,
          format,
        },
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
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
          🖼️
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">AI THUMBNAIL ASSISTANT</h2>
          <p className="text-xs text-slate-400">Analyze photos & generate high-CTR thumbnail prompts & graphics</p>
        </div>
      </div>

      {/* Image Upload & Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Upload Phone Photo / Screenshot (Optional)
          </label>
          <div className="relative border-2 border-dashed border-slate-800 hover:border-purple-500/50 bg-slate-950 rounded-xl p-4 text-center transition-colors">
            {selectedImage ? (
              <div className="relative inline-block max-w-full">
                <img
                  src={selectedImage}
                  alt="Uploaded photo"
                  className="max-h-48 rounded-lg mx-auto shadow-md border border-slate-800"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2">
                <Upload className="w-8 h-8 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">
                  Click or drag photo from phone gallery / camera
                </span>
                <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Video Subject / Thumbnail Concept Notes
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Cricket match winning moment, shocked face on right with explosive background..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Aspect Ratio Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: 'YouTube (16:9)' },
                { id: '9:16', label: 'Shorts/Reels (9:16)' },
                { id: '1:1', label: 'Square (1:1)' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id)}
                  className={`py-2 px-2 text-xs rounded-xl font-semibold border transition-all ${
                    format === fmt.id
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loadingAnalysis}
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          {loadingAnalysis ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Thumbnail Concept...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Thumbnail Concept & AI Prompt</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Output */}
      {concept && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
              ✨ Thumbnail Design Breakdown
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPrompt}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied Prompt' : 'Copy AI Prompt'}</span>
              </button>

              <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Concept'}</span>
              </button>
            </div>
          </div>

          {/* AI Image Generation Button */}
          <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-100">AI Image Generator</p>
              <p className="text-[11px] text-slate-400">Generate visual draft using Gemini image model</p>
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={loadingImageGen}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              {loadingImageGen ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Generating Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Generate AI Image</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Image Preview */}
          {generatedImageUrl && (
            <div className="p-3 bg-slate-950 rounded-xl border border-purple-500/40 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                ✅ Generated AI Image Preview ({format})
              </span>
              <img
                src={generatedImageUrl}
                alt="AI Generated Thumbnail"
                className="w-full rounded-lg shadow border border-slate-800 max-h-80 object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              <div className="flex justify-end">
                <a
                  href={generatedImageUrl}
                  download="thumbnail.png"
                  className="text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          )}

          {/* Concept Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300">
            <div>
              <span className="font-bold text-purple-400 block mb-0.5">Overall Concept:</span>
              <p>{concept.thumbnailConcept}</p>
            </div>
            <div>
              <span className="font-bold text-cyan-400 block mb-0.5">Subject Placement:</span>
              <p>{concept.subjectPlacement}</p>
            </div>
            <div>
              <span className="font-bold text-amber-400 block mb-0.5">Background Concept:</span>
              <p>{concept.backgroundConcept}</p>
            </div>
            <div>
              <span className="font-bold text-indigo-400 block mb-0.5">Lighting & Angles:</span>
              <p>{concept.lighting} ({concept.cameraAngle})</p>
            </div>
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">Color Grading & Depth:</span>
              <p>{concept.colorGrading} • {concept.depth}</p>
            </div>
            <div>
              <span className="font-bold text-rose-400 block mb-0.5">Text & FX:</span>
              <p>{concept.textPlacement} ({concept.visualEffects})</p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">🤖 AI Generation Prompt:</span>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-200 font-mono text-[11px] select-all">
                {concept.aiPrompt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
