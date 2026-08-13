/**
 * Browser HTML5 Web Notifications API Utility
 */

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Tarayıcı bildirim izni alınırken hata oluştu:', error);
    return 'denied';
  }
}

const NOTIFIED_DECLARATION_KEYS = 'ibkb_notified_critical_dec_v1';

export function getNotifiedDeclarations(): Record<string, number> {
  try {
    const saved = localStorage.getItem(NOTIFIED_DECLARATION_KEYS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Bildirim geçmişi okunamadı:', e);
  }
  return {};
}

export function markDeclarationAsNotified(declarationId: string) {
  const current = getNotifiedDeclarations();
  current[declarationId] = Date.now();
  localStorage.setItem(NOTIFIED_DECLARATION_KEYS, JSON.stringify(current));
}

export function triggerCriticalBrowserNotification(
  declarationNo: string,
  daysLeft: number,
  remainingAmount: number,
  currency: string
) {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `🚨 KRİTİK SÜRE UYARISI: ${declarationNo}`;
    const body = `180 günlük yasal kapama süresinin bitimine yalnızca ${daysLeft} gün kaldı!\nAçık Bakiye: ${remainingAmount.toLocaleString('tr-TR')} ${currency}`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `critical-dec-${declarationNo}`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Tarayıcı bildirimi gönderilemedi:', error);
    return false;
  }
}
