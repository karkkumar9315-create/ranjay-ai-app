import React from 'react';
import { Sparkles, Smartphone, Monitor, Zap } from 'lucide-react';

interface HeaderProps {
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ isPhoneFrame, setIsPhoneFrame, activeTab }) => {
  return (
    <div className="bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 sticky top-0 z-40">
      {/* Android Top Bar Mockup */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1 font-mono select-none">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          5G • RANJAY AI v1.0
        </span>
        <div className="flex items-center gap-2">
          <span>01:25 PM</span>
          <span>🔋 100%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-cyan-400 font-black text-lg">
                R
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950 border border-slate-900">
              ⚡
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 font-sans">
                RANJAY AI
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Your AI Creator Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 text-xs font-medium"
            title={isPhoneFrame ? 'Switch to Fullscreen' : 'Switch to Android Frame'}
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
