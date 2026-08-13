export type DeclarationStatus = 
  | 'DRAFT'           // Taslak
  | 'ACTIVE'          // Aktif (Açık - İBKB Bekliyor)
  | 'PARTIAL'         // Kısmi Kapalı
  | 'CLOSED'          // Tam Kapalı
  | 'OVERDUE'         // Yasal Süre Aşıldı (Cezai Risk)
  | 'EXTENDED'        // Ek Süre Alındı (+90 Gün)
  | 'WAIVED';         // Terkin / Muafiyet Uygulandı

export type RiskLevel = 
  | 'SAFE'            // Güvenli (>45 Gün)
  | 'WARNING'         // Uyarı (16-45 Gün)
  | 'CRITICAL'        // Kritik Alarm (1-15 Gün)
  | 'OVERDUE'         // Yasal Süresi Doldu (<0 Gün)
  | 'CLOSED';         // Kapalı / Arşivlenmiş

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'RUB' | 'TRY';

export type PaymentMethod = 
  | 'PESIN'           // Peşin Ödeme
  | 'MAL_MUKABILI'    // Mal Mukabili
  | 'VESAIK_MUKABILI' // Vesaik Mukabili
  | 'AKREDITIF'       // Akreditifli
  | 'KABUL_KREDILI';  // Kabul Kredili

export type Incoterm = 'FOB' | 'CIF' | 'EXW' | 'CFR' | 'DDP' | 'FCA' | 'CPT';

export interface IBKBRecord {
  id: string;
  declarationId: string;
  ibkbNo: string;
  bankName: string;
  bankBranch?: string;
  documentDate: string; // YYYY-MM-DD
  currency: Currency;
  amount: number;
  convertedAmountInDeclarationCurrency: number;
  exchangeRate: number; // Cur to TRY or Parity
  tcmbSoldAmount: number; // TCMB'ye satılan TL/Döviz tutarı (%30-%40)
  tcmbSaleRateUsed: number; // e.g., 30 or 40
  notes?: string;
  createdAt: string;
}

export interface Declaration {
  id: string;
  declarationNo: string; // 16 haneli (örn: 24340100EX001842)
  registrationDate: string; // Tescil Tarihi
  closingDate: string; // Fiili İhracat / İntaç Tarihi (180 Gün Başlangıcı)
  deadlineDate: string; // Başlangıç + 180 Gün
  hasExtension: boolean; // 90 Gün Ek Süre Alındı mı?
  extensionDate?: string; // Ek Süre Alınma Tarihi
  extensionDeadline?: string; // Başlangıç + 270 Gün
  exporterTitle: string;
  exporterTaxNo: string;
  importerTitle: string;
  destinationCountry: string;
  customsOffice: string;
  paymentMethod: PaymentMethod;
  incoterm: Incoterm;
  currency: Currency;
  amount: number; // FOB Tutar
  closedAmount: number; // İBKB ile kapatılan tutar
  remainingAmount: number; // Açık Tutar
  terkinAmount?: number; // Terkin edilen tutar
  exchangeRateToTRY: number;
  tcmbMandatorySaleRate: number; // %30, %40 vb.
  tcmbMandatoryAmount: number; // Zaten TL'ye çevrilmesi gereken tutar
  tcmbSoldAmount: number; // Gerçekleşen TCMB Satış Tutarı
  invoiceNo?: string; // Fatura No (Örn: FT-2026-10293)
  dovizAccountNo?: string; // Gelen Bedel Döviz IBAN
  tlAccountNo?: string; // TL IBAN
  signerName?: string; // Yetkili İmza Ad Soyad
  signerTitle?: string; // Yetkili Unvanı
  status: DeclarationStatus;
  riskLevel: RiskLevel;
  daysLeft: number;
  notes?: string;
  attachedFilesCount?: number;
  ibkbRecords: IBKBRecord[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface AuditNotification {
  id: string;
  declarationId?: string;
  declarationNo?: string;
  type: NotificationType;
  code: string;
  title: string;
  message: string;
  recommendation: string;
  quickActionType?: 'VIEW' | 'ADD_IBKB' | 'REQUEST_EXTENSION' | 'APPLY_TERKIN' | 'FIX_FORMAT' | 'TCMB_SALE';
  timestamp: string;
  isRead: boolean;
  category: 'LEGAL_DEADLINE' | 'FORMAT_CHECK' | 'BALANCE_MISMATCH' | 'TCMB_COMPLIANCE' | 'DOCUMENT_EXPIRED';
}

export interface AuditLog {
  id: string;
  declarationNo: string;
  userRole: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  userRole: 'ADMIN' | 'EXPORT_SPECIALIST' | 'ACCOUNTANT' | 'AUDITOR';
  userName: string;
  companyName: string;
  pinRequired: boolean;
}

export interface SystemStats {
  totalDeclarations: number;
  totalExportVolumeUSD: number;
  openAmountUSD: number;
  closedAmountUSD: number;
  criticalAlarmCount: number;
  warningAlarmCount: number;
  overdueCount: number;
  terkinEligibleCount: number;
  complianceScorePercent: number;
}
