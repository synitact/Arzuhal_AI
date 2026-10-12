import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PetitionFormat } from '../types';
import { SpeechInputButton } from './SpeechInputButton';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Volume2
} from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  questionCount: number;
  isCompleted: boolean;
  isLoading: boolean;
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onViewOutput: () => void;
  formatPreference: PetitionFormat;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  questionCount,
  isCompleted,
  isLoading,
  onSendMessage,
  onViewOutput,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (!transcript.trim() || isLoading) return;
    onSendMessage(transcript.trim(), true);
  };

  const handleQuickChip = (chipText: string) => {
    if (isLoading) return;
    if (chipText.includes('Çıktı Paneline Git') || chipText.includes('Dilekçeyi Görüntüle')) {
      onViewOutput();
      return;
    }
    onSendMessage(chipText, false);
  };

  // Get last bot message to highlight the current single question
  const lastBotMessage = [...messages].reverse().find((m) => m.sender === 'bot');

  // Dynamic quick suggestion chips based on stage/context
  const getQuickChips = () => {
    if (isCompleted) {
      return [
        '⚡ Dilekçeyi Görüntüle (Çıktıya Git)',
        'Aylık nafaka miktarını 10.000 TL olarak güncelle',
        'Tazminat miktarını 100.000 TL olarak ekle',
        'Dilekçeyi adliyeye nasıl vereceğim?',
      ];
    }

    const text = (lastBotMessage?.text || '').toLowerCase();
    if (text.includes('nafaka') && (text.includes('artırım') || text.includes('artan'))) {
      return [
        'Mevcut nafaka 1.500 TL, yeni talep 8.500 TL',
        'Okul, servis ve beslenme masrafları çok arttı',
        '⚡ Dilekçemi Hemen Hazırla',
      ];
    }
    if (text.includes('koruma') || text.includes('uzaklaştırma') || text.includes('şiddet')) {
      return [
        '6 ay süreyle ev ve işyerime yaklaşmama kararı',
        'Sürekli tehdit ve hakaret var, can güvenliğim tehlikede',
        '⚡ Dilekçemi Hemen Hazırla',
      ];
    }
    if (text.includes('evli') || text.includes('çocuk') || text.includes('velayet')) {
      return [
        '4 yıldır evliyiz, 1 çocuk var (5 yaşında)',
        'Velayet bende kalsın, aylık 7.500 TL bakım parası',
        'Ortak çocuğumuz yok, tüm şartlarda anlaştık',
        '⚡ Dilekçemi Hemen Hazırla',
      ];
    }
    if (text.includes('velayet')) {
      return [
        'Velayet bende kalsın, aylık 6.000 TL nafaka',
        'Çocuğun üstün yararı için anneye/babaya verilsin',
        '⚡ Dilekçemi Hemen Hazırla',
      ];
    }
    return [
      'Tüm bilgilerim doğru, onaylıyorum',
      '⚡ Dilekçemi Hemen Hazırla',
    ];
  };

  const quickChips = getQuickChips();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">
              Soru-Cevap Akışı
            </h3>
            <p className="text-[11px] text-gray-500">
              Dijital Aile Mahkemesi Asistanı
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50 overscroll-contain">
        {messages.map((msg) => {
          if (msg.sender === 'system_warning') {
            return (
              <div key={msg.id} className="my-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{msg.text}</div>
              </div>
            );
          }

          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs leading-relaxed ${
                  isBot
                    ? 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs'
                    : 'bg-blue-600 text-white rounded-br-xs font-normal'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                <div
                  className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                    isBot ? 'text-gray-400' : 'text-blue-100'
                  }`}
                >
                  {msg.isVoice && <Volume2 className="w-3 h-3 text-blue-200" />}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-xs p-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">
              <Bot className="w-3 h-3" />
            </div>
            <span className="font-medium animate-pulse text-gray-600">Arzuhalci soruyu hazırlıyor...</span>
          </div>
        )}

        {/* Completed banner */}
        {isCompleted && (
          <div className="my-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs space-y-2.5 text-center shadow-xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
            <div className="font-bold text-sm text-emerald-900">Resmi Mahkeme Dilekçeniz Hazırlandı!</div>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto text-xs">
              Tüm bilgiler derlendi. Sağdaki çıktı panelinden mahkeme antetli kağıdında inceleyebilir, tek tıkla <strong>PDF olarak indirebilirsiniz</strong>.
            </p>
            <button
              type="button"
              onClick={onViewOutput}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-emerald-400/40"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Çıktı Paneline Git & İncele</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      {quickChips.length > 0 && !isLoading && (
        <div className="px-3 py-2 bg-gray-50/95 border-t border-gray-200/80 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Hızlı Seçim:
          </span>
          {quickChips.map((chip, idx) => {
            const isAction = chip.includes('⚡');
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all shrink-0 whitespace-nowrap active:scale-95 shadow-2xs ${
                  isAction
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <SpeechInputButton onTranscript={handleVoiceTranscript} disabled={isLoading} />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder={
            isCompleted
              ? 'Dilekçede değişiklik yapmak veya soru sormak için yazın...'
              : 'Cevabınızı buraya yazın veya yukarıdaki hazır yanıtlardan seçin...'
          }
          className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 active:scale-95 shadow-xs"
          title="Gönder"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

