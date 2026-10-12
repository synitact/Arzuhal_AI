import React, { useState, useEffect } from 'react';
import { InitialFormData, DavaTuru } from '../types';
import { Scale, User, FileText, MapPin, Send, X } from 'lucide-react';

interface InitialFormModalProps {
  onSubmit: (formData: InitialFormData) => void;
  onClose?: () => void;
  initialDavaTuru?: DavaTuru;
}

export const InitialFormModal: React.FC<InitialFormModalProps> = ({
  onSubmit,
  onClose,
  initialDavaTuru,
}) => {
  const [davaciAdi, setDavaciAdi] = useState('');
  const [davaciTC, setDavaciTC] = useState('');
  const [davaciAdres, setDavaciAdres] = useState('');
  const [davaliAdi, setDavaliAdi] = useState('');
  const [davaliTC, setDavaliTC] = useState('');
  const [davaliAdres, setDavaliAdres] = useState('');
  const [sehir, setSehir] = useState('');
  const [davaTuru, setDavaTuru] = useState<DavaTuru>(initialDavaTuru || 'anlaşmalı_boşanma');
  const [olayOzeti, setOlayOzeti] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialDavaTuru) {
      setDavaTuru(initialDavaTuru);
    }
  }, [initialDavaTuru]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!davaciAdi.trim()) newErrors.davaciAdi = 'Davacı adı soyadı gereklidir.';
    if (!davaliAdi.trim()) newErrors.davaliAdi = 'Karşı taraf adı soyadı gereklidir.';
    if (!sehir.trim()) newErrors.sehir = 'Şehir alanı gereklidir.';
    if (!olayOzeti.trim()) newErrors.olayOzeti = 'Konunun / olayın kısa özeti gereklidir.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      davaciAdi,
      davaciTC,
      davaciAdres,
      davaliAdi,
      davaliTC,
      davaliAdres,
      sehir,
      davaTuru,
      olayOzeti,
    });
  };

  const loadScenario = (scenario: 'anlasmali' | 'nafaka' | 'koruma' | 'cekismeli') => {
    if (scenario === 'anlasmali') {
      setDavaciAdi('Ayşe Yılmaz');
      setDavaciTC('12345678901');
      setDavaciAdres('Atatürk Mah. Gül Sok. No:14 Kadıköy / İstanbul');
      setDavaliAdi('Ahmet Yılmaz');
      setDavaliTC('98765432109');
      setDavaliAdres('Bağdat Cad. No:88 Kadıköy / İstanbul');
      setSehir('İstanbul');
      setDavaTuru('anlaşmalı_boşanma');
      setOlayOzeti('Eşimle 4 yıldır evliyiz. Karşılıklı uzlaşarak anlaşmalı boşanmaya karar verdik. 5 yaşında ortak çocuğumuz var; velayet anneye kalacak ve baba çocuk için aylık 7.500 TL bakım parası ödeyecektir.');
    } else if (scenario === 'nafaka') {
      setDavaciAdi('Zeynep Kaya');
      setDavaciTC('23456789012');
      setDavaciAdres('Çankaya Mah. Barış Cad. No:5 Çankaya / Ankara');
      setDavaliAdi('Murat Kaya');
      setDavaliTC('87654321098');
      setDavaliAdres('Kızılay Mah. No:10 Ankara');
      setSehir('Ankara');
      setDavaTuru('nafaka_artirimi_uyarlamasi');
      setOlayOzeti('2 yıl önce bağlanan 1.500 TL iştirak nafakası, çocuğun liseye başlaması, yüksek enflasyon ve servis masrafları nedeniyle yetersiz kalmıştır. Aylık nafakanın 8.500 TL ye artırılmasını ve uyarlanmasını talep ediyorum.');
    } else if (scenario === 'koruma') {
      setDavaciAdi('Fatma Demir');
      setDavaciTC('34567890123');
      setDavaciAdres('Karşıyaka Mah. 120 Sok. No:8 Karşıyaka / İzmir');
      setDavaliAdi('Ali Demir');
      setDavaliTC('76543210987');
      setDavaliAdres('Bornova / İzmir');
      setSehir('İzmir');
      setDavaTuru('koruma_uzaklastirma_6284');
      setOlayOzeti('Eşim sürekli fiziksel şiddet ve tehdit uygulamakta, can güvenliğim tehlike altındadır. 6284 Sayılı Kanun gereğince ev ve işyerine 6 ay süreyle yaklaşmama ve koruma tedbiri verilmesini talep ediyorum.');
    } else if (scenario === 'cekismeli') {
      setDavaciAdi('Elif Çelik');
      setDavaciTC('45678901234');
      setDavaciAdres('Muratpaşa Mah. No:22 Muratpaşa / Antalya');
      setDavaliAdi('Emre Çelik');
      setDavaliTC('65432109876');
      setDavaliAdres('Konyaaltı / Antalya');
      setSehir('Antalya');
      setDavaTuru('çekişmeli_boşanma');
      setOlayOzeti('Eşimin ağır kusurlu tutumları, hakaret ve evi terk etmesi sebebiyle evlilik birliği temelinden sarsılmıştır. Boşanma, ortak çocuğun velayeti, nafaka ve 150.000 TL manevi tazminat talep ediyorum.');
    }
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                Aile Mahkemesi Başlangıç Bilgi Formu
              </h2>
              <p className="text-xs text-gray-500">
                Dilekçe taslağınızı oluşturmak için temel tarafları ve dava konusunu giriniz.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Scenario Pre-fill Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-100 p-3 sm:px-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              ⚡ Hızlı Test İçin Örnek Senaryo Seçin:
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Tek tıkla formu doldurur</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => loadScenario('anlasmali')}
              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              🤝 Anlaşmalı Boşanma
            </button>
            <button
              type="button"
              onClick={() => loadScenario('nafaka')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              📈 Nafaka Artırımı
            </button>
            <button
              type="button"
              onClick={() => loadScenario('koruma')}
              className="px-2.5 py-1 bg-white hover:bg-rose-100/60 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              🛡️ 6284 Koruma / Uzaklaştırma
            </button>
            <button
              type="button"
              onClick={() => loadScenario('cekismeli')}
              className="px-2.5 py-1 bg-white hover:bg-indigo-100/60 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              ⚖️ Çekişmeli Boşanma
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Davacı (Siz) Bilgileri */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <User className="w-4 h-4 text-blue-600" /> Davacı (Siz) Bilgileri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adınız Soyadınız <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={davaciAdi}
                  onChange={(e) => setDavaciAdi(e.target.value)}
                  placeholder="Örn: Ayşe Yılmaz"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
                {errors.davaciAdi && <p className="text-[11px] text-rose-500 mt-1">{errors.davaciAdi}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  T.C. Kimlik No <span className="text-gray-400 font-normal">(İsteğe Bağlı)</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={davaciTC}
                  onChange={(e) => setDavaciTC(e.target.value)}
                  placeholder="11 haneli T.C. Kimlik No"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                İkamet Adresiniz <span className="text-gray-400 font-normal">(Dilekçede yer alır)</span>
              </label>
              <input
                type="text"
                value={davaciAdres}
                onChange={(e) => setDavaciAdres(e.target.value)}
                placeholder="Örn: Atatürk Mah. Karanfil Sok. No:5 Kadıköy/İstanbul"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 2: Davalı (Karşı Taraf) Bilgileri */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <User className="w-4 h-4 text-indigo-600" /> Davalı (Karşı Taraf) Bilgileri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Karşı Taraf Adı Soyadı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={davaliAdi}
                  onChange={(e) => setDavaliAdi(e.target.value)}
                  placeholder="Örn: Mehmet Yılmaz"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
                {errors.davaliAdi && <p className="text-[11px] text-rose-500 mt-1">{errors.davaliAdi}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Karşı Taraf T.C. No <span className="text-gray-400 font-normal">(Biliyorsanız)</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={davaliTC}
                  onChange={(e) => setDavaliTC(e.target.value)}
                  placeholder="Karşı Taraf T.C. No"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Karşı Taraf Adresi
              </label>
              <input
                type="text"
                value={davaliAdres}
                onChange={(e) => setDavaliAdres(e.target.value)}
                placeholder="Örn: Cumhuriyet Mah. Gül Sok. No:12 Çankaya/Ankara"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 3: Mahkeme Şehri & Konusu */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Dava Türü ve Şehir
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Yetkili Mahkeme Şehri <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sehir}
                  onChange={(e) => setSehir(e.target.value)}
                  placeholder="Örn: İstanbul, Ankara, İzmir..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
                {errors.sehir && <p className="text-[11px] text-rose-500 mt-1">{errors.sehir}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Aile Mahkemesi Dava Konusu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={davaTuru}
                  onChange={(e) => setDavaTuru(e.target.value as DavaTuru)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                >
                  <option value="anlaşmalı_boşanma">Anlaşmalı Boşanma Davası</option>
                  <option value="çekişmeli_boşanma">Çekişmeli Boşanma Davası</option>
                  <option value="nafaka_artirimi_uyarlamasi">İştirak / Yoksulluk Nafaka Artırımı & Uyarlama</option>
                  <option value="velayet_degisikligi">Velayetin Değiştirilmesi / Düzenlenmesi</option>
                  <option value="koruma_uzaklastirma_6284">6284 Aile İçi Şiddet Koruma ve Uzaklaştırma Talebi</option>
                  <option value="mal_ve_ziynet_paylasimi">Mal Rejimi & Ziynet Eşyası Davası</option>
                  <option value="soybagi_babalik">Soybağının Reddi / Tespiti ve Babalık Davası</option>
                  <option value="diger_aile_hukuku">Diğer Aile Hukuku Meselesi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Genel Olay Özeti */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <FileText className="w-4 h-4 text-purple-600" /> Konunun ve Olayların Özeti
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Yaşadığınız durumu, talebinizi ve sebepleri kısaca anlatın <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={olayOzeti}
                onChange={(e) => setOlayOzeti(e.target.value)}
                placeholder="Örn: 'Eşimle 4 yıldır evliyiz. Çocuk velayeti ve 5.000 TL nafaka konusunda anlaştık.' veya 'Bağlanan 1.500 TL iştirak nafakası çocuğun lise masraflarına yetmiyor, 6.000 TL'ye artırılmasını talep ediyorum.' veya 'Eşim evde sürekli şiddet ve tehdit uyguluyor, uzaklaştırma kararı istiyorum.'"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs sm:text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all leading-relaxed"
              />
              {errors.olayOzeti && <p className="text-[11px] text-rose-500 mt-1">{errors.olayOzeti}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                Vazgeç / İncele
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Süreç ve Soru-Cevap Rehberini Başlat</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
