// Native Web Speech API Voice synthesis helper with Hindi/English support

class VoiceSynthesizer {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      lang?: string;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.synth) {
      if (options?.onError) options.onError('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.lang = options?.lang ?? 'hi-IN';

    // Try finding Hindi / Indian English / natural voice
    const voices = this.synth.getVoices();
    const match = voices.find(
      (v) =>
        v.lang.includes('hi') ||
        v.lang.includes('IN') ||
        v.name.includes('India') ||
        v.name.includes('Google')
    );
    if (match) {
      utterance.voice = match;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (options?.onError) options.onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }
}

export const ttsPlayer = new VoiceSynthesizer();

// Speech Recognition (Dictation) Helper
export function startVoiceRecognition(
  onResult: (text: string) => void,
  onError?: (err: string) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('Speech Recognition is not supported on this browser.');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'hi-IN';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error || 'Recognition error');
  };

  recognition.start();

  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
  };
}
