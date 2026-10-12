export type PetitionFormat = 'resmi' | 'acklamali' | 'ozet';

export type DavaTuru =
  | 'anlaşmalı_boşanma'
  | 'çekişmeli_boşanma'
  | 'nafaka_artirimi_uyarlamasi'
  | 'velayet_degisikligi'
  | 'koruma_uzaklastirma_6284'
  | 'mal_ve_ziynet_paylasimi'
  | 'soybagi_babalik'
  | 'diger_aile_hukuku';

export interface InitialFormData {
  davaciAdi: string;
  davaciTC: string;
  davaciAdres: string;
  davaliAdi: string;
  davaliTC?: string;
  davaliAdres?: string;
  sehir: string;
  davaTuru: DavaTuru;
  olayOzeti: string;
}

export interface ProjectInfo {
  id: string;
  createdAt: string;
  davaciAdi: string;
  davaciTC: string;
  davaciAdres: string;
  davaliAdi: string;
  davaliTC?: string;
  davaliAdres?: string;
  sehir: string;
  mahkemeAdi: string;
  davaTuru: DavaTuru | 'belirsiz';
  olayOzeti: string;
  evlilikSuresiYil: number | null;
  ortakCocukSayisi: number;
  ortakCocukDetaylari: string;
  velayetTalebi: string;
  cocukBakimParasi: string; // İştirak nafakası karşılığı
  esBakimParasi: string; // Yoksulluk nafakası karşılığı
  maddiTazminat: string;
  maneviTazminat: string;
  malPaylasimi: string;
  korumaTalepleri?: string;
  bosanmaNedenleri: string[];
  deliller: string[];
  uyarilar: string[];
  formatPreference: PetitionFormat;
  isFormSubmitted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system_warning';
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

export interface CriticalField {
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface SectionAData {
  title: string;
  userNotice: string;
  criticalFields: CriticalField[];
}

export interface SectionBData {
  title: string;
  format: PetitionFormat;
  content: string;
}

export interface SectionCData {
  title: string;
  currentStatus: string;
  futureSteps: string[];
  recommendations: string[];
}

export interface PetitionOutput {
  sectionA: SectionAData;
  sectionB: SectionBData;
  sectionC: SectionCData;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CumulativeTokenUsage {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  apiCallCount: number;
  estimatedCostUSD: number;
  estimatedCostTRY: number;
}

export interface ChatApiResponse {
  botReply: string;
  updatedProjectInfo: ProjectInfo;
  questionCount: number;
  isCompleted: boolean;
  completionReason?: 'normal' | 'question_limit';
  petitionOutput?: PetitionOutput;
  systemWarning?: string;
  tokenUsage?: TokenUsage;
}

