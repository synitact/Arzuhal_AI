import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const SpeechInputButton: React.FC<SpeechInputButtonProps> = ({
  onTranscript,
  disabled,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'tr-TR';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Tarayıcınız sesli yanıt özelliğini desteklemiyor. Lütfen yazarak yanıt verin.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center p-3 rounded-xl transition-all shadow-xs ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={
        isListening
          ? 'Dinleniyor... Konuşmanızı tamamlayınca otomatik mesaj olarak eklenecektir.'
          : 'Sesli Yanıt Ver (Mikrofon)'
      }
    >
      {isListening ? (
        <div className="flex items-center gap-1.5">
          <MicOff className="w-5 h-5" />
          <span className="text-xs font-semibold pr-1">Dinleniyor...</span>
        </div>
      ) : (
        <Mic className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
};
