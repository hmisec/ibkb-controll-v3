import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  ChevronRight, 
  Bell, 
  BellOff, 
  FileText, 
  ShieldAlert, 
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Declaration } from '../types';
import { 
  getBrowserNotificationPermission, 
  requestBrowserNotificationPermission,
  triggerCriticalBrowserNotification,
  markDeclarationAsNotified
} from '../utils/browserNotification';

interface CriticalToastAlertProps {
  criticalDeclarations: Declaration[];
  onOpenDetail: (declaration: Declaration) => void;
  onRequestExtension: (declaration: Declaration) => void;
  onOpenPetition: (declaration: Declaration) => void;
}

export const CriticalToastAlert: React.FC<CriticalToastAlertProps> = ({
  criticalDeclarations,
  onOpenDetail,
  onRequestExtension,
  onOpenPetition,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [permission, setPermission] = useState<string>('default');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  // Whenever critical declarations exist, ensure toast is shown if not dismissed
  useEffect(() => {
    if (criticalDeclarations.length > 0) {
      setIsVisible(true);
      
      // Attempt browser desktop notification for the first critical declaration if permitted
      const target = criticalDeclarations[0];
      if (target) {
        triggerCriticalBrowserNotification(
          target.declarationNo,
          target.daysLeft,
          target.remainingAmount,
          target.currency
        );
        markDeclarationAsNotified(target.id);
      }
    }
  }, [criticalDeclarations.length]);

  if (!isVisible || criticalDeclarations.length === 0) return null;

  const currentDec = criticalDeclarations[currentIndex] || criticalDeclarations[0];

  const handleEnableBrowserNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
    if (res === 'granted' && currentDec) {
      triggerCriticalBrowserNotification(
        currentDec.declarationNo,
        currentDec.daysLeft,
        currentDec.remainingAmount,
        currentDec.currency
      );
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % criticalDeclarations.length);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 font-extrabold text-xs uppercase tracking-wider transition border border-red-500"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>KRİTİK RİSK UYARISI ({criticalDeclarations.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full p-1 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-2xl shadow-2xl text-white overflow-hidden backdrop-blur-md">
        
        {/* Top Header Bar */}
        <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              180 GÜN KRİTİK BÖLGE ALARMI ({currentIndex + 1} / {criticalDeclarations.length})
            </h4>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-red-700 rounded-lg transition text-white/80 hover:text-white"
              title="Küçült"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-red-700 rounded-lg transition text-white/80 hover:text-white"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Body */}
        <div className="p-4 space-y-3">
          
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                <span>BEYANNAME NO:</span>
                <span className="text-white font-mono font-black text-sm">{currentDec.declarationNo}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Bu beyannamenin 180 günlük yasal İBKB kapatma süresinin bitimine yalnızca{' '}
                <span className="text-amber-400 font-black text-sm underline underline-offset-2">
                  {currentDec.daysLeft} GÜN
                </span>{' '}
                kaldı!
              </p>
            </div>

            <div className="bg-red-950/80 border border-red-500/40 px-2.5 py-1.5 rounded-xl text-center shrink-0">
              <div className="text-[10px] text-red-300 font-extrabold uppercase">AÇIK BAKİYE</div>
              <div className="text-xs font-black text-amber-300">
                {currentDec.remainingAmount.toLocaleString('tr-TR')} {currentDec.currency}
              </div>
            </div>
          </div>

          {/* Customer & Customs info */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex justify-between items-center">
            <div className="truncate max-w-[200px]">
              <span className="text-slate-400 font-semibold">Alıcı: </span>
              <span className="font-bold text-white">{currentDec.importerTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Gümrük: </span>
              <span className="font-bold text-slate-200">{currentDec.customsOffice}</span>
            </div>
          </div>

          {/* Enable Push Notifications Banner if prompt/default */}
          {permission !== 'granted' && (
            <div className="bg-indigo-950/60 border border-indigo-500/40 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-[11px] text-indigo-200">
                <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Masaüstü bildirimlerini aktifleştirin</span>
              </div>
              <button
                onClick={handleEnableBrowserNotifications}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase rounded-lg transition shrink-0"
              >
                BİLDİRİMLERİ AÇ
              </button>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="pt-1 flex items-center justify-between gap-2">
            
            {criticalDeclarations.length > 1 && (
              <button
                onClick={handleNext}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
              >
                Sonraki ({currentIndex + 1}/{criticalDeclarations.length})
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={() => onOpenPetition(currentDec)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition flex items-center gap-1 shadow-md shadow-amber-500/20"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dilekçe / Ek Süre</span>
              </button>

              <button
                onClick={() => onOpenDetail(currentDec)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl transition flex items-center gap-1 shadow-md shadow-red-600/20"
              >
                <span>İncele / Bağla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
