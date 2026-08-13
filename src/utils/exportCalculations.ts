import { Declaration, IBKBRecord, AuditNotification, RiskLevel, DeclarationStatus } from '../types';

/**
 * Calculates remaining days from Fiili İhracat / Kapanma tarihi
 * Legal base: 180 days (or 270 days if +90 days extension requested)
 */
export function calculateDaysLeft(closingDateStr: string, hasExtension: boolean = false): number {
  if (!closingDateStr) return 180;
  
  const closingDate = new Date(closingDateStr);
  const now = new Date();
  
  // Normalize time to midnight
  closingDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const daysAllowed = hasExtension ? 270 : 180;
  const deadlineDate = new Date(closingDate);
  deadlineDate.setDate(deadlineDate.getDate() + daysAllowed);
  
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getDeadlineDateStr(closingDateStr: string, hasExtension: boolean = false): string {
  if (!closingDateStr) return '';
  const closingDate = new Date(closingDateStr);
  const daysAllowed = hasExtension ? 270 : 180;
  closingDate.setDate(closingDate.getDate() + daysAllowed);
  return closingDate.toISOString().split('T')[0];
}

export function computeRiskLevel(daysLeft: number, status: DeclarationStatus): RiskLevel {
  if (status === 'CLOSED' || status === 'WAIVED') return 'CLOSED';
  if (daysLeft < 0) return 'OVERDUE';
  if (daysLeft <= 15) return 'CRITICAL';
  if (daysLeft <= 45) return 'WARNING';
  return 'SAFE';
}

export function validateDeclarationNumber(no: string): { isValid: boolean; message?: string } {
  const clean = no.trim().toUpperCase();
  if (!clean) return { isValid: false, message: 'Beyanname Numarası boş olamaz.' };
  if (clean.length !== 16) {
    return { isValid: false, message: 'Beyanname No 16 karakter olmalıdır (Örn: 24340100EX001842).' };
  }
  if (!clean.includes('EX') && !clean.includes('AN') && !clean.includes('GB')) {
    return { isValid: false, message: 'İhracat rejim kodu (EX) içermelidir.' };
  }
  return { isValid: true };
}

/**
 * Evaluates full compliance rules to generate zero-error audit alerts
 */
export function evaluateZeroErrorRules(declarations: Declaration[]): AuditNotification[] {
  const notifications: AuditNotification[] = [];
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  declarations.forEach((dec) => {
    const daysLeft = calculateDaysLeft(dec.closingDate, dec.hasExtension);
    const isValidNo = validateDeclarationNumber(dec.declarationNo);

    // Rule 1: Beyanname No Format Check
    if (!isValidNo.isValid) {
      notifications.push({
        id: `notif-fmt-${dec.id}`,
        declarationId: dec.id,
        declarationNo: dec.declarationNo || 'TANIMSIZ',
        type: 'ERROR',
        code: 'ERR_FORMAT',
        category: 'FORMAT_CHECK',
        title: 'Hatalı Beyanname Numarası Formatı',
        message: `${dec.declarationNo || 'Beyanname'} numarası Gümrük standardına (16 hane) uymuyor.`,
        recommendation: 'Gümrük tescil numarasını 16 haneli biçimde düzenleyin.',
        quickActionType: 'FIX_FORMAT',
        timestamp: nowStr,
        isRead: false,
      });
    }

    // Rule 2: Overdue Deadline Risk (CRITICAL / OVERDUE)
    if (dec.status !== 'CLOSED' && dec.status !== 'WAIVED') {
      if (daysLeft < 0) {
        notifications.push({
          id: `notif-overdue-${dec.id}`,
          declarationId: dec.id,
          declarationNo: dec.declarationNo,
          type: 'ERROR',
          code: 'ERR_LEGAL_OVERDUE',
          category: 'LEGAL_DEADLINE',
          title: 'YASAL 180 GÜN SÜRESİ DOLDU (Vergi Dairesi İhbar Riski)',
          message: `${dec.declarationNo} nolu beyannamenin 180 günlük yasal İBKB kapama süresi ${Math.abs(daysLeft)} gün önce doldu!`,
          recommendation: 'Derhal bankanızla görüşerek İBKB bağlayın veya Vergi Dairesi mücbir sebep / ek süre yazısını işleme alın.',
          quickActionType: 'ADD_IBKB',
          timestamp: nowStr,
          isRead: false,
        });
      } else if (daysLeft <= 15) {
        notifications.push({
          id: `notif-crit-${dec.id}`,
          declarationId: dec.id,
          declarationNo: dec.declarationNo,
          type: 'WARNING',
          code: 'WARN_180_DAYS_CRITICAL',
          category: 'LEGAL_DEADLINE',
          title: 'KRİTİK UYARI: Kapanmaya Son 15 Gün!',
          message: `${dec.declarationNo} için 180 günlük yasal sürenin bitimine yalnızca ${daysLeft} gün kaldı. Açık tutar: ${dec.remainingAmount.toLocaleString('tr-TR')} ${dec.currency}.`,
          recommendation: 'İBKB dekontunu sisteme işleyin veya 90 günlük Ek Süre talebinde bulunun.',
          quickActionType: 'REQUEST_EXTENSION',
          timestamp: nowStr,
          isRead: false,
        });
      }
    }

    // Rule 3: Terkin Eligibility Check (If open amount <= $30,000 USD equivalent)
    // Assuming USD/EUR rate ~ 1.08
    const remainingInUSD = dec.currency === 'USD' ? dec.remainingAmount : dec.currency === 'EUR' ? dec.remainingAmount * 1.08 : dec.remainingAmount * 0.03;
    if (dec.status !== 'CLOSED' && dec.status !== 'WAIVED' && dec.remainingAmount > 0 && remainingInUSD <= 30000) {
      notifications.push({
        id: `notif-terkin-${dec.id}`,
        declarationId: dec.id,
        declarationNo: dec.declarationNo,
        type: 'INFO',
        code: 'INFO_TERKIN_ELIGIBLE',
        category: 'BALANCE_MISMATCH',
        title: 'Terkin / Muafiyet Sınırında Açık Tutar',
        message: `${dec.declarationNo} beyannamesinde kalan ${dec.remainingAmount.toLocaleString('tr-TR')} ${dec.currency} açık tutar, TCMB 30.000 USD terkin limiti dahilindedir.`,
        recommendation: 'Tek tıkla Terkin (Muafiyet) uygulayarak beyannameyi cezasız kapatabilirsiniz.',
        quickActionType: 'APPLY_TERKIN',
        timestamp: nowStr,
        isRead: false,
      });
    }

    // Rule 4: TCMB %30 - %40 Mandatory Sale Verification
    // According to circular, mandatory percentage must be converted at bank
    if (dec.status !== 'CLOSED' && dec.status !== 'WAIVED' && dec.closedAmount > 0) {
      const requiredTcmbSale = (dec.closedAmount * (dec.tcmbMandatorySaleRate || 30)) / 100;
      if (dec.tcmbSoldAmount < requiredTcmbSale - 10) {
        notifications.push({
          id: `notif-tcmb-${dec.id}`,
          declarationId: dec.id,
          declarationNo: dec.declarationNo,
          type: 'WARNING',
          code: 'WARN_TCMB_SALE_SHORTFALL',
          category: 'TCMB_COMPLIANCE',
          title: 'TCMB Zorunlu Döviz Satış Eksikliği',
          message: `Kapatılan ${dec.closedAmount.toLocaleString('tr-TR')} ${dec.currency} için %${dec.tcmbMandatorySaleRate} TCMB satış tutarı en az ${requiredTcmbSale.toFixed(2)} olmalıdır (Mevcut: ${dec.tcmbSoldAmount.toFixed(2)}).`,
          recommendation: 'Banka İBKB belgenizdeki TCMB Döviz Alım tutarını kontrol edin ve güncelleyin.',
          quickActionType: 'TCMB_SALE',
          timestamp: nowStr,
          isRead: false,
        });
      }
    }

    // Rule 5: Partial Closing with Pending Extension
    if (dec.status === 'PARTIAL' && daysLeft <= 30 && !dec.hasExtension) {
      notifications.push({
        id: `notif-ext-${dec.id}`,
        declarationId: dec.id,
        declarationNo: dec.declarationNo,
        type: 'WARNING',
        code: 'WARN_EXTENSION_RECOMMENDED',
        category: 'LEGAL_DEADLINE',
        title: 'Kısmi Kapalı Beyanname Ek Süre Talebi Önermesi',
        message: `${dec.declarationNo} için ${dec.remainingAmount.toLocaleString('tr-TR')} ${dec.currency} bakiyeniz var ve 180 gün dolmak üzere.`,
        recommendation: 'Bankanıza Ek Süre Dilekçesi göndererek +90 gün yasal koruma sağlayın.',
        quickActionType: 'REQUEST_EXTENSION',
        timestamp: nowStr,
        isRead: false,
      });
    }
  });

  return notifications;
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    TRY: '₺',
    CHF: 'CHF',
    RUB: '₽',
  };
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbolMap[currency] || currency}`;
}
