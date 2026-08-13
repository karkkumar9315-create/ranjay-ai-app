import React, { useState } from 'react';
import { RecentProjects } from '../RecentProjects';
import { ScriptGenerator } from '../tools/ScriptGenerator';
import { ThumbnailAssistant } from '../tools/ThumbnailAssistant';
import { IdeaGenerator } from '../tools/IdeaGenerator';
import { ShortsMaker } from '../tools/ShortsMaker';
import { VoiceoverTool } from '../tools/VoiceoverTool';
import { EditingAssistant } from '../tools/EditingAssistant';
import { TitleSeoTool } from '../tools/TitleSeoTool';
import { CompleteVideoCreator } from '../tools/CompleteVideoCreator';
import { CreatorChat } from '../tools/CreatorChat';
import { Sparkles, ArrowLeft, Rocket } from 'lucide-react';

interface HomeTabProps {
  onNavigateToAiChat: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigateToAiChat }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedIdeaForScript, setSelectedIdeaForScript] = useState<string>('');
  const [projectsRefreshTrigger, setProjectsRefreshTrigger] = useState(0);

  const tools = [
    { id: 'complete', title: 'CREATE COMPLETE VIDEO', icon: '🚀', desc: 'All-in-one 11-part package', highlight: true },
    { id: 'script', title: 'AI SCRIPT', icon: '🎬', desc: 'Full video scripts with scene breakdown' },
    { id: 'thumbnail', title: 'AI THUMBNAIL', icon: '🖼️', desc: 'Image analysis & high-CTR prompt' },
    { id: 'ideas', title: 'CONTENT IDEAS', icon: '💡', desc: '20 viral ideas by category' },
    { id: 'shorts', title: 'SHORTS MAKER', icon: '📱', desc: 'Short-form video package' },
    { id: 'voiceover', title: 'VOICEOVER', icon: '🎙️', desc: 'Voice narration & speech synthesis' },
    { id: 'editing', title: 'EDITING ASSISTANT', icon: '✂️', desc: 'CapCut step-by-step editing plan' },
    { id: 'titleseo', title: 'TITLE & SEO', icon: '📝', desc: 'Titles, captions & search tags' },
    { id: 'chat', title: 'AI CREATOR', icon: '🤖', desc: 'Interactive AI Creator Assistant' },
  ];

  const handleToolSaved = () => {
    setProjectsRefreshTrigger((prev) => prev + 1);
  };

  const handleIdeaToScript = (ideaTitle: string) => {
    setSelectedIdeaForScript(ideaTitle);
    setActiveTool('script');
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* If a tool is currently open */}
      {activeTool ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTool(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {activeTool === 'complete' && <CompleteVideoCreator onSaved={handleToolSaved} />}
          {activeTool === 'script' && (
            <ScriptGenerator initialTopic={selectedIdeaForScript} onSaved={handleToolSaved} />
          )}
          {activeTool === 'thumbnail' && <ThumbnailAssistant onSaved={handleToolSaved} />}
          {activeTool === 'ideas' && (
            <IdeaGenerator onSelectIdeaForScript={handleIdeaToScript} onSaved={handleToolSaved} />
          )}
          {activeTool === 'shorts' && <ShortsMaker onSaved={handleToolSaved} />}
          {activeTool === 'voiceover' && <VoiceoverTool onSaved={handleToolSaved} />}
          {activeTool === 'editing' && <EditingAssistant onSaved={handleToolSaved} />}
          {activeTool === 'titleseo' && <TitleSeoTool onSaved={handleToolSaved} />}
          {activeTool === 'chat' && <CreatorChat onSaved={handleToolSaved} />}
        </div>
      ) : (
        /* Home Dashboard View */
        <div className="space-y-6">
          {/* Main Quick Create Tool Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase font-mono">
                QUICK CREATE TOOLS
              </h2>
              <span className="text-[11px] text-cyan-400 font-semibold">9 Tools Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === 'chat') {
                      onNavigateToAiChat();
                    } else {
                      setActiveTool(t.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                    t.highlight
                      ? 'col-span-2 sm:col-span-3 bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 border-cyan-500/40 shadow-lg shadow-cyan-500/10 hover:border-cyan-400'
                      : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t.highlight && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                        {t.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{t.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Projects Component */}
          <RecentProjects refreshTrigger={projectsRefreshTrigger} />
        </div>
      )}
    </div>
  );
};
