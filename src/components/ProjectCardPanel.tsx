import React from 'react';
import { ProjectInfo, PetitionFormat } from '../types';
import {
  FileCheck2,
  User,
  Baby,
  Coins,
  Home,
  Scale,
  AlertTriangle,
  FolderCheck
} from 'lucide-react';

interface ProjectCardPanelProps {
  projectInfo: ProjectInfo;
  questionCount: number;
  onUpdateProjectInfo: (info: ProjectInfo) => void;
  onFormatChange: (fmt: PetitionFormat) => void;
}

export const ProjectCardPanel: React.FC<ProjectCardPanelProps> = ({
  projectInfo,
  onFormatChange,
}) => {
  // Calculate completion percentage based on key fields
  const fields = [
    projectInfo.davaciAdi,
    projectInfo.davaliAdi,
    projectInfo.davaTuru !== 'belirsiz' ? projectInfo.davaTuru : null,
    projectInfo.olayOzeti,
    projectInfo.sehir,
  ];
  const filledCount = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  const completionPercentage = Math.min(100, Math.round((filledCount / fields.length) * 100));

  const getDavaTuruLabel = (turu: string) => {
    switch (turu) {
      case 'anlaşmalı_boşanma': return 'Anlaşmalı Boşanma';
      case 'çekişmeli_boşanma': return 'Çekişmeli Boşanma';
      case 'nafaka_artirimi_uyarlamasi': return 'Nafaka Artırımı & Uyarlama';
      case 'velayet_degisikligi': return 'Velayet Değişikliği / Düzenleme';
      case 'koruma_uzaklastirma_6284': return '6284 Şiddet Koruma & Uzaklaştırma';
      case 'mal_ve_ziynet_paylasimi': return 'Mal Rejimi & Ziynet Paylaşımı';
      case 'soybagi_babalik': return 'Soybağının Reddi / Tespiti & Babalık';
      case 'diger_aile_hukuku': return 'Diğer Aile Hukuku';
      default: return turu || 'Belirleniyor...';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-blue-600" />
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">
              Dilekçe Kartı
            </h2>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${
            completionPercentage >= 100
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {completionPercentage >= 100 ? 'Bilgiler Tamamlandı' : `%${completionPercentage} Dolduruldu`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Fields List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 divide-y divide-gray-100 text-gray-700">
        {/* Warning Alerts Section if any */}
        {projectInfo.uyarilar && projectInfo.uyarilar.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Süreç İkazı</span>
            </div>
            {projectInfo.uyarilar.map((uyari, idx) => (
              <p key={idx} className="text-xs text-amber-900 bg-white/80 p-2 rounded border border-amber-200/50 leading-relaxed">
                {uyari}
              </p>
            ))}
          </div>
        )}

        {/* 1. Taraflar (Davacı & Davalı) */}
        <div className="pt-2">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-400" /> Taraf ve Şehir Bilgileri
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Davacı (Siz)</span>
              <span className="text-xs font-semibold text-gray-900">
                {projectInfo.davaciAdi} {projectInfo.davaciTC ? `(T.C: ${projectInfo.davaciTC})` : ''}
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Davalı (Karşı Taraf)</span>
              <span className="text-xs font-semibold text-gray-900">
                {projectInfo.davaliAdi} {projectInfo.davaliTC ? `(T.C: ${projectInfo.davaliTC})` : ''}
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Mahkeme Şehri</span>
              <span className="text-xs font-semibold text-gray-900">
                {projectInfo.sehir || 'Belirtilmedi'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Dava Konusu */}
        <div className="pt-3">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-gray-400" /> Aile Mahkemesi Konusu
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Konu Türü</span>
              <span className="text-xs font-semibold text-blue-700">
                {getDavaTuruLabel(projectInfo.davaTuru)}
              </span>
            </div>
            {projectInfo.olayOzeti && (
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 text-xs text-gray-800 leading-relaxed">
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1">Olay ve Konu Özeti:</span>
                "{projectInfo.olayOzeti}"
              </div>
            )}
          </div>
        </div>

        {/* 3. Çocuklar & Velayet */}
        {(projectInfo.ortakCocukSayisi > 0 || projectInfo.velayetTalebi) && (
          <div className="pt-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-gray-400" /> Çocuklar & Velayet
            </h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Ortak Çocuklar</span>
                <span className="text-xs font-semibold text-gray-900">
                  {projectInfo.ortakCocukDetaylari || (projectInfo.ortakCocukSayisi === 0 ? 'Çocuk Yok' : 'Var')}
                </span>
              </div>
              {projectInfo.velayetTalebi && (
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Velayet Talebi</span>
                  <span className="text-xs font-semibold text-indigo-700">
                    {projectInfo.velayetTalebi}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Bakım Parası (Nafaka) */}
        {(projectInfo.cocukBakimParasi || projectInfo.esBakimParasi) && (
          <div className="pt-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-gray-400" /> Bakım Parası (Nafaka)
            </h3>
            <div className="space-y-2">
              {projectInfo.cocukBakimParasi && (
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Çocuk İçin</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {projectInfo.cocukBakimParasi}
                  </span>
                </div>
              )}
              {projectInfo.esBakimParasi && (
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Eş Geçim Desteği</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {projectInfo.esBakimParasi}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Mal veya Koruma Talebi */}
        {(projectInfo.malPaylasimi || projectInfo.korumaTalepleri) && (
          <div className="pt-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-gray-400" /> Mal & Koruma Talepleri
            </h3>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 text-xs text-gray-800 leading-relaxed">
              {projectInfo.korumaTalepleri || projectInfo.malPaylasimi}
            </div>
          </div>
        )}

        {/* Format Seçimi */}
        <div className="pt-3 pb-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Çıktı Tercihi
          </label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => onFormatChange('resmi')}
              className={`py-1 text-center rounded font-medium transition-all ${
                projectInfo.formatPreference === 'resmi'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resmi
            </button>
            <button
              onClick={() => onFormatChange('acklamali')}
              className={`py-1 text-center rounded font-medium transition-all ${
                projectInfo.formatPreference === 'acklamali'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Taslak
            </button>
            <button
              onClick={() => onFormatChange('ozet')}
              className={`py-1 text-center rounded font-medium transition-all ${
                projectInfo.formatPreference === 'ozet'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Özet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

