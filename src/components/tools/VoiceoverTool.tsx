import React, { useState } from 'react';
import { generateTtsApi, saveProjectApi } from '../../services/api';
import { addHistoryItem } from '../../services/storage';
import { ttsPlayer } from '../../services/audio';
import { Mic, Play, Pause, Square, Copy, Save, Sparkles, Loader2, Check, Volume2, Sliders } from 'lucide-react';

interface VoiceoverToolProps {
  onSaved?: () => void;
}

export const VoiceoverTool: React.FC<VoiceoverToolProps> = ({ onSaved }) => {
  const [text, setText] = useState('');
  const [voiceStyle, setVoiceStyle] = useState('Energetic');
  const [language, setLanguage] = useState('hi-IN');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadingServerTts, setLoadingServerTts] = useState(false);
  const [serverAudioUrl, setServerAudioUrl] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handlePlayNative = () => {
    if (!text.trim()) return;
    if (isPaused) {
      ttsPlayer.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    setStatusMsg('Playing via Web Speech Engine...');

    ttsPlayer.speak(text, {
      rate,
      pitch,
      lang: language,
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setStatusMsg('Finished playback');
      },
      onError: (err) => {
        setIsPlaying(false);
        setIsPaused(false);
        setStatusMsg('Native speech error: ' + err);
      },
    });
  };

  const handlePause = () => {
    ttsPlayer.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    ttsPlayer.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setStatusMsg(null);
  };

  const handleGenerateServerAudio = async () => {
    if (!text.trim()) return;
    setLoadingServerTts(true);
    setStatusMsg(null);
    try {
      const base64 = await generateTtsApi({ text, voice: 'Kore' });
      const audioUri = `data:audio/wav;base64,${base64}`;
      setServerAudioUrl(audioUri);
      setStatusMsg('✅ Audio generated via Gemini TTS!');
      addHistoryItem({
        toolType: 'Voiceover',
        title: text.substring(0, 30) + '...',
        prompt: text,
        content: { text, voiceStyle, language, rate, pitch },
      });
    } catch (err: any) {
      setStatusMsg('Gemini TTS unavailable: ' + (err.message || 'Error') + '. Native Web Speech Player active.');
    } finally {
      setLoadingServerTts(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    try {
      await saveProjectApi({
        title: text.substring(0, 30) + '...',
        type: 'Voiceover',
        content: { text, voiceStyle, language, rate, pitch },
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
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
          🎙️
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">VOICEOVER & TTS STUDIO</h2>
          <p className="text-xs text-slate-400">Generate voiceover audio & test natural voice narration</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Voiceover Script Text <span className="text-emerald-400">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Aapko pata hai ki 2026 mein AI creators sabse fast grow kar rahe hain? Chaliye dekhte hain kaise..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Audio Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Voice Style</label>
            <select
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="Energetic">Energetic (High Hype)</option>
              <option value="Calm">Calm & Soothing</option>
              <option value="Emotional">Emotional & Deep</option>
              <option value="News">News Anchor</option>
              <option value="Storytelling">Storytelling</option>
              <option value="Cinematic">Cinematic Trailer</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Language Voice</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="hi-IN">Hindi / Hinglish (India)</option>
              <option value="en-IN">English (India Accent)</option>
              <option value="en-US">English (US Accent)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Speed ({rate}x)</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 mt-2"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlayNative}
                disabled={!text.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Voiceover</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateServerAudio}
              disabled={loadingServerTts || !text.trim()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
            >
              {loadingServerTts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Gemini Audio Export</span>
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold"
            >
              {savedSuccess ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {statusMsg && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            {statusMsg}
          </p>
        )}

        {/* Server Audio Player */}
        {serverAudioUrl && (
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400">Generated Audio Track</span>
            <audio controls src={serverAudioUrl} className="w-full h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
