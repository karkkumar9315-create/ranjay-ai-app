import React, { useState, useEffect, useRef } from 'react';
import { creatorChatApi, saveProjectApi } from '../../services/api';
import { ChatMessage } from '../../types';
import { Bot, Send, Mic, Volume2, Copy, Save, Trash2, Sparkles, Loader2, Check, User, ExternalLink, Play, Radio } from 'lucide-react';
import { startVoiceRecognition, ttsPlayer } from '../../services/audio';
import { addHistoryItem } from '../../services/storage';

interface CreatorChatProps {
  onSaved?: () => void;
}

export const CreatorChat: React.FC<CreatorChatProps> = ({ onSaved }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ranjay_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        text: 'Namaste! Main Mohtarma hoon, aapki RANJAY AI Creator Assistant. Script, Thumbnail, CapCut editing tricks, YouTube / Instagram opening, ya Shorts ideas ke baare mein kuch bhi puchhiye!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ranjay_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const presetChips = [
    '⚡ 30 second cricket script banao',
    '🖼️ Is photo ke liye thumbnail prompt do',
    '✂️ CapCut masking ka editing plan do',
    '💡 10 Shorts ideas do for Tech',
    '🔴 YouTube kholo',
    '📸 Instagram kholo',
    '💬 WhatsApp share karo',
    '🎵 Song play karo',
  ];

  const checkAppCommands = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('youtube kholo') || lower.includes('open youtube')) {
      return { type: 'app', name: 'YouTube', url: 'https://youtube.com', icon: '🔴' };
    }
    if (lower.includes('instagram kholo') || lower.includes('open instagram')) {
      return { type: 'app', name: 'Instagram', url: 'https://instagram.com', icon: '📸' };
    }
    if (lower.includes('whatsapp') && (lower.includes('kholo') || lower.includes('open') || lower.includes('send') || lower.includes('message'))) {
      return { type: 'app', name: 'WhatsApp Web/App', url: 'https://web.whatsapp.com', icon: '💬' };
    }
    if (lower.includes('song play') || lower.includes('music play') || lower.includes('gaana bajao') || lower.includes('music kholo')) {
      return { type: 'app', name: 'YouTube Music Player', url: 'https://music.youtube.com', icon: '🎵' };
    }
    return null;
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const replyText = await creatorChatApi({
        messages: historyPayload,
        userPrompt: promptText,
        language: 'Hinglish',
      });

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Add to history
      addHistoryItem({
        toolType: 'Assistant',
        title: `Chat: ${promptText.substring(0, 30)}`,
        prompt: promptText,
        content: replyText,
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        text: 'Maaf kijiye, server connect hone mein thoda issue aaya: ' + (err.message || 'Error'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);
    startVoiceRecognition(
      (transcript) => {
        setInput(transcript);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      ttsPlayer.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      ttsPlayer.speak(text, {
        lang: 'hi-IN',
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      const welcome: ChatMessage = {
        id: 'msg_welcome',
        role: 'assistant',
        text: 'Chat reset ho gaya! Main Mohtarma aapki help ke liye taiyar hoon.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
      localStorage.removeItem('ranjay_ai_chat_history');
    }
  };

  const handleSaveConversation = async () => {
    if (messages.length === 0) return;
    try {
      await saveProjectApi({
        title: `Mohtarma Chat: ${messages[messages.length - 1]?.text.substring(0, 25)}...`,
        type: 'Script',
        content: messages,
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-cyan-400 font-black">
              🤖
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Mohtarma AI Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-400">RANJAY AI Personal Creator Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSaveConversation}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Save Chat to Projects"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Prompt Chips */}
      <div className="p-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[11px] bg-slate-900 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const appTrigger = checkAppCommands(m.text);

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-cyan-600 text-slate-950' : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 space-y-2 shadow ${
                  isUser
                    ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{isUser ? 'You' : 'Mohtarma'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <p className="whitespace-pre-line leading-relaxed text-xs">{m.text}</p>

                {/* App Action Card Trigger */}
                {appTrigger && (
                  <div className="mt-2 bg-slate-900 border border-cyan-500/30 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{appTrigger.icon}</span>
                      <span>Launch {appTrigger.name}</span>
                    </span>

                    <a
                      href={appTrigger.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {!isUser && (
                  <div className="pt-1 flex items-center justify-end gap-2 border-t border-slate-900">
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-0.5"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleSpeak(m.id, m.text)}
                      className={`text-[10px] ${
                        speakingId === m.id ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400'
                      }`}
                      title="Listen Voice Response"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-950 p-3 rounded-xl border border-slate-800 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mohtarma is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400'
            }`}
            title="Voice Dictation (Hindi/Hinglish)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mohtarma (e.g. 30s cricket script, CapCut editing...)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 p-2.5 rounded-xl font-bold transition-all shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
