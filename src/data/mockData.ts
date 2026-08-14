import { Declaration, AuditLog, UserSession } from '../types';
import { calculateDaysLeft, computeRiskLevel } from '../utils/exportCalculations';

const today = new Date();

function getDateStrDaysAgo(daysAgo: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const closing1 = getDateStrDaysAgo(165); // 15 days left
const closing2 = getDateStrDaysAgo(178); // 2 days left
const closing3 = getDateStrDaysAgo(90);  // 90 days left
const closing4 = getDateStrDaysAgo(23);  // 157 days left
const closing5 = getDateStrDaysAgo(214); // Extended (+90) -> 56 days left
const closing6 = getDateStrDaysAgo(223); // -43 days overdue

export const sampleDemoDeclarations: Declaration[] = [
  {
    id: 'dec-1',
    declarationNo: '24340100EX001842',
    registrationDate: '2026-02-28',
    closingDate: closing1,
    deadlineDate: '2026-08-28',
    hasExtension: false,
    exporterTitle: 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.',
    exporterTaxNo: '3960817425',
    importerTitle: 'BERLIN TRADING GMBH',
    destinationCountry: 'Almanya',
    customsOffice: 'Erenköy Gümrük Müdürlüğü',
    paymentMethod: 'MAL_MUKABILI',
    incoterm: 'FOB',
    currency: 'USD',
    amount: 120000.50,
    closedAmount: 70000.25,
    remainingAmount: 50000.25,
    exchangeRateToTRY: 33.45,
    tcmbMandatorySaleRate: 30,
    tcmbMandatoryAmount: 21000.08,
    tcmbSoldAmount: 21000.08,
    status: 'PARTIAL',
    riskLevel: computeRiskLevel(calculateDaysLeft(closing1, false), 'PARTIAL'),
    daysLeft: calculateDaysLeft(closing1, false),
    notes: 'Kalan 50.000,25 USD için alıcı banka havalesi beklenmektedir.',
    attachedFilesCount: 3,
    documents: [
      {
        id: 'doc-101',
        declarationId: 'dec-1',
        category: 'BEYANNAME_PDF',
        fileName: '24340100EX001842_Gumruk_Beyannamesi.pdf',
        fileSize: '1.8 MB',
        fileType: 'application/pdf',
        uploadDate: '28.02.2026',
        uploadedBy: 'Ahmet Yılmaz',
        notes: 'Onaylı E-Gümrük Beyannamesi Çıktısı'
      },
      {
        id: 'doc-102',
        declarationId: 'dec-1',
        category: 'INVOICE',
        fileName: 'FT-2026-10293_Export_Invoice.pdf',
        fileSize: '640 KB',
        fileType: 'application/pdf',
        uploadDate: '28.02.2026',
        uploadedBy: 'Ahmet Yılmaz',
        notes: 'Resmi E-İhracat Faturası (Berlin Trading GmbH)'
      },
      {
        id: 'doc-103',
        declarationId: 'dec-1',
        category: 'PACKING_LIST',
        fileName: 'Packing_List_Ceki_Listesi_2026.pdf',
        fileSize: '420 KB',
        fileType: 'application/pdf',
        uploadDate: '28.02.2026',
        uploadedBy: 'Ahmet Yılmaz',
        notes: 'Ayrıntılı Koli & Palet Çeki Listesi'
      },
      {
        id: 'doc-104',
        declarationId: 'dec-1',
        category: 'SWIFT_DEKONT',
        fileName: 'IsBankasi_Swift_Dekont_70000USD.pdf',
        fileSize: '910 KB',
        fileType: 'application/pdf',
        uploadDate: '15.04.2026',
        uploadedBy: 'Ahmet Yılmaz',
        notes: '70.000,25 USD Banka Havalesi & İBKB Dekontu'
      }
    ],
    ibkbRecords: [
      {
        id: 'ibkb-101',
        declarationId: 'dec-1',
        ibkbNo: 'İBKB-2026-IS-99120',
        bankName: 'Türkiye İş Bankası',
        bankBranch: 'Kadıköy Ticari Şube',
        documentDate: '2026-04-15',
        currency: 'USD',
        amount: 70000.25,
        convertedAmountInDeclarationCurrency: 70000.25,
        exchangeRate: 32.80,
        tcmbSoldAmount: 21000.08,
        tcmbSaleRateUsed: 30,
        notes: 'İlk parti ödeme kabul belgesi',
        createdAt: '2026-04-15 10:30',
      },
    ],
    createdAt: '2026-02-28 09:15',
    updatedAt: '2026-04-15 10:30',
  },
  {
    id: 'dec-2',
    declarationNo: '24340800EX002190',
    registrationDate: '2026-02-14',
    closingDate: closing2,
    deadlineDate: '2026-08-14',
    hasExtension: false,
    exporterTitle: 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.',
    exporterTaxNo: '3960817425',
    importerTitle: 'ORIENT DISTRIBUTION FZE',
    destinationCountry: 'Birleşik Arap Emirlikleri',
    customsOffice: 'Ambarlı Gümrük Müdürlüğü',
    paymentMethod: 'PESIN',
    incoterm: 'CIF',
    currency: 'EUR',
    amount: 24500.80,
    closedAmount: 0.00,
    remainingAmount: 24500.80,
    exchangeRateToTRY: 36.20,
    tcmbMandatorySaleRate: 30,
    tcmbMandatoryAmount: 0,
    tcmbSoldAmount: 0,
    status: 'ACTIVE',
    riskLevel: computeRiskLevel(calculateDaysLeft(closing2, false), 'ACTIVE'),
    daysLeft: calculateDaysLeft(closing2, false),
    notes: 'Tutar $30.000 USD altında olduğundan 30.000 USD Terkin İstisnasına Uygundur!',
    attachedFilesCount: 2,
    documents: [
      {
        id: 'doc-201',
        declarationId: 'dec-2',
        category: 'BEYANNAME_PDF',
        fileName: '24340800EX002190_Gumruk_Beyannamesi.pdf',
        fileSize: '1.5 MB',
        fileType: 'application/pdf',
        uploadDate: '14.02.2026',
        uploadedBy: 'Selin Kaya',
        notes: 'Ambarlı Gümrük Tescilli Beyanname'
      },
      {
        id: 'doc-202',
        declarationId: 'dec-2',
        category: 'INVOICE',
        fileName: 'FT-2026-08812_Invoice_Orient.pdf',
        fileSize: '510 KB',
        fileType: 'application/pdf',
        uploadDate: '14.02.2026',
        uploadedBy: 'Selin Kaya',
        notes: 'Commercial Invoice (Orient Distribution FZE)'
      }
    ],
    ibkbRecords: [],
    createdAt: '2026-02-14 14:20',
    updatedAt: '2026-02-15 09:00',
  },
];

export const initialDeclarations: Declaration[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    declarationNo: '24340100EX004102',
    userRole: 'Dış Ticaret Uzmanı',
    userName: 'Ahmet Yılmaz',
    action: 'İBKB Kapatma Eşleştirmesi',
    details: '85.000 EUR tutarında Ziraat Bankası İBKB belgesi girilerek beyanname TAM KAPALIA çekildi.',
    timestamp: '2026-08-01 15:00',
  },
  {
    id: 'log-2',
    declarationNo: '24340200EX005011',
    userRole: 'Mevzuat Sorumlusu',
    userName: 'Selin Kaya',
    action: '90 Gün Ek Süre Kaydı',
    details: 'Mersin Yapı Kredi şubesinden alınan 90 Gün Ek Süre yazısı sisteme işlendi. Yeni son tarih: 07/10/2026.',
    timestamp: '2026-06-30 16:45',
  },
  {
    id: 'log-3',
    declarationNo: '24340500EX003891',
    userRole: 'Muhasebe Operatörü',
    userName: 'Mehmet Demir',
    action: 'Kısmi İBKB Girişi',
    details: '150.000 USD tutarlı Garanti BBVA İBKB bağlandı. TCMB %40 döviz satışı onaylandı.',
    timestamp: '2026-06-20 11:45',
  },
];

export const initialSession: UserSession = {
  isLoggedIn: true,
  userRole: 'ADMIN',
  userName: 'Ahmet Yılmaz (Sistem Yöneticisi)',
  companyName: 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.',
  pinRequired: false,
};
