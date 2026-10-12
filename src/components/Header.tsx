import React from 'react';
import { Scale, FileText, Sparkles, RefreshCw, Home, LayoutDashboard, BookOpen, HelpCircle } from 'lucide-react';
import { PetitionFormat } from '../types';

interface HeaderProps {
  questionCount: number;
  formatPreference: PetitionFormat;
  onFormatChange: (fmt: PetitionFormat) => void;
  onNewProject: () => void;
  isCompleted: boolean;
  activeTab: 'chat' | 'project' | 'output';
  onTabChange: (tab: 'chat' | 'project' | 'output') => void;
  currentView: 'landing' | 'workspace';
  onNavigateView: (view: 'landing' | 'workspace') => void;
  hasActiveProject: boolean;
  onViewOutput?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  formatPreference,
  onFormatChange,
  onNewProject,
  isCompleted,
  activeTab,
  onTabChange,
  currentView,
  onNavigateView,
  hasActiveProject,
  onViewOutput,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigateView('landing')}
              className="flex items-center space-x-3 text-left focus:outline-hidden group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-blue-600 tracking-tight">
                    Aile Mahkemesi <span className="text-indigo-600">Asistanı</span>
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                    Dijital Dilekçe Portalı
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  Anlaşılır Dille Aile Mahkemesi Dilekçe & Rehberlik Platformu
                </p>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-gray-200">
              <button
                onClick={() => onNavigateView('landing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'landing'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ana Sayfa</span>
              </button>

              <button
                onClick={() => onNavigateView('workspace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'workspace'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dilekçe Çalışma Paneli</span>
                {hasActiveProject && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {hasActiveProject && (
                <button
                  onClick={onViewOutput ? onViewOutput : () => onTabChange('output')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'output' && currentView === 'workspace'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Dilekçe Çıktı Paneline Git"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dilekçe Çıktısı</span>
                  {isCompleted && (
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                      Hazır
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Format Selector Pills (Only when in workspace mode) */}
            {currentView === 'workspace' && (
              <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Format:
                </span>
                <button
                  onClick={() => onFormatChange('resmi')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    formatPreference === 'resmi'
                      ? 'bg-white text-blue-600 shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Resmi Mahkeme
                </button>
                <button
                  onClick={() => onFormatChange('acklamali')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    formatPreference === 'acklamali'
                      ? 'bg-white text-blue-600 shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Açıklamalı Taslak
                </button>
                <button
                  onClick={() => onFormatChange('ozet')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    formatPreference === 'ozet'
                      ? 'bg-white text-blue-600 shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Özet Dilekçe
                </button>
              </div>
            )}

            {/* New Project Button */}
            <button
              onClick={onNewProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
              title="Yeni Dilekçe Projesi Başlat"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>Yeni Başvuru / Form</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-gray-200 py-1.5 gap-1 justify-around text-xs font-medium text-gray-600">
          <button
            onClick={() => onNavigateView('landing')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-colors flex items-center justify-center gap-1 ${
              currentView === 'landing'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200'
                : 'hover:bg-gray-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </button>

          <button
            onClick={() => onNavigateView('workspace')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-colors flex items-center justify-center gap-1 ${
              currentView === 'workspace'
                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200'
                : 'hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dilekçe Paneli</span>
          </button>
        </div>

        {/* Mobile Sub-tabs for Workspace */}
        {currentView === 'workspace' && (
          <div className="flex lg:hidden border-t border-gray-200 pt-1.5 pb-2 gap-1 justify-around text-xs font-medium text-gray-600">
            <button
              onClick={() => onTabChange('chat')}
              className={`flex-1 py-1 text-center rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              💬 Sohbet
            </button>
            <button
              onClick={() => onTabChange('project')}
              className={`flex-1 py-1 text-center rounded-lg transition-colors ${
                activeTab === 'project'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              📋 Proje Kartı
            </button>
            <button
              onClick={onViewOutput ? onViewOutput : () => onTabChange('output')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-colors cursor-pointer ${
                activeTab === 'output'
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              {isCompleted ? '✅ Dilekçe Hazır' : '📄 Çıktı Paneli'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
