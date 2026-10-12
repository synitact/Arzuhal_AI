import React, { useState } from 'react';
import { DavaTuru } from '../types';
import {
  Scale,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck2,
  Clock,
  MessageSquareText,
  HelpCircle,
  Users,
  HeartHandshake,
  AlertTriangle,
  ChevronDown,
  Coins,
  Baby,
  Home,
  ShieldAlert,
  GitPullRequest,
  BookOpen,
} from 'lucide-react';

interface LandingViewProps {
  onStartForm: (selectedDavaTuru?: DavaTuru) => void;
  onNavigateWorkspace: () => void;
  hasActiveProject: boolean;
  onStartDemo?: (selectedDavaTuru?: DavaTuru) => void;
  onViewOutput?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartForm,
  onNavigateWorkspace,
  hasActiveProject,
  onStartDemo,
  onViewOutput,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const categories: {
    id: DavaTuru;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'anlaşmalı_boşanma',
      title: 'Anlaşmalı Boşanma',
      description: 'Eşinizle boşanma, çocuk velayeti, nafaka ve mal paylaşımında uzlaştıysanız hızlı boşanma dilekçesi.',
      badge: 'En Hızlı Süreç',
      icon: <HeartHandshake className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      id: 'çekişmeli_boşanma',
      title: 'Çekişmeli Boşanma & Tazminat',
      description: 'Anlaşmazlık, kusur durumları, aldatma, şiddet veya şiddetli geçimsizlik sebebiyle boşanma ve tazminat talepleri.',
      badge: 'Kapsamlı Taslak',
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    },
    {
      id: 'nafaka_artirimi_uyarlamasi',
      title: 'Nafaka Artırımı & Uyarlama',
      description: 'Bağlanmış olan iştirak veya yoksulluk nafakasının enflasyon, okul veya artan masraflar nedeniyle yükseltilmesi.',
      badge: 'Ekonomik Talep',
      icon: <Coins className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      id: 'velayet_degisikligi',
      title: 'Velayetin Değiştirilmesi',
      description: 'Çocuğun gelişiminin veya bakımının aksaması, taraf durumlarının değişmesi nedeniyle velayetin devri talebi.',
      badge: 'Çocuğun Üstün Yararı',
      icon: <Baby className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      id: 'koruma_uzaklastirma_6284',
      title: '6284 Şiddet Koruma Kararı',
      description: 'Aile içi şiddet, tehdit, taciz veya rahatsız etme durumlarında acil koruma ve uzaklaştırma tedbiri kararı.',
      badge: 'Acil Tedbir',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200 text-rose-900',
    },
    {
      id: 'mal_ve_ziynet_paylasimi',
      title: 'Mal Rejimi & Ziynet Eşyası',
      description: 'Düğünde takılan altın/ziynet eşyaları ile evlilik birliği içinde edinilen ev, araba ve birikimlerin paylaşımı.',
      badge: 'Maddi Haklar',
      icon: <Home className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
    {
      id: 'soybagi_babalik',
      title: 'Soybağının Reddi & Babalık',
      description: 'Çocuğun soybağının reddi, babalık tespiti veya nüfus kaydının düzeltilmesine ilişkin Aile Mahkemesi davaları.',
      badge: 'Soybağı Hukuku',
      icon: <GitPullRequest className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    },
    {
      id: 'diger_aile_hukuku',
      title: 'Diğer Aile Hukuku Konuları',
      description: 'Ailenin korunması, ortak konut tahsisi, tedbir kararları ve diğer tüm Aile Mahkemesi başvuruları.',
      badge: 'Genel Başvuru',
      icon: <BookOpen className="w-5 h-5 text-slate-600" />,
      color: 'bg-gray-50 border-gray-200 text-gray-900',
    },
  ];

  const faqs = [
    {
      q: 'Aile Mahkemesine başvuru için avukat tutmak zorunlu mudur?',
      a: 'Türkiye\'de şahısların Aile Mahkemelerinde kendilerini temsil etme hakları vardır. Avukat tutmak zorunlu olmamakla birlikte; usul hataları yapmamak için doğru başlıklar, talepler ve deliller içeren düzgün bir dilekçe hazırlamanız son derece önemlidir.',
    },
    {
      q: 'Anlaşmalı boşanma davası için evlilik süresi şartı var mıdır?',
      a: 'Evet, Türk Medeni Kanunu gereğince anlaşmalı boşanma davası açabilmek için tarafların en az 1 yıldır evli olmaları gerekir. Evliliğiniz 1 yıldan az ise mahkeme davanızı reddeder; bu durumda çekişmeli boşanma davası açılması gerekir.',
    },
    {
      q: 'Yapay zeka soruları sorarken karmaşık hukuk terimleri kullanır mı?',
      a: 'Hayır. Platformumuz "Müşterek çocuk", "Tefrik", "İkame etmek" gibi kafa karıştıran terimleri tamamen yasaklamıştır. Tüm sorular "Ortak çocuk", "Bakım parası", "Eş geçim desteği" gibi net ve anlaşılır günlük Türkçe ifadelerle sorulur.',
    },
    {
      q: 'Nafaka artırımı için hangi sebepleri sunabilirim?',
      a: 'Çocuğun yaşının büyümesi (okula başlaması, lise/üniversite masrafları), yüksek enflasyon, alım gücünün düşmesi, çocuğun sağlık masrafları veya karşı tarafın gelirinin artması gibi somut nedenlerle artırım talep edebilirsiniz.',
    },
    {
      q: '6284 Sayılı Koruma ve Uzaklaştırma kararı için harç ödenir mi?',
      a: 'Hayır. 6284 sayılı Kanun kapsamında verilen koruma, uzaklaştırma ve adres gizleme kararı başvuruları her türlü harç ve vergiden muaftır. Nöbetçi Aile Mahkemesi kararı hızla değerlendirir.',
    },
    {
      q: 'Hazırlanan dilekçe mahkemeye nasıl teslim edilir?',
      a: 'Dilekçe çıktısını alıp imzaladıktan sonra adliyenin "Hukuk Tevzi Bürosu"na teslim edebilir veya e-Devlet (UYAP Vatandaş Portalı) üzerinden elektronik imzanız ile sisteme yükleyebilirsiniz.',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl border border-blue-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Türkiye'nin Yapay Zeka Destekli Aile Mahkemesi Rehberi</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Aile Mahkemesi Dilekçenizi{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-sky-300">
              Anlaşılır & Adım Adım
            </span>{' '}
            Hazırlayın
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Ağır hukuk terimleri ve karmaşık kanun maddeleriyle uğraşmayın. Formu doldurun, yapay zeka asistanımızın durumunuza özel sorularını yanıtlayın; mahkeme standartlarında dilekçeniz ve yol haritanız saniyeler içinde hazır olsun.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {hasActiveProject && (
              <button
                onClick={onViewOutput ? onViewOutput : onNavigateWorkspace}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Hazırlanan Dilekçeme Git</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onStartForm()}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Yeni Dilekçe Başlat</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onStartDemo && (
              <button
                onClick={() => onStartDemo('anlaşmalı_boşanma')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 backdrop-blur-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Örnek Akışı Çalıştır (Hızlı Demo)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            3 Adımda Mahkeme Dilekçeniz Nasıl Hazırlanır?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Gelişmiş yapay zeka rehberlik motoru durumunuzu analiz eder, eksik kalan noktaları sorar ve mahkemeye sunuma hazır taslak üretir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              Başlangıç Formunu Doldurun
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Taraf isimleri, yetkili mahkeme şehri, davanın türü (Boşanma, Nafaka, Velayet, Uzaklaştırma vb.) ve olay özetinizi girin.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              Soru-Cevap Akışını Tamamlayın
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yapay zeka asistanı sadece durumunuza özgü eksik soruları teker teker sorar. Kafa karıştırıcı detaylar yoktur.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
              Resmi Dilekçe & Adım Adım Rehber
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Resmi formatta yazılan dilekçe metnini indirin, kritik onay alanlarını denetleyin ve adliyeye teslim adımlarını öğrenin.
            </p>
          </div>
        </div>
      </section>

      {/* COURT CATEGORIES GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Aile Mahkemesi Başvuru & Dilekçe Türleri
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Başlatmak istediğiniz mahkeme konusunu seçerek hemen formu doldurabilirsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <button
                  onClick={() => onStartForm(cat.id)}
                  className="w-full py-2 bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Dilekçe Başlat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEGAL & PROCEDURAL GUIDANCE SECTION */}
      <section id="guide-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Aile Mahkemesi Süreç ve Haklar Rehberi
              </h2>
              <p className="text-xs text-gray-400">
                Mahkemeye başvurmadan önce bilmeniz gereken temel kurallar ve haklarınız
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" /> Dava Süreleri Ne Kadardır?
              </h3>
              <p className="leading-relaxed text-gray-300">
                Anlaşmalı boşanma davaları genellikle 1-3 hafta içinde tek celsede sonuçlanır. Çekişmeli davalar ve mal paylaşımı davaları ise delil toplanması ve tanık dinlenmesi nedeniyle daha uzun sürebilir.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" /> Bakım Parası (Nafaka) Hakları
              </h3>
              <p className="leading-relaxed text-gray-300">
                Çocuk için ödenen iştirak nafakası velayet sahibi ebeveyne ödenir. Boşanma yüzünden yoksulluğa düşecek kusursuz veya daha az kusurlu eş için yoksulluk nafakası talep edilebilir.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> 6284 Şiddet Korunma Tedbiri
              </h3>
              <p className="leading-relaxed text-gray-300">
                Fiziksel, psikolojik, ekonomik veya sözlü şiddete maruz kalan şahıslar için harçsız olarak derhal 6284 uzaklaştırma ve koruma kararı çıkarılır. Polis ve kolluk kararı derhal uygular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Merak Edilenler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Aile Mahkemesi ve arzuhalci platformumuz hakkında en çok sorulan sorular
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA CARD */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-extrabold text-white">
              Dilekçenizi Şimdi Hazırlamaya Başlayın
            </h3>
            <p className="text-xs text-blue-100 max-w-md">
              Formu doldurarak dakikalar içinde kişiselleştirilmiş mahkeme metninizi ve adliye yol haritanızı oluşturun.
            </p>
          </div>
          <button
            onClick={() => onStartForm()}
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95"
          >
            Formu Aç & Başla
          </button>
        </div>
      </section>
    </div>
  );
};
