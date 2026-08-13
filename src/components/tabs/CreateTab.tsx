import React, { useState } from 'react';
import { ScriptGenerator } from '../tools/ScriptGenerator';
import { ThumbnailAssistant } from '../tools/ThumbnailAssistant';
import { IdeaGenerator } from '../tools/IdeaGenerator';
import { ShortsMaker } from '../tools/ShortsMaker';
import { VoiceoverTool } from '../tools/VoiceoverTool';
import { EditingAssistant } from '../tools/EditingAssistant';
import { TitleSeoTool } from '../tools/TitleSeoTool';
import { CompleteVideoCreator } from '../tools/CompleteVideoCreator';
import { FactChecker } from '../tools/FactChecker';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const CreateTab: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const toolsList = [
    {
      id: 'factcheck',
      title: 'AI Fact Checker',
      icon: '🔎',
      category: 'Accuracy & Safety',
      desc: 'Verify claims, detect unverified numbers/statistics, get confidence scores & fix scripts.',
    },
    {
      id: 'complete',
      title: 'Create Complete Video',
      icon: '🚀',
      category: 'Master Tool',
      desc: 'One-click generates full script, hook, scenes, voiceover, editing guide, titles & SEO.',
    },
    {
      id: 'script',
      title: 'AI Script Generator',
      icon: '🎬',
      category: 'Scripting',
      desc: 'Generate complete structured video scripts with scene breakdown & B-roll ideas.',
    },
    {
      id: 'thumbnail',
      title: 'AI Thumbnail Assistant',
      icon: '🖼️',
      category: 'Visuals',
      desc: 'Analyze uploaded photo or description & generate high-CTR thumbnail prompts & image drafts.',
    },
    {
      id: 'ideas',
      title: 'Content Idea Generator',
      icon: '💡',
      category: 'Brainstorming',
      desc: 'Generate 20+ viral content concepts categorized by format & engagement type.',
    },
    {
      id: 'shorts',
      title: 'Shorts & Reels Maker',
      icon: '📱',
      category: 'Vertical Video',
      desc: 'Fast-paced vertical short video packages for YouTube Shorts, IG & FB Reels.',
    },
    {
      id: 'voiceover',
      title: 'Voiceover & TTS Studio',
      icon: '🎙️',
      category: 'Audio',
      desc: 'Generate voice narration scripts & speech synthesis playback.',
    },
    {
      id: 'editing',
      title: 'CapCut Video Editing Assistant',
      icon: '✂️',
      category: 'Post Production',
      desc: 'Step-by-step editing roadmap, cuts, transitions, SFX & speed ramping.',
    },
    {
      id: 'titleseo',
      title: 'Title, Captions & SEO',
      icon: '📝',
      category: 'Metadata',
      desc: '10 viral title options, YouTube descriptions, IG/FB captions & hashtags.',
    },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {selectedTool ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTool(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tools Hub</span>
          </button>

          {selectedTool === 'factcheck' && <FactChecker />}
          {selectedTool === 'complete' && <CompleteVideoCreator />}
          {selectedTool === 'script' && <ScriptGenerator />}
          {selectedTool === 'thumbnail' && <ThumbnailAssistant />}
          {selectedTool === 'ideas' && <IdeaGenerator />}
          {selectedTool === 'shorts' && <ShortsMaker />}
          {selectedTool === 'voiceover' && <VoiceoverTool />}
          {selectedTool === 'editing' && <EditingAssistant />}
          {selectedTool === 'titleseo' && <TitleSeoTool />}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Creator Studio Tools Hub
            </h2>
            <p className="text-xs text-slate-400">Select any AI tool to start generating content</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {toolsList.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className="bg-slate-900/90 hover:bg-slate-800/90 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tool.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Launch Tool &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
