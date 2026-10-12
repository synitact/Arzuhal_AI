import React, { useState, useRef } from 'react';
import { PetitionOutput, PetitionFormat, CumulativeTokenUsage, ProjectInfo } from '../types';
import { downloadPetitionPdf } from '../utils/pdfGenerator';
import {
  FileCheck2,
  Copy,
  Check,
  Printer,
  Download,
  Info,
  ShieldAlert,
  Sparkles,
  FileText,
  Compass,
  Coins,
  Cpu,
  Receipt,
  Stamp,
  Layers,
  BarChart3,
  FileDown,
  RefreshCw
} from 'lucide-react';

interface SmartOutputPanelProps {
  petitionOutput: PetitionOutput | null;
  formatPreference: PetitionFormat;
  onFormatChange: (fmt: PetitionFormat) => void;
  isCompleted: boolean;
  tokenStats?: CumulativeTokenUsage;
  projectInfo?: ProjectInfo;
  isHighlighted?: boolean;
}

export const SmartOutputPanel: React.FC<SmartOutputPanelProps> = ({
  petitionOutput,
  formatPreference,
  onFormatChange,
  isCompleted,
  tokenStats,
  projectInfo,
  isHighlighted = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'mockup' | 'billing'>('standard');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!petitionOutput?.sectionB?.content || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await downloadPetitionPdf({
        projectInfo,
        petitionOutput,
        element: viewMode === 'mockup' ? mockupRef.current : null,
      });
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    if (!petitionOutput?.sectionB?.content) return;
    navigator.clipboard.writeText(petitionOutput.sectionB.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!petitionOutput?.sectionB?.content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Dilekçe Projesi - T.C. Aile Mahkemesi</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; margin: 40px; color: #111; }
            .header { text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 14pt; text-transform: uppercase; }
            pre { font-family: 'Times New Roman', Times, serif; white-space: pre-wrap; word-wrap: break-word; font-size: 11pt; line-height: 1.7; }
            .footer-stamp { margin-top: 50px; border-top: 1px solid #ccc; pt: 10px; font-size: 9pt; color: #555; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            T.C.<br/>
            ${projectInfo?.sehir || 'İSTANBUL'} AİLE MAHKEMESİ HAKİMLİĞİ'NE
          </div>
          <pre>${petitionOutput.sectionB.content}</pre>
          <div class="footer-stamp">
            T.C. Adalet Bakanlığı UYAP Bilişim Sistemi Standartlarında Dijital Aile Mahkemesi Asistanı Tarafından Üretilmiştir.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTxt = () => {
    if (!petitionOutput?.sectionB?.content) return;
    const blob = new Blob([petitionOutput.sectionB.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aile_Mahkemesi_Dilekce_Projesi_${projectInfo?.davaciAdi?.replace(/\s+/g, '_') || 'Taslak'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const defaultTokenStats: CumulativeTokenUsage = tokenStats || {
    totalPromptTokens: 1450,
    totalCompletionTokens: 1820,
    totalTokens: 3270,
    apiCallCount: 3,
    estimatedCostUSD: 0.00065,
    estimatedCostTRY: 0.0247,
  };

  if (!petitionOutput || !isCompleted) {
    return (
      <div
        id="smart-output-panel-container"
        className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 text-center flex flex-col items-center justify-center h-full min-h-[400px] transition-all"
      >
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-gray-900 text-sm mb-1 uppercase tracking-wider">
          Akıllı Çıktı Paneli Beklemede
        </h3>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-4">
          Sorular tamamlandığında resmi dilekçe taslağınız, mahkeme antetli kağıt mockup'ı, <strong>PDF indirme</strong> ve canlı token/ücretlendirme raporunuz burada oluşturulacaktır.
        </p>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 max-w-xs text-left space-y-1.5">
          <p className="font-bold text-gray-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Çıktı Modülleri:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-500 text-[11px]">
            <li>Bölüm A: Kritik Alanlar ve Onay Kontrolü</li>
            <li>Bölüm B: Resmi Dilekçe & PDF Olarak İndir</li>
            <li>Mahkeme Antetli Kağıt Simülasyonu (Mockup)</li>
            <li>Bölüm C: Adım Adım Adliye Yol Haritası</li>
            <li>📊 Token Sayacı ve Servis Ücretlendirme Raporu</li>
          </ul>
        </div>
      </div>
    );
  }

  const { sectionA, sectionB, sectionC } = petitionOutput;

  return (
    <div
      id="smart-output-panel-container"
      className={`bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-full transition-all duration-500 ${
        isHighlighted
          ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-gray-100 shadow-2xl scale-[1.005]'
          : ''
      }`}
    >
      {/* Visual Navigation Feedback Banner */}
      {isHighlighted && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-between shadow-inner shrink-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>🎯 Çıktı Paneline Geldiniz! Dilekçeniz hazır, inceleyebilir veya PDF olarak indirebilirsiniz.</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-2.5 py-0.5 bg-white hover:bg-emerald-50 text-emerald-800 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <FileDown className="w-3 h-3 text-rose-600" /> Hızlı PDF İndir
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-3 sm:p-3.5 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">
            Akıllı Çıktı Paneli
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Primary PDF Download Action */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Dilekçeyi Resmi PDF Formatında İndir"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'PDF Olarak İndir'}</span>
          </button>

          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" /> Dilekçe Hazır
          </span>
        </div>
      </div>

      {/* Primary View Switcher Tabs (Standard vs Mockup vs Billing) */}
      <div className="bg-gray-100 p-1.5 border-b border-gray-200 flex items-center justify-between gap-1 overflow-x-auto text-xs shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
              viewMode === 'standard'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Standart Görünüm</span>
          </button>

          <button
            onClick={() => setViewMode('mockup')}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
              viewMode === 'mockup'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-amber-800 hover:bg-amber-100/80'
            }`}
          >
            <Stamp className="w-3.5 h-3.5" />
            <span>Mahkeme Antetli Kağıt (Mockup)</span>
          </button>
        </div>

        <button
          onClick={() => setViewMode('billing')}
          className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
            viewMode === 'billing'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Token & Ücret Raporu</span>
        </button>
      </div>

      <div className="p-3.5 flex-1 min-h-0 overflow-y-auto space-y-4 bg-gray-50/50">
        {/* ==========================================
            VIEW MODE 1: STANDARD PREVIEW MODE
           ========================================== */}
        {viewMode === 'standard' && (
          <>
            {/* BÖLÜM A: KRİTİK ALANLAR */}
            <section className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#92400E]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Bölüm A: Kritik Alanlar
                </h3>
              </div>

              <p className="text-xs text-[#92400E] leading-relaxed">
                Dilekçenizi resmi makamlara sunmadan önce lütfen <strong>kalın yazılı</strong> alanları dikkatlice kontrol edin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {sectionA?.criticalFields?.map((field, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border ${
                      field.isWarning
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-white border-amber-200/80 text-gray-800'
                    }`}
                  >
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{field.label}:</div>
                    <div className="font-bold text-gray-900 text-xs mt-0.5">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BÖLÜM B: DİLEKÇE TASLAĞI */}
            <section className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-2">
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                  Bölüm B: Dilekçe Taslağı
                </h3>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors shadow-xs active:scale-95"
                    title="PDF Olarak İndir"
                  >
                    {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    <span>{isGeneratingPdf ? 'İndiriliyor...' : 'PDF İndir'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                    title="Dilekçeyi Kopyala"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors"
                    title="Yazdır"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">Yazdır</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors"
                    title="İndir (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hidden sm:inline">Metin (.txt)</span>
                  </button>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1 text-xs bg-gray-50 p-1 rounded-lg border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold px-1">Metin Formatı:</span>
                <button
                  onClick={() => onFormatChange('resmi')}
                  className={`px-2 py-0.5 rounded font-medium text-xs transition-all ${
                    formatPreference === 'resmi'
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Resmi Mahkeme
                </button>
                <button
                  onClick={() => onFormatChange('acklamali')}
                  className={`px-2 py-0.5 rounded font-medium text-xs transition-all ${
                    formatPreference === 'acklamali'
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Açıklamalı
                </button>
                <button
                  onClick={() => onFormatChange('ozet')}
                  className={`px-2 py-0.5 rounded font-medium text-xs transition-all ${
                    formatPreference === 'ozet'
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Özet
                </button>
              </div>

              {/* Petition Document Text Area */}
              <div className="bg-[#F9FAFB] border border-gray-200 rounded p-4 font-serif text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                {sectionB?.content}
              </div>
            </section>

            {/* BÖLÜM C: YOL HARİTASI */}
            <section className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" /> Bölüm C: Yol Haritası
              </h3>

              {/* Current Status */}
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs text-gray-700">
                <span className="font-bold text-gray-900 block mb-0.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" /> Sıradaki Adım:
                </span>
                <p className="leading-relaxed">
                  {sectionC?.currentStatus || 'Dilekçe taslağınızı onayladıktan sonra adliye veznesine harç yatırmanız gerekecektir.'}
                </p>
              </div>

              {/* Future Steps */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-[11px] text-gray-500 uppercase tracking-wider block">
                  Süreç Adımları
                </span>
                <div className="space-y-2">
                  {sectionC?.futureSteps?.map((step, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-500 pl-3 py-1">
                      <div className="text-xs font-semibold text-emerald-700">Adım {idx + 1}</div>
                      <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {sectionC?.recommendations && sectionC.recommendations.length > 0 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block text-emerald-800">
                    💡 Tavsiyeler:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                    {sectionC.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}

        {/* ==========================================
            VIEW MODE 2: COURT LETTERHEAD MOCKUP
           ========================================== */}
        {viewMode === 'mockup' && (
          <div className="space-y-3">
            {/* Action buttons bar */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold">Resmi Mahkeme Kağıdı Simülasyonu (A4 Görünümü)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  <span>{isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'PDF Olarak İndir'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] shadow-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Antetli Yazdır
                </button>
              </div>
            </div>

            {/* Simulated Paper A4 Container */}
            <div
              ref={mockupRef}
              className="relative bg-[#FAF9F5] border border-gray-300 shadow-md rounded-sm p-6 sm:p-8 font-serif text-gray-900 text-xs sm:text-sm leading-relaxed select-text"
            >
              {/* Official Diagonal Watermark Stamp */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] select-none rotate-[-25deg]">
                <div className="border-8 border-red-900 p-8 rounded-2xl text-center text-red-900">
                  <div className="text-3xl font-extrabold uppercase tracking-widest">T.C. AİLE MAHKEMESİ</div>
                  <div className="text-xl font-bold mt-2 uppercase tracking-wider">RESMİ DİLEKÇE MOCKUP - DİJİTAL ASİSTAN</div>
                  <div className="text-sm font-semibold mt-1">E-İMZA TEVZİ TASLAĞI</div>
                </div>
              </div>

              {/* Top Header Section (Antet) */}
              <div className="border-b-2 border-red-900/80 pb-4 mb-6 relative">
                <div className="flex items-start justify-between">
                  {/* Left: Crescent / Emblem & Court Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-red-800 bg-red-50 flex flex-col items-center justify-center text-red-800 font-bold shrink-0 shadow-xs">
                      <span className="text-[10px] leading-none">T.C.</span>
                      <span className="text-[14px] font-black leading-none mt-0.5">⚖️</span>
                    </div>
                    <div>
                      <h1 className="font-bold text-sm sm:text-base text-red-900 tracking-tight uppercase">
                        T.C. {projectInfo?.sehir || 'İSTANBUL'} AİLE MAHKEMESİ
                      </h1>
                      <p className="text-[11px] font-sans text-gray-600">
                        Adalet Bakanlığı UYAP Bilişim Sistemi Dilekçe Projesi
                      </p>
                      <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-2">
                        <span>Evrak No: EVK-2026-9814</span>
                        <span>•</span>
                        <span>Birinci Sınıf Mahkeme Formatı</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Barcode simulation */}
                  <div className="text-right hidden sm:block">
                    <div className="font-mono text-[10px] text-gray-500 tracking-tighter bg-white p-1 rounded border border-gray-200 inline-block">
                      ||| |||| | ||| ||||||| | ||
                    </div>
                    <p className="text-[9px] font-sans text-gray-400 mt-0.5">UYAP Doğrulama Kodu: 2026-D892</p>
                    <p className="text-[10px] font-semibold text-gray-700 mt-1">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>

              {/* Court Header Title */}
              <div className="text-center font-bold text-sm sm:text-base my-6 uppercase tracking-wider text-gray-900">
                T.C.<br />
                {projectInfo?.sehir || 'İSTANBUL'} AİLE MAHKEMESİ HAKİMLİĞİ'NE
              </div>

              {/* Content body */}
              <div className="whitespace-pre-wrap font-serif text-gray-900 leading-loose text-xs sm:text-sm pl-2 pr-2">
                {sectionB?.content}
              </div>

              {/* Signature Block (Bottom Right) */}
              <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-end">
                <div className="text-[10px] font-sans text-gray-500">
                  <p className="font-bold text-gray-700">EKLER VE BELGELER:</p>
                  <p>1. Nüfus kayıt örneği ve kimlik fotokopisi</p>
                  <p>2. Varsa iddiaları destekleyici yazılı kanıtlar</p>
                </div>

                <div className="text-right font-sans">
                  <p className="text-xs font-bold text-gray-900">DAVACI</p>
                  <p className="text-xs text-gray-800 font-semibold">{projectInfo?.davaciAdi || '[DAVACI AD SOYAD]'}</p>
                  <div className="mt-3 w-32 border-b border-dashed border-gray-400 ml-auto"></div>
                  <p className="text-[10px] text-gray-400 italic mt-0.5">İmza / E-İmza</p>
                </div>
              </div>

              {/* UYAP Footer Strip */}
              <div className="mt-8 pt-3 border-t border-gray-300 text-center text-[10px] font-sans text-gray-400 flex items-center justify-between">
                <span>Adalet Bakanlığı UYAP Mevzuatına Uygundur</span>
                <span>Dijital Aile Mahkemesi Asistanı Mockup Sürümü</span>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW MODE 3: TOKEN & BILLING REPORT
           ========================================== */}
        {viewMode === 'billing' && (
          <div className="space-y-4">
            {/* Header info card */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                    <BarChart3 className="w-4 h-4 text-indigo-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-white">
                      Token Kullanım & İşlem Miktar Raporu
                    </h3>
                    <p className="text-[11px] text-indigo-200">
                      Yapay zeka işlem hacmi ve müşteri servis ücretlendirme dökümü
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/40 hover:bg-indigo-500/60 border border-indigo-400/40 text-white rounded text-xs font-semibold"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Raporu PDF İndir</span>
                  </button>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-400/30">
                    Resmi İşlem Raporu
                  </span>
                </div>
              </div>
            </div>

            {/* Token Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-600" /> Girdi (Prompt)
                </div>
                <p className="text-base font-extrabold text-gray-900 mt-1">
                  {defaultTokenStats.totalPromptTokens.toLocaleString('tr-TR')} <span className="text-[10px] text-gray-400 font-normal">tok</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Kullanıcı & sistem iletileri</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Çıktı (Completion)
                </div>
                <p className="text-base font-extrabold text-gray-900 mt-1">
                  {defaultTokenStats.totalCompletionTokens.toLocaleString('tr-TR')} <span className="text-[10px] text-gray-400 font-normal">tok</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Üretilen yanıt & dilekçe</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-600" /> Toplam Token
                </div>
                <p className="text-base font-extrabold text-blue-700 mt-1">
                  {defaultTokenStats.totalTokens.toLocaleString('tr-TR')} <span className="text-[10px] text-gray-400 font-normal">tok</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Oturum toplam hacmi</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-indigo-600" /> AI Çağrı Sayısı
                </div>
                <p className="text-base font-extrabold text-gray-900 mt-1">
                  {defaultTokenStats.apiCallCount} <span className="text-[10px] text-gray-400 font-normal">adım</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Model etkileşimi</p>
              </div>
            </div>

            {/* Detailed Billing Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-indigo-600" /> Servis & İşlem Ücretlendirme Dökümü
                </h4>
                <span className="text-[10px] text-gray-500 font-mono">ID: {projectInfo?.id || 'PROJ-2026-8912'}</span>
              </div>

              <div className="p-3 text-xs space-y-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase font-bold">
                      <th className="pb-2">Hizmet / İşlem Kalemi</th>
                      <th className="pb-2 text-center">Birim / Hacim</th>
                      <th className="pb-2 text-right">Tahmini Maliyet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="py-2">
                        <p className="font-semibold text-gray-900">Prompt / Girdi Token İşleme</p>
                        <p className="text-[10px] text-gray-400">Gemini Model Girdi Hesabı ($0.075 / 1M token)</p>
                      </td>
                      <td className="py-2 text-center font-mono">{defaultTokenStats.totalPromptTokens} tok</td>
                      <td className="py-2 text-right font-mono text-gray-900">
                        ${((defaultTokenStats.totalPromptTokens * 0.075) / 1000000).toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <p className="font-semibold text-gray-900">Completion / Çıktı Token Üretimi</p>
                        <p className="text-[10px] text-gray-400">Dilekçe & Analiz Üretimi ($0.30 / 1M token)</p>
                      </td>
                      <td className="py-2 text-center font-mono">{defaultTokenStats.totalCompletionTokens} tok</td>
                      <td className="py-2 text-right font-mono text-gray-900">
                        ${((defaultTokenStats.totalCompletionTokens * 0.30) / 1000000).toFixed(6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <p className="font-semibold text-gray-900">Dijital Dilekçe Hazırlama Sabit Servis Bedeli</p>
                        <p className="text-[10px] text-gray-400">Platform Projelendirme & Şablon Hizmet Katmanı</p>
                      </td>
                      <td className="py-2 text-center font-mono">1 İşlem</td>
                      <td className="py-2 text-right font-mono text-gray-900">₺150.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Billing Footer */}
                <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <div>
                    <p className="text-[11px] font-bold text-indigo-900 uppercase">Toplam Tahakkuk Tutar</p>
                    <p className="text-[10px] text-indigo-700">AI Model Maliyeti: ${defaultTokenStats.estimatedCostUSD.toFixed(5)} (~₺{defaultTokenStats.estimatedCostTRY.toFixed(3)})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-indigo-900">
                      ₺{(150 + defaultTokenStats.estimatedCostTRY).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 block">KDV Dahil / İşlem Başı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
