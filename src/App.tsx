import React, { useState } from 'react';
import { FileCheck2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { Footer } from './components/Footer';
import { ProjectCardPanel } from './components/ProjectCardPanel';
import { ChatPanel } from './components/ChatPanel';
import { SmartOutputPanel } from './components/SmartOutputPanel';
import { InitialFormModal } from './components/InitialFormModal';
import { ProjectInfo, ChatMessage, PetitionOutput, PetitionFormat, ChatApiResponse, InitialFormData, DavaTuru, CumulativeTokenUsage } from './types';

const INITIAL_PROJECT_INFO: ProjectInfo = {
  id: 'proj_' + Date.now(),
  createdAt: new Date().toISOString(),
  davaciAdi: '',
  davaciTC: '',
  davaciAdres: '',
  davaliAdi: '',
  davaliTC: '',
  davaliAdres: '',
  sehir: 'İSTANBUL',
  mahkemeAdi: 'AİLE MAHKEMESİ HAKİMLİĞİ',
  davaTuru: 'belirsiz',
  olayOzeti: '',
  evlilikSuresiYil: null,
  ortakCocukSayisi: 0,
  ortakCocukDetaylari: '',
  velayetTalebi: '',
  cocukBakimParasi: '',
  esBakimParasi: '',
  maddiTazminat: '',
  maneviTazminat: '',
  malPaylasimi: '',
  bosanmaNedenleri: [],
  deliller: [],
  uyarilar: [],
  formatPreference: 'resmi',
  isFormSubmitted: false,
};

export default function App() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(INITIAL_PROJECT_INFO);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [petitionOutput, setPetitionOutput] = useState<PetitionOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'project' | 'output'>('chat');
  const [highlightOutput, setHighlightOutput] = useState<boolean>(false);

  // Token Usage & Billing Stats State
  const [tokenStats, setTokenStats] = useState<CumulativeTokenUsage>({
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    apiCallCount: 0,
    estimatedCostUSD: 0,
    estimatedCostTRY: 0,
  });

  // Website View & Modal States
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<DavaTuru | undefined>(undefined);

  const handleStartForm = (cat?: DavaTuru) => {
    if (cat) setSelectedCategory(cat);
    setIsFormModalOpen(true);
  };

  const handleInitialFormSubmit = async (formData: InitialFormData) => {
    setIsFormModalOpen(false);
    setCurrentView('workspace');

    const updatedInfo: ProjectInfo = {
      ...projectInfo,
      davaciAdi: formData.davaciAdi,
      davaciTC: formData.davaciTC,
      davaciAdres: formData.davaciAdres,
      davaliAdi: formData.davaliAdi,
      davaliTC: formData.davaliTC,
      davaliAdres: formData.davaliAdres,
      sehir: formData.sehir,
      davaTuru: formData.davaTuru,
      olayOzeti: formData.olayOzeti,
      isFormSubmitted: true,
    };

    setProjectInfo(updatedInfo);

    const summaryUserMsgText = `Merhaba, başlangıç formunu doldurdum.
Davacı: ${formData.davaciAdi} (TC: ${formData.davaciTC || 'Belirtilmedi'})
Davalı: ${formData.davaliAdi} (TC: ${formData.davaliTC || 'Belirtilmedi'})
Şehir: ${formData.sehir}
Dava Konusu: ${formData.davaTuru}
Olay Özeti: "${formData.olayOzeti}"`;

    const summaryMsg: ChatMessage = {
      id: 'msg_init_summary',
      sender: 'user',
      text: summaryUserMsgText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([summaryMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [summaryMsg],
          projectInfo: updatedInfo,
          questionCount: 0,
          userMessage: summaryUserMsgText,
          formatPreference: updatedInfo.formatPreference,
        }),
      });

      if (response.ok) {
        const data: ChatApiResponse = await response.json();
        if (data.updatedProjectInfo) {
          setProjectInfo((prev) => ({ ...prev, ...data.updatedProjectInfo, isFormSubmitted: true }));
        }

        if (data.tokenUsage) {
          setTokenStats((prev) => {
            const prompt = prev.totalPromptTokens + data.tokenUsage!.promptTokens;
            const completion = prev.totalCompletionTokens + data.tokenUsage!.completionTokens;
            const total = prompt + completion;
            const count = prev.apiCallCount + 1;
            const costUSD = (prompt * 0.000000075) + (completion * 0.00000030);
            const costTRY = costUSD * 38.0;
            return {
              totalPromptTokens: prompt,
              totalCompletionTokens: completion,
              totalTokens: total,
              apiCallCount: count,
              estimatedCostUSD: costUSD,
              estimatedCostTRY: costTRY,
            };
          });
        }

        const botMsg: ChatMessage = {
          id: 'msg_b_' + Date.now(),
          sender: 'bot',
          text: data.botReply || `Teşekkürler Sayın ${formData.davaciAdi}. Başlangıç bilgilerinizi aldım. Sorularıma başlıyorum...`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([summaryMsg, botMsg]);
        setQuestionCount(data.questionCount || 1);
        if (data.isCompleted) {
          setIsCompleted(true);
          if (data.petitionOutput) setPetitionOutput(data.petitionOutput);
        }
      }
    } catch (err) {
      console.error('Initial chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = (newFormat: PetitionFormat) => {
    setProjectInfo((prev) => ({ ...prev, formatPreference: newFormat }));
    if (petitionOutput?.sectionB) {
      setPetitionOutput((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sectionB: {
            ...prev.sectionB,
            format: newFormat,
          },
        };
      });
    }
  };

  const handleNewProject = () => {
    if (window.confirm('Yeni bir başvuru/dilekçe formu başlatmak istediğinize emin misiniz?')) {
      setProjectInfo({ ...INITIAL_PROJECT_INFO, id: 'proj_' + Date.now() });
      setMessages([]);
      setQuestionCount(0);
      setIsCompleted(false);
      setPetitionOutput(null);
      setTokenStats({
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        apiCallCount: 0,
        estimatedCostUSD: 0,
        estimatedCostTRY: 0,
      });
      setActiveTab('chat');
      setIsFormModalOpen(true);
    }
  };

  const handleStartDemo = (demoType: DavaTuru = 'anlaşmalı_boşanma') => {
    const demoData: InitialFormData = {
      davaciAdi: 'Ayşe Yılmaz',
      davaciTC: '12345678901',
      davaciAdres: 'Atatürk Mah. Gül Sok. No:14 Kadıköy / İstanbul',
      davaliAdi: 'Ahmet Yılmaz',
      davaliTC: '98765432109',
      davaliAdres: 'Bağdat Cad. No:88 Kadıköy / İstanbul',
      sehir: 'İstanbul',
      davaTuru: demoType,
      olayOzeti: 'Eşimle 4 yıldır evliyiz. Karşılıklı uzlaşarak anlaşmalı boşanmaya karar verdik. 5 yaşında ortak çocuğumuz var; velayet anneye kalacak ve baba çocuk için aylık 7.500 TL bakım parası ödeyecektir.',
    };
    handleInitialFormSubmit(demoData);
  };

  const handleSendMessage = async (userText: string, isVoice: boolean = false) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isVoice,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          projectInfo,
          questionCount,
          userMessage: userText,
          formatPreference: projectInfo.formatPreference,
        }),
      });

      if (!response.ok) {
        throw new Error('API yanıt vermedi');
      }

      const data: ChatApiResponse = await response.json();

      // Update Project Info
      if (data.updatedProjectInfo) {
        setProjectInfo((prev) => ({ ...prev, ...data.updatedProjectInfo }));
      }

      // Update Token Usage Stats
      if (data.tokenUsage) {
        setTokenStats((prev) => {
          const prompt = prev.totalPromptTokens + data.tokenUsage!.promptTokens;
          const completion = prev.totalCompletionTokens + data.tokenUsage!.completionTokens;
          const total = prompt + completion;
          const count = prev.apiCallCount + 1;
          const costUSD = (prompt * 0.000000075) + (completion * 0.00000030);
          const costTRY = costUSD * 38.0;
          return {
            totalPromptTokens: prompt,
            totalCompletionTokens: completion,
            totalTokens: total,
            apiCallCount: count,
            estimatedCostUSD: costUSD,
            estimatedCostTRY: costTRY,
          };
        });
      }

      // Handle system warning
      if (data.systemWarning) {
        const warnMsg: ChatMessage = {
          id: 'msg_w_' + Date.now(),
          sender: 'system_warning',
          text: `⚠️ UYARI: ${data.systemWarning}`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        };
        newMessages.push(warnMsg);
      }

      // Next question count
      const nextQCount = data.questionCount || questionCount + 1;
      setQuestionCount(nextQCount);

      // Append bot reply
      const botMsg: ChatMessage = {
        id: 'msg_b_' + Date.now(),
        sender: 'bot',
        text: data.botReply || 'Bilgileriniz kaydedildi. Bir sonraki aşamaya geçelim.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newMessages, botMsg]);

      // Check completion status
      if (data.isCompleted || nextQCount >= 20) {
        setIsCompleted(true);
        if (data.petitionOutput) {
          setPetitionOutput(data.petitionOutput);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'system_warning',
        text: 'Bir iletişim hatası oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateView = (view: 'landing' | 'workspace') => {
    if (view === 'workspace' && !projectInfo.isFormSubmitted) {
      setIsFormModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const handleViewOutput = () => {
    if (currentView !== 'workspace') {
      setCurrentView('workspace');
    }
    setActiveTab('output');
    setHighlightOutput(true);
    setTimeout(() => {
      setHighlightOutput(false);
    }, 3500);

    // On both desktop and mobile, provide instant smooth scroll and vivid highlight
    setTimeout(() => {
      const panelEl = document.getElementById('smart-output-panel-container');
      if (panelEl) {
        panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);
  };

  const handleFooterNavigate = (view: 'landing' | 'workspace' | 'faq' | 'guide') => {
    if (view === 'workspace') {
      handleNavigateView('workspace');
    } else {
      setCurrentView('landing');
      setTimeout(() => {
        if (view === 'faq') {
          document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (view === 'guide') {
          document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div
      className={`bg-[#F3F4F6] flex flex-col font-sans text-gray-900 selection:bg-blue-200 ${
        currentView === 'workspace'
          ? 'h-screen max-h-screen overflow-hidden'
          : 'min-h-screen overflow-y-auto'
      }`}
    >
      {/* Show Initial Form Modal if open */}
      {isFormModalOpen && (
        <InitialFormModal
          onSubmit={handleInitialFormSubmit}
          onClose={() => setIsFormModalOpen(false)}
          initialDavaTuru={selectedCategory}
        />
      )}

      {/* Top Navigation Bar */}
      <Header
        questionCount={questionCount}
        formatPreference={projectInfo.formatPreference}
        onFormatChange={handleFormatChange}
        onNewProject={handleNewProject}
        isCompleted={isCompleted}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'output') {
            handleViewOutput();
          }
        }}
        currentView={currentView}
        onNavigateView={handleNavigateView}
        hasActiveProject={projectInfo.isFormSubmitted}
        onViewOutput={handleViewOutput}
      />

      {/* Main View Renderer */}
      {currentView === 'landing' ? (
        <>
          <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
            <LandingView
              onStartForm={handleStartForm}
              onNavigateWorkspace={() => setCurrentView('workspace')}
              hasActiveProject={projectInfo.isFormSubmitted}
              onStartDemo={handleStartDemo}
              onViewOutput={handleViewOutput}
            />
          </div>

          {/* Website Footer on Landing Page */}
          <Footer
            onOpenForm={() => handleStartForm()}
            onNavigate={handleFooterNavigate}
          />
        </>
      ) : (
        <>
          {/* Workspace Dashboard View - Responsive 3-Panel without jumpy outer scroll */}
          <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full min-h-0">
              {/* Left Panel: Dilekçe Kartı (Desktop: 3 Cols) */}
              <div
                className={`lg:col-span-3 h-full min-h-0 overflow-hidden ${
                  activeTab === 'project' ? 'block' : 'hidden lg:block'
                }`}
              >
                <ProjectCardPanel
                  projectInfo={projectInfo}
                  questionCount={questionCount}
                  onUpdateProjectInfo={setProjectInfo}
                  onFormatChange={handleFormatChange}
                />
              </div>

              {/* Center Panel: Soru-Cevap Akışı (Desktop: 5 Cols) */}
              <div
                className={`lg:col-span-5 h-full min-h-0 overflow-hidden ${
                  activeTab === 'chat' ? 'block' : 'hidden lg:block'
                }`}
              >
                <ChatPanel
                  messages={messages}
                  questionCount={questionCount}
                  isCompleted={isCompleted}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onViewOutput={handleViewOutput}
                  formatPreference={projectInfo.formatPreference}
                />
              </div>

              {/* Right Panel: Akıllı Çıktı Paneli (Desktop: 4 Cols) */}
              <div
                className={`lg:col-span-4 h-full min-h-0 overflow-hidden ${
                  activeTab === 'output' ? 'block' : 'hidden lg:block'
                }`}
              >
                <SmartOutputPanel
                  petitionOutput={petitionOutput}
                  formatPreference={projectInfo.formatPreference}
                  onFormatChange={handleFormatChange}
                  isCompleted={isCompleted}
                  tokenStats={tokenStats}
                  projectInfo={projectInfo}
                  isHighlighted={highlightOutput}
                />
              </div>
            </div>
          </main>

          {/* Compact Workspace Status Bar */}
          <footer className="bg-white border-t border-gray-200/90 px-4 py-2 text-[11px] text-gray-500 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>UYAP Format Standartlarında</span>
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="hidden sm:inline text-gray-600 font-medium">
                {projectInfo.davaciAdi ? `${projectInfo.davaciAdi} • ${projectInfo.davaTuru}` : 'Aktif Başvuru Formu'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isCompleted && (
                <button
                  onClick={handleViewOutput}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Dilekçe Çıktısına Git</span>
                </button>
              )}
              <button
                onClick={() => setCurrentView('landing')}
                className="hover:text-blue-600 transition-colors text-xs font-semibold"
              >
                Ana Sayfa Rehberi
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
