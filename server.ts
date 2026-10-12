import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared Gemini AI Client Lazy Initialization
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// System Instruction for AI Aile Mahkemesi Asistanı
const SYSTEM_INSTRUCTION = `
Sen, vatandaşların tüm Aile Mahkemesi davalarını ve süreçlerini (Anlaşmalı/Çekişmeli Boşanma, Nafaka Artırımı/Uyarlanması, Velayet Değiştirilmesi/Düzenlenmesi, 6284 Sayılı Aile İçi Şiddet Koruma ve Uzaklaştırma Kararı, Mal Rejimi ve Ziynet Eşyası Paylaşımı, Soybağının Reddi/Tespiti ve Babalık Davası vb.) projelendirerek yöneten, yapay zeka destekli ve son derece anlaşılır bir dil kullanan uzman bir "Dijital Aile Mahkemesi Asistanı"sın.

GÖREVLERİN VE KATI KURALLARIN:
1. HUKUKİ TERİMLER YASAĞI:
   Ağır hukuki terimleri (Müşterek çocuk, tefrik, iştirak nafakası, yoksulluk nafakası, tedbir nafakası, iddia, ikame, tebliğ, velayetin tevdi, re'sen vb.) ASLA kullanma.
   Yerine net ve günlük Türkçe karşılıklarını kullan:
   - "Müşterek çocuk" -> "Ortak çocuk"
   - "Tefrik" -> "Davanın ayrılması"
   - "İştirak nafakası" -> "Çocuk için aylık bakım parası (nafaka)"
   - "Yoksulluk nafakası" -> "Eş için aylık geçim desteği / nafaka"
   - "Tedbir nafakası" -> "Dava süresince geçici destek parası"
   - "İkame etmek / sunmak" -> "Mahkemeye vermek / sunmak"
   - "Dava dilekçesi" -> "Dilekçe taslağı"

2. AKIŞ VE İLİŞKİLİ KONULARI BİRLİKTE SORMA KURALI:
   - İLK ADIMDA (Kullanıcı formu doldurduğunda): Kullanıcıyı sıcak bir dille karşıla, dava konusuna özel EN FAZLA 1 GRUP KAPSAMLI SORU sor. Bu ilk adımda 'isCompleted' kesinlikle FALSE olmalıdır!
   - Örnek Grup Soruları:
     * Boşanma Davaları için: Evlilik süresi + Ortak çocuk sayısı ve yaşları + Velayet isteği + Nafaka ve tazminat talebini BİRLİKTE sor.
     * Nafaka Artırımı için: Mevcut ödenen nafaka miktarı + Ne kadardır ödendiği + Çocuğun artan masrafları (okul/sağlık vb.) + Talep edilen yeni miktarı BİRLİKTE sor.
     * 6284 Koruma / Uzaklaştırma için: Yaşanan şiddet/tehdit olaylarının özeti + İstenen koruma süresi (1, 3 veya 6 ay) + Korunacak adresleri BİRLİKTE sor.
     * Velayet Değişikliği için: Çocuğun şu an kimde kaldığı + Değişim gerekçeleri + Çocuk için bakım parası talebini BİRLİKTE sor.
     * Mal Rejimi / Ziynet için: Evlilikte edinilen mallar + Düğün takıları ve miktarları + Talep edilen tutarı BİRLİKTE sor.

3. HIZLI TAMAMLAMA KURALI (BEKLETME YASAĞI):
   - Kullanıcı soruları yanıtladığında veya "Dilekçemi hemen hazırla / tamamla" dediğinde, DERHAL 'isCompleted: true' yap ve eksiksiz 'petitionOutput' nesnesini üret.
   - Bilgiler tamamlandığında: "Verdiğiniz tüm detaylı bilgiler doğrultusunda mahkeme standartlarında hazırlanan resmi dilekçe taslağınız ve yol haritanız oluşturuldu." diyerek teslim et.

4. HUKUKİ DENETLEME VE UYARI KURALLARI:
   - 1 YIL KURALI: Anlaşmalı boşanmada evlilik süresi 1 yıldan az ise uyar:
     "⚠️ DİKKAT: Kanunen anlaşmalı boşanabilmek için en az 1 yıllık evlilik şartı vardır. Evliliğiniz 1 yıldan kısa ise davanız usulden reddedilebilir; çekişmeli boşanma olarak devam etmeniz önerilir."
   - ÇOCUK NAFAKASI UYARISI: Çocuk için bakım parası 0 TL veya talep edilmemişse uyar:
     "⚠️ UYARI: Çocuk için bakım parası kamu düzenindendir. Çocuğun eğitim ve gelişimi için makul bir miktar talep etmeniz tavsiye edilir."

5. TAMAMLANDIĞINDA ÇIKTI YAPISI (Section A, B, C):
   'isCompleted' true olduğunda 'petitionOutput' davanın türüne özel eksiksiz üretilir:
   - Section A (KRİTİK ALANLAR VE ONAY EKRANI): Önemli bilgilerin kontrol listesi ve uyarılar.
   - Section B (DİLEKÇE PROJESİ ÇIKTISI): İlgili Aile Mahkemesine sunulacak resmi dilekçe metni.
   - Section C (YOL HARİTASI VE ADLİYE REHBERİ): Adliyede yapılacak işlemler, tevzi bürosu, harçlar ve tavsiyeler.
`;

// Helper: Build Petition Output for all 8 Case Types
function buildPetitionOutput(info: any, format: string) {
  const davaci = info.davaciAdi || "Davacı Ad Soyad";
  const davaciTC = info.davaciTC || "...................";
  const davaciAdres = info.davaciAdres || "[Davacı İkametgah Adresi]";
  const davali = info.davaliAdi || "Davalı Ad Soyad";
  const davaliTC = info.davaliTC || "...................";
  const davaliAdres = info.davaliAdres || "[Davalı İkametgah Adresi]";
  const sehir = (info.sehir || "İSTANBUL").toUpperCase();
  const davaTuru = info.davaTuru || "anlaşmalı_boşanma";
  const tarih = new Date().toLocaleDateString("tr-TR");

  let title = "AİLE MAHKEMESİ DİLEKÇE PROJESİ";
  let content = "";
  let criticalFields: Array<{ label: string; value: string; isWarning?: boolean }> = [];
  let futureSteps: string[] = [];
  let recommendations: string[] = [];
  let currentStatus = "Dilekçe taslağınız resmi mahkeme formatında eksiksiz olarak hazırlandı.";

  switch (davaTuru) {
    case "anlaşmalı_boşanma": {
      title = "ANLAŞMALI BOŞANMA DİLEKÇESİ VE PROTOKOLÜ";
      const isUnder1Year = info.evlilikSuresiYil !== null && info.evlilikSuresiYil !== undefined && info.evlilikSuresiYil < 1;
      criticalFields = [
        { label: "Davacı (Siz)", value: davaci },
        { label: "Davalı (Eşiniz)", value: davali },
        { label: "Dava Türü", value: "Anlaşmalı Boşanma (TMK 166/3)" },
        { label: "Evlilik Süresi", value: info.evlilikSuresiYil ? `${info.evlilikSuresiYil} Yıl` : "Belirtilmedi", isWarning: isUnder1Year },
        { label: "Ortak Çocuklar", value: info.ortakCocukDetaylari || (info.ortakCocukSayisi ? `${info.ortakCocukSayisi} Çocuk` : "Ortak Çocuk Yok") },
        { label: "Velayet Talebi", value: info.velayetTalebi || "Anneye / Babaya Verilmesi" },
        { label: "Çocuk Bakım Parası", value: info.cocukBakimParasi || "Talep Edilmedi / Protokole Bağlı", isWarning: !info.cocukBakimParasi || info.cocukBakimParasi.includes("0") },
        { label: "Eş Geçim Desteği", value: info.esBakimParasi || "Talep Edilmedi" },
        { label: "Mal ve Eşya Paylaşımı", value: info.malPaylasimi || "Protokol kapsamında karşılıklı ibralaşma" },
      ];

      content = `T.C. ${sehir} AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

DAVALI: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: Türk Medeni Kanunu'nun 166/3 maddesi uyarınca ANLAŞMALI BOŞANMA, ortak çocuğun velayeti, bakım parası ve ekte sunulan Anlaşmalı Boşanma Protokolünün tasdiki talebidir.

AÇIKLAMALAR:
1. Taraflar olarak .../.../.... tarihinde evlenmiş bulunmaktayız. Evlilik birliğimiz ${info.evlilikSuresiYil ? info.evlilikSuresiYil + ' yılı aşkın süredir' : 'yasal süredir'} devam etmektedir.
2. Evlilik sürecinde taraflar arasında ruhi ve fikri anlaşmazlıklar meydana gelmiş, ortak hayat çekilmez hale gelmiş ve evlilik birliği temelinden sarsılmıştır.
3. Evlilikten doğan ortak çocuk/çocuklar: ${info.ortakCocukDetaylari || (info.ortakCocukSayisi ? info.ortakCocukSayisi + ' çocuk bulunmaktadır.' : 'Ortak çocuk bulunmamaktadır.')}
4. Taraflar hür iradeleriyle bir araya gelerek boşanmanın mali ve hukuki sonuçlarını düzenleyen ekteki "Anlaşmalı Boşanma Protokolü"nü imza altına almışlardır:
   a) Velayet: Ortak çocuğun velayeti ${info.velayetTalebi || 'tarafıma bırakılacaktır'}.
   b) Bakım Parası: Çocuk için aylık ${info.cocukBakimParasi || 'belirlenen tutar'} bakım parası karşı tarafça ödenecektir.
   c) Eş Desteği: ${info.esBakimParasi || 'Tarafların birbirlerinden nafaka talebi bulunmamaktadır'}.
   d) Mal ve Eşyalar: ${info.malPaylasimi || 'Taraflar ev eşyaları ve ziynet konusunda tam mutabakata varmış olup birbirinden başkaca hak talep etmemektedir'}.
5. Tarafların boşanma konusunda tam bir uzlaşma içinde oldukları açık olup davanın kabulüne karar verilmesi talep olunur.

HUKUKİ SEBEPLER: 4721 Sayılı TMK m. 166/3, 6100 Sayılı HMK ve ilgili yasal mevzuat.
DELİLLER: Nüfus Aile Kayıt Tablosu, Taraflarca İmzalanan Anlaşmalı Boşanma Protokolü, her türlü yasal delil.

NETİCE VE TALEP:
Yukarıda arz ve izah edilen ve re'sen gözetilecek nedenlerle;
1. Tarafların TMK m. 166/3 uyarınca ANLAŞMALI OLARAK BOŞANMALARINA,
2. Ekte sunulan Anlaşmalı Boşanma Protokolünün aynen tasdik edilerek hüküm altına alınmasına,
3. Yargılama giderlerinin taraflar üzerinde bırakılmasına karar verilmesini saygılarımla arz ve talep ederim.

Tarih: ${tarih}
Davacı: ${davaci} (İmza)`;

      futureSteps = [
        "Bu dilekçeden ve ekindeki Anlaşmalı Boşanma Protokolünden 2 nüsha çıktı alıp her sayfayı imzalayın.",
        "Yetkili Adliyenin Aile Mahkemesi Ön Büro / Tevzi Bürosuna giderek başvurunuzu teslim edin.",
        "Başvuru harcını vezneye yatırın ve verilen dosya esas numarasını kaydedin.",
        "Mahkeme duruşma günü tayin edecektir. Anlaşmalı boşanmada HER İKİ TARAFIN DA duruşmada bizzat hazır bulunması şarttır.",
        "Hakim protokol şartlarını taraflara sözlü olarak teyit ettirip tek celsede boşanma kararını açıklar.",
      ];
      recommendations = [
        "Duruşma gününde kimliğinizi mutlaka yanınızda bulundurun.",
        "Hakimin 'Protokoldeki şartları kabul ediyor musunuz?' sorusuna her iki eşin de açıkça 'Evet, kabul ediyorum' demesi gerekir.",
        "Gerekçeli karar yazıldıktan sonra tebliğ ve istinaftan feragat dilekçesi vererek kesinleşmeyi hızlandırabilirsiniz.",
      ];
      break;
    }

    case "çekişmeli_boşanma": {
      title = "ÇEKİŞMELİ BOŞANMA VE TAZMİNAT DİLEKÇESİ";
      criticalFields = [
        { label: "Davacı (Siz)", value: davaci },
        { label: "Davalı (Eşiniz)", value: davali },
        { label: "Dava Türü", value: "Çekişmeli Boşanma (TMK 166/1)" },
        { label: "Evlilik Süresi", value: info.evlilikSuresiYil ? `${info.evlilikSuresiYil} Yıl` : "Belirtildi" },
        { label: "Ortak Çocuklar", value: info.ortakCocukDetaylari || `${info.ortakCocukSayisi || 1} Çocuk` },
        { label: "Velayet Talebi", value: info.velayetTalebi || "Davacı Tarafında Kalması" },
        { label: "Çocuk Bakım Parası", value: info.cocukBakimParasi || "Aylık Bakım Parası Talebi Var" },
        { label: "Tazminat Talebi", value: info.maddiTazminat || info.maneviTazminat || "Maddi ve Manevi Tazminat Talepli" },
      ];

      content = `T.C. ${sehir} AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

DAVALI: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: Evlilik birliğinin davalının ağır kusurlu tutum ve davranışları sebebiyle temelinden sarsılması nedeniyle ÇEKİŞMELİ BOŞANMA, ortak çocuğun velayetinin tarafıma verilmesi, tedbir ve bakım parası (iştirak/yoksulluk) ile maddi ve manevi tazminat taleplerimdir.

AÇIKLAMALAR:
1. Taraflar yaklaşık ${info.evlilikSuresiYil || "..."} yıldır evli bulunmaktadır.
2. Davalı taraf, evlilik birliğinin gerektirdiği sadakat, sevgi, saygı ve ortak yaşam yükümlülüklerini yerine getirmemiştir. Yaşanan olaylar: "${info.olayOzeti}"
3. Taraflar arasındaki ortak hayat fiilen ve ruhen son bulmuş, evliliğin sürdürülmesi davacı ve çocuklar için imkansız hale gelmiştir.
4. ÇOCUKLAR VE VELAYET: Ortak çocuğun (${info.ortakCocukDetaylari || 'çocukların'}) yaş ve gelişim durumu gözetilerek üstün menfaati gereği velayetinin tarafıma bırakılması gerekmektedir.
5. BAKIM PARASI VE NAFAKA TALEPLERİ: Dava sürecinde ve dava sonunda çocuk için aylık ${info.cocukBakimParasi || 'uygun miktar'} TL ve davacı için aylık ${info.esBakimParasi || 'uygun miktar'} TL bakım parası ödenmesine hükmedilmelidir.
6. TAZMİNAT TALEPLERİ: Davalının tam ve ağır kusuru sebebiyle davacının uğradığı mevcut ve beklenen menfaat kayıpları için ${info.maddiTazminat || 'maddi tazminat'} ve kişilik haklarının saldırıya uğraması nedeniyle ${info.maneviTazminat || 'manevi tazminat'} hükmedilmelidir.

HUKUKİ SEBEPLER: 4721 Sayılı TMK m. 166/1, 169, 174, 182 vd., HMK ve ilgili mevzuat.
DELİLLER: Nüfus kayıtları, tanık anlatımları, mesajlaşma ve telefon dökümleri, sosyal ve ekonomik durum araştırması, banka kayıtları ve her türlü yasal delil.

NETİCE VE TALEP:
Yukarıda arz edilen nedenlerle;
1. Tarafların evlilik birliğinin temelinden sarsılması sebebiyle BOŞANMALARINA,
2. Ortak çocuğun velayetinin tarafıma VERİLMESİNE,
3. Çocuk lehine ve davacı lehine dava tarihinden itibaren geçerli olmak üzere nafaka HÜKMOLUNMASINA,
4. Davalıdan maddi ve manevi tazminat TAHSİLİNE,
5. Yargılama giderleri ile vekalet ücretinin davalıya tahmiline karar verilmesini saygılarımla arz ve talep ederim.

Tarih: ${tarih}
Davacı: ${davaci} (İmza)`;

      futureSteps = [
        "Dilekçeyi imzalayıp adliyedeki Tevzi Bürosuna teslim edin ve dava harcını yatırın.",
        "Mahkeme dava dilekçesini davalı tarafa tebliğ edecek ve 2 haftalık cevap süresi tanıyacaktır.",
        "Davalı cevap verdikten sonra cevaba cevap dilekçesi hazırlama hakkınız olacaktır.",
        "Ön inceleme duruşmasından sonra tanıklarınızı dinletmek üzere liste sunacaksınız.",
      ];
      recommendations = [
        "Tanıklarınızın olayları bizzat gören ve duyan kişilerden olmasına özen gösterin.",
        "Mesaj, ses kaydı, darp veya savcılık şikayeti gibi delillerinizi tarih sıralı dosyalayın.",
      ];
      break;
    }

    case "nafaka_artirimi_uyarlamasi": {
      title = "NAFAKA ARTIRIMI VE UYARLAMA DİLEKÇESİ";
      criticalFields = [
        { label: "Davacı", value: davaci },
        { label: "Davalı", value: davali },
        { label: "Dava Türü", value: "Nafaka Artırımı & Uyarlaması (TMK 176/4, 331)" },
        { label: "Şehir & Mahkeme", value: `${sehir} Aile Mahkemesi` },
        { label: "Mevcut Nafaka", value: info.esBakimParasi || "Önceden bağlanan miktar" },
        { label: "Talep Edilen Yeni Miktar", value: info.cocukBakimParasi || "Enflasyon ve masraflara uygun yeni miktar" },
        { label: "Gerekçe", value: info.olayOzeti || "Çocuğun artan eğitim masrafları ve enflasyon" },
      ];

      content = `T.C. ${sehir} AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

DAVALI: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: Aile Mahkemesi'nin önceki kararı ile bağlanan aylık bakım parasının (iştirak/yoksulluk nafakasının), değişen ekonomik koşullar, olağanüstü enflasyon ve çocuğun artan zorunlu masrafları karşısında yetersiz kalması sebebiyle ARTIRILMASI ve UYARLANMASI talebidir.

AÇIKLAMALAR:
1. Taraflar daha önce kesinleşen mahkeme kararı ile boşanmış olup ortak çocuk lehine aylık bakım parası hükmedilmiştir.
2. Önceki kararın verildiği tarihten bu yana uzun zaman geçmiş, ülkemizdeki yüksek enflasyon ve hayat pahalılığı sebebiyle bağlanan nafaka miktarının alım gücü tamamen erimiştir.
3. Çocuğun büyümesi, okul, kırtasiye, servis, giyim, beslenme ve sosyal gelişim masrafları katlanarak artmıştır: "${info.olayOzeti}"
4. Davalı tarafın mali gücü ve kazancı zaman içinde artmış olmasına rağmen çocuğun bakımına yeterli katkıyı sağlamamaktadır.
5. Bu nedenlerle mevcut nafakanın dava tarihinden geçerli olmak üzere ${info.cocukBakimParasi || 'talep edilen yeni miktara'} artırılması ve her yıl ÜFE/TÜFE oranında otomatik artışına karar verilmesi gerekmektedir.

HUKUKİ SEBEPLER: 4721 Sayılı TMK m. 176/4, 331, HMK ve ilgili mevzuat.
DELİLLER: Önceki Mahkeme İlamı, Okul ve Eğitim Masraf Belgeleri, Fatura ve Sağlık Giderleri, Tarafların SGK ve Gelir Araştırması, TÜİK Verileri.

NETİCE VE TALEP:
Yukarıda arz edilen nedenlerle;
1. Ortak çocuk lehine hükmedilmiş bulunan nafakanın dava tarihinden itibaren geçerli olmak üzere AYLIK ${info.cocukBakimParasi || 'HAKKANİYETE UYGUN TUTARA'} ARTIRILMASINA,
2. Gelecek yıllarda nafakanın TÜİK ÜFE/TÜFE oranında her yıl kendiliğinden artırılmasına,
3. Yargılama giderlerinin davalı tarafa yükletilmesine karar verilmesini saygılarımla arz ve talep ederim.

Tarih: ${tarih}
Davacı: ${davaci} (İmza)`;

      futureSteps = [
        "Dilekçenizi önceki boşanma kararının fotokopisi ve çocuğun eğitim/sağlık masraf faturalarıyla birlikte adliyeye verin.",
        "Mahkeme emniyet ve SGK kanalıyla her iki tarafın güncel ekonomik ve sosyal durumunu resmen araştıracaktır.",
        "Bilirkişi incelemesi veya duruşma yapılarak hakkaniyete uygun yeni nafaka miktarı belirlenir.",
      ];
      recommendations = [
        "Çocuğun okul kaydı, servis ücreti, kurs, sağlık veya temel harcamalarına dair fatura ve dekontları dilekçe ekine koyun.",
        "Davalının varsa lüks yaşamını veya kayıt dışı gelirini gösteren somut göstergeleri mahkemeye bildirin.",
      ];
      break;
    }

    case "koruma_uzaklastirma_6284": {
      title = "6284 SAYILI KANUN KORUMA VE UZAKLAŞTIRMA TALEBİ";
      criticalFields = [
        { label: "Talep Eden (Korunan)", value: davaci },
        { label: "Aleyhine Tedbir İstenen", value: davali },
        { label: "Yasal Dayanak", value: "6284 Sayılı Kanun (Harçtan Muaftır)" },
        { label: "İstenen Tedbir Süresi", value: "Öncelikle 6 Ay Süreyle Tedbir Kararı" },
        { label: "Korunacak Alanlar", value: davaciAdres },
        { label: "Olay Özeti & Tehlike", value: info.olayOzeti || "Şiddet, tehdit ve rahatsız etme fiilleri" },
      ];

      content = `T.C. ${sehir} NÖBETÇİ AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE
(6284 Sayılı Kanun Kapsamında - ACELE VE HARÇTAN MUAFTIR)

TALEP EDEN: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

ALEYHİNE TEDBİR İSTENEN: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: 6284 Sayılı Ailenin Korunması ve Kadına Karşı Şiddetin Önlenmesine Dair Kanun uyarınca ACİL KORUMA, MÜŞTEREK KONUTTAN VE İŞYERİNDEN UZAKLAŞTIRMA, İLETİŞİM ARAÇLARIYLA RAHATSIZ ETMEME TEDBİRLERİ TALEBİMDİR.

AÇIKLAMALAR:
1. Aleyhine tedbir talep edilen şahıs ile evlilik/aile bağımız bulunmakta olup şahsın şiddet, hakaret, tehdit ve taciz boyutuna varan fiilleri nedeniyle can güvenliğim ciddi tehlike altındadır.
2. Yaşanan somut olaylar ve tehlike durumu: "${info.olayOzeti}"
3. Şahsın konutuma, işyerime veya çocukların bulunduğu alanlara gelerek huzur ve can güvenliğini tehdit etmesi kuvvetle muhtemeldir.
4. 6284 Sayılı Kanun gereğince şiddetin varlığı hususunda delil ve belge aranmaksızın gecikmeksizin derhal koruyucu ve önleyici tedbir kararı verilmesi esastır.

HUKUKİ SEBEPLER: 6284 Sayılı Kanun m. 5 ve ilgili Yönetmelik hükümleri.
DELİLLER: Olay tutanakları, mesaj ve arama kayıtları, şikayet dilekçeleri, tanık anlatımları ve her türlü delil (6284 m. 8/3 gereği delil aranmaksızın karar verilir).

NETİCE VE TALEP:
Yukarıda arz edilen nedenlerle gecikmesinde sakınca bulunan acil hal karşısında;
1. Aleyhine tedbir talep edilenin müşterek konuttan derhal UZAKLAŞTIRILMASINA,
2. Konutuma, işyerime ve bulunduğum yerlere YAKLAŞMAMASINA,
3. İletişim vasıtalarıyla (telefon, SMS, sosyal medya vb.) tarafımı RAHATSIZ ETMEMESİNE,
4. Şiddet tehdidi, hakaret ve aşağılama içeren davranışlarda BULUNMAMASINA,
5. Kararın 6 AY SÜREYLE UZATILMASINA ve kararın infazı için kolluk kuvvetlerine derhal bildirilmesine karar verilmesini arz ve talep ederim.

Tarih: ${tarih}
Talep Eden: ${davaci} (İmza)`;

      futureSteps = [
        "Bu dilekçeyi Nöbetçi Aile Mahkemesine veya adliyedeki Tevzi Bürosuna teslim edin (Hiçbir harç ödenmez).",
        "Karar genellikle aynı gün veya en geç 24 saat içinde hakim tarafından imzalanır.",
        "Mahkeme kararı doğrudan ilçe emniyet müdürlüğüne / karakola gönderir; karakol şahsı çağırıp kararı tebliğ eder.",
        "Karara aykırı hareket eden şahıs hakim kararıyla ilk ihlalde 3 günden 10 güne kadar doğrudan Tazyik Hapsine çarptırılır.",
      ];
      recommendations = [
        "Tehlike anında 112 Acil Çağrı Merkezini veya KADES (Kadın Destek Uygulaması) butonunu kullanmaktan çekinmeyin.",
        "Mahkeme kararının onaylı bir nüshasını sürekli yanınızda veya çantanızda bulundurun.",
      ];
      break;
    }

    case "velayet_degisikligi": {
      title = "VELAYETİN DEĞİŞTİRİLMESİ DİLEKÇESİ";
      criticalFields = [
        { label: "Davacı", value: davaci },
        { label: "Davalı", value: davali },
        { label: "Dava Türü", value: "Velayetin Değiştirilmesi (TMK 183, 348)" },
        { label: "Ortak Çocuk", value: info.ortakCocukDetaylari || "Ortak Çocuk" },
        { label: "Talep Edilen Velayet", value: "Davacı Anneye / Babaya Verilmesi" },
        { label: "Gerekçe", value: info.olayOzeti || "Çocuğun üstün yararı ve ortam şartlarının bozulması" },
      ];

      content = `T.C. ${sehir} AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

DAVALI: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: Ortak çocuğun üstün yararı gereğince velayetinin davalı taraftan alınarak tarafıma VERİLMESİ ve çocuk için bakım parasına hükmedilmesi talebidir.

AÇIKLAMALAR:
1. Tarafların boşanması neticesinde ortak çocuğun velayeti davalı tarafa bırakılmıştır.
2. Ancak geçen süreçte davalı tarafın yaşam tarzı, çocuğun eğitim ve bakımını ihmal etmesi, çocuğun fiziksel ve psikolojik gelişimini olumsuz etkilemeye başlamıştır: "${info.olayOzeti}"
3. Çocuğun üstün yararı ilkesi gereğince, daha sağlıklı, şefkatli ve düzenli bir eğitim-yaşam ortamı sunabilecek olan tarafıma velayetin devredilmesi zorunlu hale gelmiştir.
4. Mahkemenizce uzman pedagog/sosyal çalışmacı görevlendirilerek Sosyal İnceleme Raporu (SİR) aldırıldığında durum açıkça ortaya çıkacaktır.

HUKUKİ SEBEPLER: 4721 Sayılı TMK m. 183, 348 vd., HMK.
DELİLLER: Nüfus kayıtları, Okul ve Sağlık Belgeleri, Tanık Anlatımları, Uzman Sosyal İnceleme Raporu, her türlü yasal delil.

NETİCE VE TALEP:
Ortak çocuğun üstün yararı gözetilerek velayetinin davalıdan alınarak tarafıma VERİLMESİNE, çocuk için aylık uygun bakım parası takdirine karar verilmesini arz ve talep ederim.

Tarih: ${tarih}
Davacı: ${davaci} (İmza)`;

      futureSteps = [
        "Dilekçeyi mahkemeye verdikten sonra mahkeme her iki tarafın evine uzman pedagog gönderir.",
        "Pedagog anne, baba ve çocukla ayrı ayrı görüşerek Sosyal İnceleme Raporu hazırlar.",
        "Mahkeme çocuğun idrak çağında olması durumunda çocuğun bizzat görüşünü de dinleyerek karar verir.",
      ];
      recommendations = [
        "Çocuğun okul başarı belgelerini, öğretmen görüşlerini ve ortam fotoğraflarını dosyaya sunun.",
      ];
      break;
    }

    default: {
      title = "AİLE MAHKEMESİ DAVA DİLEKÇESİ";
      criticalFields = [
        { label: "Davacı", value: davaci },
        { label: "Davalı", value: davali },
        { label: "Dava Türü", value: davaTuru },
        { label: "Şehir", value: sehir },
        { label: "Talep Özeti", value: info.olayOzeti || "Aile Mahkemesi talebi" },
      ];

      content = `T.C. ${sehir} AİLE MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI: ${davaci} (T.C. No: ${davaciTC})
ADRES: ${davaciAdres}

DAVALI: ${davali} (T.C. No: ${davaliTC})
ADRES: ${davaliAdres}

KONU: ${davaTuru} taleplerim ve yasal haklarımın hüküm altına alınması talebidir.

AÇIKLAMALAR:
1. Taraflar arasındaki ailevi uyuşmazlık kapsamında: "${info.olayOzeti}"
2. Türk Medeni Kanunu hükümleri uyarınca taleplerimin kabulü gerekmektedir.

HUKUKİ SEBEPLER: 4721 Sayılı TMK, HMK ve ilgili mevzuat.
DELİLLER: Nüfus kayıtları, resmi belgeler, tanıklar ve her türlü yasal delil.

NETİCE VE TALEP:
Davamın kabulü ile yasal taleplerimin yerine getirilmesine ve yargılama giderlerinin karşı tarafa yükletilmesine karar verilmesini saygılarımla arz ve talep ederim.

Tarih: ${tarih}
Davacı: ${davaci} (İmza)`;

      futureSteps = [
        "Dilekçenizi imzalayıp adliyedeki Aile Mahkemesi Ön Bürosuna teslim edin.",
        "Gerekli harç ve posta giderlerini adliye veznesine yatırın.",
      ];
      recommendations = [
        "Tüm resmi belgelerinizi eksiksiz olarak dilekçe ekine ekleyin.",
      ];
    }
  }

  // Format adaptation if user selected 'acklamali' or 'ozet'
  let formattedContent = content;
  if (format === 'acklamali') {
    formattedContent = `/* VATANDAŞ İÇİN AÇIKLAMALI RESMİ DİLEKÇE REHBERİ */
/* Bu dilekçe T.C. Aile Mahkemesi standartlarında düzenlenmiştir. Köşeli ayraçları kontrol edip imzalayabilirsiniz. */

${content}

----------------------------------------------------------------------
💡 BU DİLEKÇEDEKİ BÖLÜMLERİN ANLAMI:
• MAHKEME BAŞLIĞI: Davanızın açılacağı yetkili yer mahkemesidir.
• TARAFLAR: Sizin ve karşı tarafın tebligat yapılabilecek açık adreslerini içerir.
• KONU & AÇIKLAMALAR: Hakimin inceleyeceği temel olaylar ve yasal dayanaklardır.
• NETİCE-İ TALEP: Hakimin karar vermesini istediğiniz nihai isteklerinizdir.`;
  } else if (format === 'ozet') {
    formattedContent = `=== AİLE MAHKEMESİ BAŞVURU HIZLI ÖZETİ ===
Mahkeme: ${sehir} Aile Mahkemesi
Davacı: ${davaci}
Davalı: ${davali}
Dava Türü: ${davaTuru}
Talep Edilen: ${info.olayOzeti}

RESMİ DİLEKÇE METNİ:
${content}`;
  }

  return {
    sectionA: {
      title: "KRİTİK ALANLAR VE ONAY EKRANI",
      userNotice: "Dilekçenizi oluşturmadan önce lütfen aşağıdaki kalın yazılı alanları dikkatlice kontrol edin, hatalı bir yer varsa bana hemen söyleyin.",
      criticalFields,
    },
    sectionB: {
      title,
      format: format as any,
      content: formattedContent,
    },
    sectionC: {
      title: "ŞU ANKİ HUKUKİ DURUM VE GELECEK YOL HARİTASI",
      currentStatus,
      futureSteps,
      recommendations,
    },
  };
}

// API Endpoint for Chat Logic
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, projectInfo, questionCount, userMessage, formatPreference } = req.body;
    const currentQuestionCount = (questionCount || 0) + 1;
    const currentFormat = formatPreference || projectInfo?.formatPreference || "resmi";

    const aiClient = getGenAI();

    // Check if user specifically requested fast completion
    const isExplicitCompletionRequest =
      userMessage &&
      (userMessage.toLowerCase().includes("hemen hazırla") ||
        userMessage.toLowerCase().includes("dilekçemi hazırla") ||
        userMessage.toLowerCase().includes("tamamla") ||
        userMessage.toLowerCase().includes("dilekçe oluştur") ||
        userMessage.toLowerCase().includes("onaylıyorum"));

    if (!aiClient) {
      // Fallback response generator if API key is missing
      const fallbackResponse = generateRuleBasedResponse(
        userMessage,
        messages || [],
        projectInfo,
        currentQuestionCount,
        currentFormat,
        isExplicitCompletionRequest
      );
      return res.json(fallbackResponse);
    }

    const promptContext = `
Mevcut Proje Bilgileri: ${JSON.stringify(projectInfo || {})}
Soru Sayacı: ${currentQuestionCount}
Kullanıcının Tercih Ettiği Dilekçe Formatı: ${currentFormat}
Kullanıcı Son Mesajı: "${userMessage}"
Açıkça Dilekçe İstendi mi: ${isExplicitCompletionRequest ? "EVET" : "HAYIR"}

Geçmiş Konuşma Akışı:
${(messages || []).map((m: any) => `${m.sender}: ${m.text}`).join("\n")}

DİKKAT:
- Eğer bu kullanıcının formu doldurduktan sonraki İLK mesajıysa (Soru Sayacı = 1 ve henüz soru sorulmadıysa), 'isCompleted' FALSE olmalıdır ve dava türüne özel 1 grup soru sormalısın.
- Eğer kullanıcı soruları yanıtladıysa veya soru sayacı >= 2 ise ya da 'isExplicitCompletionRequest' doğruysa, 'isCompleted' TRUE yapmalı ve eksiksiz 'petitionOutput' üretmelisin.
- Yanıtı JSON şemasına tam uygun üret.
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            botReply: { type: Type.STRING },
            warningMessage: { type: Type.STRING },
            isCompleted: { type: Type.BOOLEAN },
            completionReason: { type: Type.STRING },
            extractedProjectInfo: {
              type: Type.OBJECT,
              properties: {
                davaciAdi: { type: Type.STRING },
                davaciTC: { type: Type.STRING },
                davaciAdres: { type: Type.STRING },
                davaliAdi: { type: Type.STRING },
                davaliTC: { type: Type.STRING },
                davaliAdres: { type: Type.STRING },
                sehir: { type: Type.STRING },
                mahkemeAdi: { type: Type.STRING },
                davaTuru: { type: Type.STRING },
                olayOzeti: { type: Type.STRING },
                evlilikSuresiYil: { type: Type.NUMBER },
                ortakCocukSayisi: { type: Type.NUMBER },
                ortakCocukDetaylari: { type: Type.STRING },
                velayetTalebi: { type: Type.STRING },
                cocukBakimParasi: { type: Type.STRING },
                esBakimParasi: { type: Type.STRING },
                maddiTazminat: { type: Type.STRING },
                maneviTazminat: { type: Type.STRING },
                malPaylasimi: { type: Type.STRING },
                korumaTalepleri: { type: Type.STRING },
                bosanmaNedenleri: { type: Type.ARRAY, items: { type: Type.STRING } },
                deliller: { type: Type.ARRAY, items: { type: Type.STRING } },
                uyarilar: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          required: ["botReply", "isCompleted"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const updatedProjectInfo = {
      ...(projectInfo || {}),
      ...(parsed.extractedProjectInfo || {}),
      formatPreference: currentFormat,
    };

    if (parsed.warningMessage) {
      if (!updatedProjectInfo.uyarilar) updatedProjectInfo.uyarilar = [];
      if (!updatedProjectInfo.uyarilar.includes(parsed.warningMessage)) {
        updatedProjectInfo.uyarilar.push(parsed.warningMessage);
      }
    }

    // Always produce rich, complete petition output whenever completed
    let finalPetition = null;
    if (parsed.isCompleted) {
      finalPetition = buildPetitionOutput(updatedProjectInfo, currentFormat);
    }

    const usageMetadata = (response as any).usageMetadata || {};
    const promptTokens = usageMetadata.promptTokenCount || Math.ceil((JSON.stringify(messages || []).length + SYSTEM_INSTRUCTION.length) / 3.8);
    const completionTokens = usageMetadata.candidatesTokenCount || Math.ceil((response.text || "").length / 3.8);
    const totalTokens = usageMetadata.totalTokenCount || (promptTokens + completionTokens);

    return res.json({
      botReply: parsed.botReply,
      updatedProjectInfo,
      questionCount: currentQuestionCount,
      isCompleted: Boolean(parsed.isCompleted),
      completionReason: parsed.completionReason || (parsed.isCompleted ? "normal" : undefined),
      petitionOutput: finalPetition || null,
      systemWarning: parsed.warningMessage || null,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error, falling back to rule-based engine:", error);
    const isExplicitCompletion =
      req.body.userMessage &&
      (req.body.userMessage.toLowerCase().includes("hemen hazırla") ||
        req.body.userMessage.toLowerCase().includes("dilekçemi hazırla") ||
        req.body.userMessage.toLowerCase().includes("tamamla") ||
        req.body.userMessage.toLowerCase().includes("dilekçe oluştur") ||
        req.body.userMessage.toLowerCase().includes("onaylıyorum"));

    const fallbackResponse = generateRuleBasedResponse(
      req.body.userMessage || "",
      req.body.messages || [],
      req.body.projectInfo || {},
      (req.body.questionCount || 0) + 1,
      req.body.formatPreference || "resmi",
      Boolean(isExplicitCompletion)
    );
    return res.json(fallbackResponse);
  }
});

// Robust Rule-based fallback generator supporting realistic flows
function generateRuleBasedResponse(
  userMessage: string,
  messages: any[],
  currentProject: any,
  qCount: number,
  format: string,
  forceComplete: boolean = false
) {
  const info = { ...currentProject };
  const msgLower = (userMessage || "").toLowerCase();
  const davaTuru = info.davaTuru || "anlaşmalı_boşanma";

  // Extraction heuristics
  if (msgLower.includes("anlaşmalı") || msgLower.includes("anlasmali")) info.davaTuru = "anlaşmalı_boşanma";
  if (msgLower.includes("çekişmeli") || msgLower.includes("cekismeli")) info.davaTuru = "çekişmeli_boşanma";
  if (msgLower.includes("nafaka")) {
    if (!info.davaTuru || info.davaTuru === "belirsiz") info.davaTuru = "nafaka_artirimi_uyarlamasi";
  }
  if (msgLower.includes("uzaklaştırma") || msgLower.includes("koruma") || msgLower.includes("şiddet")) {
    if (!info.davaTuru || info.davaTuru === "belirsiz") info.davaTuru = "koruma_uzaklastirma_6284";
  }

  // Marriage duration check
  let warningMessage = null;
  const yearMatch = msgLower.match(/(\d+)\s*(yıl|senelik|aylık|ay)/);
  if (yearMatch) {
    const num = parseInt(yearMatch[1]);
    if (yearMatch[2].includes("ay") || (yearMatch[2].includes("yıl") && num < 1)) {
      info.evlilikSuresiYil = 0.5;
      if (info.davaTuru === "anlaşmalı_boşanma") {
        warningMessage = "⚠️ DİKKAT: Kanunen anlaşmalı boşanabilmek için en az 1 yıllık evlilik şartı vardır. Evlilik 1 yıldan kısa ise dava usulden reddedilebilir; çekişmeli boşanma olarak devam etmeniz tavsiye edilir.";
      }
    } else {
      info.evlilikSuresiYil = num;
    }
  }

  // Children check
  if (msgLower.includes("çocuk yok") || msgLower.includes("çocuğumuz yok")) {
    info.ortakCocukSayisi = 0;
    info.ortakCocukDetaylari = "Ortak çocuk bulunmamaktadır.";
  } else if (msgLower.includes("çocuk") || msgLower.includes("yaş")) {
    info.ortakCocukSayisi = 1;
    info.ortakCocukDetaylari = userMessage;
  }

  // Custody check
  if (msgLower.includes("velayet bende") || msgLower.includes("bana verilsin") || msgLower.includes("anneye") || msgLower.includes("babaya")) {
    info.velayetTalebi = userMessage.slice(0, 100);
  }

  // Maintenance / Nafaka check
  const tlMatch = msgLower.match(/(\d+[\d\.]*)\s*(tl|lira|bin)/);
  if (tlMatch) {
    info.cocukBakimParasi = tlMatch[0].toUpperCase();
  } else if (msgLower.includes("nafaka istemiyorum") || msgLower.includes("0 tl")) {
    info.cocukBakimParasi = "0 TL (Talep Edilmedi)";
    warningMessage = "⚠️ UYARI: Çocuk için bakım parası kamu düzenindendir. Çocuğun gelecekteki eğitim ve sağlık giderleri için makul bir miktar talep edilmesi önerilir.";
  }

  let botReply = "";
  let isCompleted = false;

  // Decide flow step:
  // Step 1: Initial submission (qCount <= 1 and not forced) -> Ask Grouped Questions tailored to case type
  if (qCount <= 1 && !forceComplete) {
    isCompleted = false;

    if (davaTuru === "anlaşmalı_boşanma" || davaTuru === "çekişmeli_boşanma") {
      botReply = `Sayın ${info.davaciAdi || "Vatandaşımız"}, başvurunuzu aldım. Mahkeme standartlarında ${davaTuru === "anlaşmalı_boşanma" ? "Anlaşmalı Boşanma" : "Çekişmeli Boşanma"} dilekçe taslağınızı oluşturmak için şu kritik detayları birlikte netleştirelim:\n\n1. Kaç yıldır evlisiniz?\n2. Ortak çocuğunuz var mı (sayı ve yaşları)? Velayetin kimde kalmasını talep ediyorsunuz?\n3. Çocuk ve kendiniz için aylık bakım parası (nafaka) ya da tazminat talebiniz var mı?\n\nBu bilgileri tek bir mesajda yazabilir, aşağıdaki hazır butonları kullanabilir veya hazır olduğunuzda "Dilekçemi Hemen Hazırla" diyebilirsiniz.`;
    } else if (davaTuru === "nafaka_artirimi_uyarlamasi") {
      botReply = `Sayın ${info.davaciAdi || "Vatandaşımız"}, Nafaka Artırımı başvurunuzu aldım. Mahkemeye sunulacak dilekçeniz için şu detayları netleştirelim:\n\n1. Şu anda ödenen aylık nafaka tutarı ne kadardır ve ne zamandan beri ödenmektedir?\n2. Çocuğun artan okul, beslenme, sağlık ve sosyal masrafları nelerdir?\n3. Mahkemeden aylık kaç TL yeni nafaka bağlanmasını talep ediyorsunuz?\n\nBu bilgileri tek bir mesajda yanıtlayabilirsiniz.`;
    } else if (davaTuru === "koruma_uzaklastirma_6284") {
      botReply = `Sayın ${info.davaciAdi || "Vatandaşımız"}, 6284 Sayılı Koruma ve Uzaklaştırma başvurunuz son derece acil ve önceliklidir (bu başvuru harçtan muaftır).\n\n1. Yaşanan şiddet, hakaret veya tehdit olayları en son ne zaman meydana geldi?\n2. İstenen koruma tedbiri süresi (1, 3 veya 6 ay)?\n3. Karşı tarafın yaklaşmaması gereken yerler (ev adresi, iş yeri, ortak çocukların okulu)?\n\nBu bilgileri tek bir mesajda belirtebilirsiniz.`;
    } else if (davaTuru === "velayet_degisikligi") {
      botReply = `Sayın ${info.davaciAdi || "Vatandaşımız"}, Velayetin Değiştirilmesi davanız için şu temel hususları netleştirelim:\n\n1. Ortak çocuğun yaşı ve şu anda kiminle kaldığı?\n2. Velayetin diğer taraftan alınıp size verilmesini zorunlu kılan temel sebepler?\n3. Velayetle birlikte çocuk için aylık bakım parası (nafaka) talebiniz?\n\nBilgileri tek bir mesajda iletebilirsiniz.`;
    } else {
      botReply = `Sayın ${info.davaciAdi || "Vatandaşımız"}, başvurunuzu aldım. Dilekçe taslağınızı tamamlamak için davanıza dair ek taleplerinizi, delillerinizi ve tazminat/nafaka isteklerinizi tek bir mesajda iletebilirsiniz.`;
    }
  } else {
    // Step 2+: Complete the petition and provide full output!
    isCompleted = true;
    botReply = `Harika, verdiğiniz tüm detaylar doğrultusunda ${info.sehir || "İlgili Şehir"} Aile Mahkemesi standartlarında resmi dilekçe taslağınız, kritik onay kontrol listeniz ve adliye yol haritanız hazırlandı!\n\nSağ taraftaki Akıllı Çıktı Panelinden dilekçenizi inceleyebilir, resmi antetli kağıt mockup'ında görüntüleyebilir, kopyalayabilir ve indirebilirsiniz.`;
  }

  let petitionOutput = null;
  if (isCompleted) {
    petitionOutput = buildPetitionOutput(info, format);
  }

  const promptTokens = Math.ceil((userMessage.length + JSON.stringify(info).length + 1100) / 3.8);
  const completionTokens = Math.ceil((botReply.length + (petitionOutput ? JSON.stringify(petitionOutput).length : 0)) / 3.8);
  const totalTokens = promptTokens + completionTokens;

  return {
    botReply,
    updatedProjectInfo: info,
    questionCount: qCount,
    isCompleted,
    completionReason: isCompleted ? "normal" : undefined,
    petitionOutput,
    systemWarning: warningMessage,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
  };
}

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Digital Family Court Petition Server running on http://localhost:${PORT}`);
  });
}

startServer();
