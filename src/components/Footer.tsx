import React from 'react';
import { Scale, ShieldCheck, Heart, AlertCircle, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  onOpenForm: () => void;
  onNavigate: (view: 'landing' | 'workspace' | 'faq' | 'guide') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenForm, onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          {/* Col 1: Brand & Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Aile Mahkemesi <span className="text-blue-400">Asistanı</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Yapay zeka destekli, anlaşılır dilde Aile Mahkemesi dilekçe hazırlama ve hukuki süreç bilgilendirme platformu.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Güvenli & Gizli Veri İşleme</span>
            </div>
          </div>

          {/* Col 2: Hizmet Alanları */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" /> Aile Mahkemesi Konuları
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button onClick={onOpenForm} className="hover:text-white transition-colors text-left">
                  • Anlaşmalı Boşanma Dilekçesi
                </button>
              </li>
              <li>
                <button onClick={onOpenForm} className="hover:text-white transition-colors text-left">
                  • Çekişmeli Boşanma ve Tazminat
                </button>
              </li>
              <li>
                <button onClick={onOpenForm} className="hover:text-white transition-colors text-left">
                  • İştirak ve Yoksulluk Nafakası Artırımı
                </button>
              </li>
              <li>
                <button onClick={onOpenForm} className="hover:text-white transition-colors text-left">
                  • Velayetin Değiştirilmesi ve Düzenlenmesi
                </button>
              </li>
              <li>
                <button onClick={onOpenForm} className="hover:text-white transition-colors text-left">
                  • 6284 Koruma ve Uzaklaştırma Kararı
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hızlı Bağlantılar */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Site İçi Gezinti
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('workspace')} className="hover:text-white transition-colors">
                  Dilekçe Çalışma Paneli
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guide')} className="hover:text-white transition-colors">
                  Aile Mahkemesi Süreç Rehberi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Sıkça Sorulan Sorular (SSS)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Önemli Yasal Uyarı */}
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Yasal Bilgilendirme</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Aile Mahkemesi Asistanı, kullanıcıların girdikleri bilgilere dayalı olarak taslak mahkeme dilekçesi metni üreten yapay zeka destekli rehberlik ve teknik araçtır. Avukatlık hizmeti veya resmi hukuki danışmanlık vermez. Karmaşık davalarınız için baroya kayıtlı bir avukata başvurmanız tavsiye edilir.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 Aile Mahkemesi Asistanı. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1 text-gray-400 text-[11px]">
            <span>Anlaşılır Dille Hukuki Destek İçin Tasarlandı</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
