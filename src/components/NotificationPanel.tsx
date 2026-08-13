import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Filter,
  CheckCheck,
  BellRing
} from 'lucide-react';
import { AuditNotification } from '../types';
import { getBrowserNotificationPermission, requestBrowserNotificationPermission } from '../utils/browserNotification';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AuditNotification[];
  onMarkAllAsRead: () => void;
  onQuickAction: (notif: AuditNotification) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onQuickAction,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [browserNotifStatus, setBrowserNotifStatus] = useState<string>('default');

  useEffect(() => {
    if (isOpen) {
      setBrowserNotifStatus(getBrowserNotificationPermission());
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserNotifStatus(perm);
  };

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 text-slate-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Sıfır Hata Bildirim Paneli</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200">
                    {unreadCount} OKUNMAMIŞ
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                TCMB İHRACAT MEVZUAT OTOMATİK DENETİM MOTORU
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider flex items-center space-x-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition"
                title="Tümünü Okundu İşaretle"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TÜMÜNÜ OKUNDU SAY</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Notification Status Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2 text-indigo-900">
            <BellRing className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Masaüstü Anlık Bildirimleri:{' '}
              {browserNotifStatus === 'granted' ? (
                <span className="font-extrabold text-emerald-700">AKTİF (ETKİN)</span>
              ) : browserNotifStatus === 'denied' ? (
                <span className="font-extrabold text-red-600">ENGELLEMİŞ</span>
              ) : (
                <span className="font-extrabold text-amber-700">İZİN BEKLENİYOR</span>
              )}
            </span>
          </div>

          {browserNotifStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition shadow-xs"
            >
              İzin Ver
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> FİLTRE:
          </span>
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-black transition ${
              filterCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            TÜMÜ ({notifications.length})
          </button>
          <button
            onClick={() => setFilterCategory('LEGAL_DEADLINE')}
            className={`px-3 py-1.5 rounded-xl font-black transition ${
              filterCategory === 'LEGAL_DEADLINE'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            180 GÜN YASAL SÜRE ({notifications.filter(n => n.category === 'LEGAL_DEADLINE').length})
          </button>
          <button
            onClick={() => setFilterCategory('BALANCE_MISMATCH')}
            className={`px-3 py-1.5 rounded-xl font-black transition ${
              filterCategory === 'BALANCE_MISMATCH'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            TERKİN / İSTİSNA ({notifications.filter(n => n.category === 'BALANCE_MISMATCH').length})
          </button>
          <button
            onClick={() => setFilterCategory('TCMB_COMPLIANCE')}
            className={`px-3 py-1.5 rounded-xl font-black transition ${
              filterCategory === 'TCMB_COMPLIANCE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            TCMB SATIŞ EKSİĞİ ({notifications.filter(n => n.category === 'TCMB_COMPLIANCE').length})
          </button>
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
              <p className="text-sm font-black uppercase tracking-wider text-slate-800">Harika! Sıfır Hata Durumu</p>
              <p className="text-xs text-slate-400 mt-1">Seçilen kategoride hiçbir mevzuat uyumsuzluğu veya kritik eksik bulunmuyor.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isError = notif.type === 'ERROR';
              const isWarning = notif.type === 'WARNING';
              const isInfo = notif.type === 'INFO';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition relative ${
                    isError
                      ? 'bg-red-50/80 border-red-200'
                      : isWarning
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-indigo-50/80 border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {isError && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                        {isInfo && <Sparkles className="w-5 h-5 text-indigo-600" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {notif.declarationNo}
                          </span>
                          <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${
                            isError ? 'bg-red-100 text-red-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {notif.code}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1.5">
                          {notif.title}
                        </h4>

                        <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                          {notif.message}
                        </p>

                        <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 flex items-start gap-2 shadow-2xs">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 uppercase">Çözüm Önerisi: </span>
                            <span className="font-medium text-slate-700">{notif.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  {notif.quickActionType && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex justify-end">
                      <button
                        onClick={() => onQuickAction(notif)}
                        className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm ${
                          notif.quickActionType === 'APPLY_TERKIN'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : notif.quickActionType === 'REQUEST_EXTENSION'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <span>
                          {notif.quickActionType === 'APPLY_TERKIN' && '1-Tıkla Terkin Uygula ($30K Muafiyet)'}
                          {notif.quickActionType === 'REQUEST_EXTENSION' && '+90 Gün Ek Süre Dilekçesi Oluştur'}
                          {notif.quickActionType === 'ADD_IBKB' && 'İBKB Kapatma Belgesi Ekle'}
                          {notif.quickActionType === 'FIX_FORMAT' && 'Beyanname No Düzenle'}
                          {notif.quickActionType === 'TCMB_SALE' && 'TCMB Satış Tutarı Güncelle'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-white text-center text-xs font-bold uppercase tracking-wider text-slate-400">
          Sıfır Hata Motoru, TCMB İhracat Genelgesi Madde 4, 8 ve 28 hükümlerini simüle eder.
        </div>

      </div>
    </div>
  );
};
