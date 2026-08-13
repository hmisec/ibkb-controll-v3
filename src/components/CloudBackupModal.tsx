import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HardDrive, 
  Database, 
  History, 
  Lock, 
  LogIn,
  FileJson,
  Check,
  ChevronRight
} from 'lucide-react';
import { Declaration, AuditLog, UserSession } from '../types';
import { 
  getStoredBackupConfig, 
  saveStoredBackupConfig, 
  getBackupHistory, 
  performCloudBackup, 
  restoreFromFirebaseFirestore, 
  restoreFromGoogleDrive, 
  BackupState, 
  BackupLogEntry,
  CloudBackupConfig 
} from '../lib/cloudBackupService';
import { googleSignIn, googleLogout, getAccessToken } from '../lib/googleAuth';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
  auditLogs: AuditLog[];
  session: UserSession;
  onRestoreSuccess: (data: BackupState) => void;
  onTriggerAuditLog: (action: string, description: string) => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  declarations,
  auditLogs,
  session,
  onRestoreSuccess,
  onTriggerAuditLog,
}) => {
  const [config, setConfig] = useState<CloudBackupConfig>(getStoredBackupConfig);
  const [history, setHistory] = useState<BackupLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredBackupConfig());
      setHistory(getBackupHistory());
      checkGoogleAuth();
    }
  }, [isOpen]);

  const checkGoogleAuth = async () => {
    const token = await getAccessToken();
    setHasGoogleToken(!!token);
  };

  if (!isOpen) return null;

  const handleToggleAutoBackup = () => {
    const updated = { ...config, autoBackupEnabled: !config.autoBackupEnabled };
    setConfig(updated);
    saveStoredBackupConfig(updated);
  };

  const handleSelectTarget = (target: 'firebase' | 'google_drive' | 'both') => {
    const updated = { ...config, target };
    setConfig(updated);
    saveStoredBackupConfig(updated);
  };

  const handleManualBackup = async () => {
    setIsSyncing(true);
    setSyncStatusMsg({ type: 'info', text: 'Bulut sunucularına veri senkronizasyonu yapılıyor...' });
    
    try {
      const res = await performCloudBackup(declarations, auditLogs, session, config.target);
      setConfig(getStoredBackupConfig());
      setHistory(getBackupHistory());

      if (res.success) {
        setSyncStatusMsg({ type: 'success', text: res.message });
        onTriggerAuditLog('Manuel Bulut Yedekleme', `Sistemdeki ${declarations.length} adet beyanname bulut sunucusuna yedeklendi.`);
      } else {
        setSyncStatusMsg({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setSyncStatusMsg({ type: 'error', text: e.message || 'Yedekleme sırasında beklenmeyen bir hata oluştu.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const authRes = await googleSignIn();
      if (authRes?.accessToken) {
        setHasGoogleToken(true);
        setSyncStatusMsg({ type: 'success', text: 'Google Drive hesabınız başarıyla bağlandı.' });
      }
    } catch (e: any) {
      setSyncStatusMsg({ type: 'error', text: 'Google Drive bağlantısı kurulamadı: ' + e.message });
    }
  };

  const handleRestoreFromFirebase = async () => {
    if (!confirm('Firebase üzerindeki en son yedeklenen verileri sisteme yüklemek istediğinize emin misiniz? Mevcut yerel verilerin üzerine yazılacaktır.')) {
      return;
    }

    setIsRestoring(true);
    setSyncStatusMsg({ type: 'info', text: 'Firebase sunucusundan yedek indiriliyor...' });

    try {
      const restored = await restoreFromFirebaseFirestore();
      if (restored && restored.declarations) {
        onRestoreSuccess(restored);
        setSyncStatusMsg({ type: 'success', text: `Firebase yedeği başarıyla yüklendi (${restored.declarations.length} Beyanname).` });
        onTriggerAuditLog('Buluttan Veri Yükleme', `Firebase Firestore sunucusundaki ${restored.declarations.length} adet beyanname geri yüklendi.`);
      } else {
        setSyncStatusMsg({ type: 'error', text: 'Firebase sunucusunda kayıtlı yedek verisi bulunamadı.' });
      }
    } catch (e: any) {
      setSyncStatusMsg({ type: 'error', text: 'Geri yükleme başarısız: ' + e.message });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      setSyncStatusMsg({ type: 'error', text: 'Lütfen önce Google Drive ile giriş yapın.' });
      return;
    }

    if (!confirm('Google Drive hesabınızdaki yedeklenen verileri sisteme yüklemek istediğinize emin misiniz? Mevcut yerel verilerin üzerine yazılacaktır.')) {
      return;
    }

    setIsRestoring(true);
    setSyncStatusMsg({ type: 'info', text: 'Google Drive sunucusundan yedek dosyası indiriliyor...' });

    try {
      const restored = await restoreFromGoogleDrive(token);
      if (restored && restored.declarations) {
        onRestoreSuccess(restored);
        setSyncStatusMsg({ type: 'success', text: `Google Drive yedeği başarıyla yüklendi (${restored.declarations.length} Beyanname).` });
        onTriggerAuditLog('Drive Veri Yükleme', `Google Drive hesabındaki ${restored.declarations.length} adet beyanname geri yüklendi.`);
      } else {
        setSyncStatusMsg({ type: 'error', text: 'Google Drive hesabınızda geçerli bir yedek bulunamadı.' });
      }
    } catch (e: any) {
      setSyncStatusMsg({ type: 'error', text: 'Drive geri yükleme hatası: ' + e.message });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportJsonFile = () => {
    const payload = {
      declarations,
      auditLogs,
      session,
      exportedAt: new Date().toISOString(),
      system: 'TCMB İBKB & İhracat Takip',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ibkb_yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <CloudUpload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Otomatik Bulut Yedekleme & Senkronizasyon
                </h3>
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  CANLI
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                Her işlem sonrası otomatik Firebase Firestore & Google Drive senkronizasyonu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Status Alert Banner if any */}
          {syncStatusMsg && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-start space-x-2.5 ${
              syncStatusMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : syncStatusMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              {syncStatusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {syncStatusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
              {syncStatusMsg.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />}
              <div>{syncStatusMsg.text}</div>
            </div>
          )}

          {/* Master Switch Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Her İşlem Sonrası Otomatik Bulut Yedekleme
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Yeni beyanname eklendiğinde, düzenlendiğinde veya silindiğinde anında bulut yedeklemesi tetiklenir.
              </p>
            </div>

            <button
              onClick={handleToggleAutoBackup}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                config.autoBackupEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Backup Target Platform Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Yedekleme Hedefi Seçimi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => handleSelectTarget('firebase')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  config.target === 'firebase'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-indigo-600" />
                  {config.target === 'firebase' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Firebase Firestore</div>
                  <div className="text-[10px] text-slate-500 font-medium">Bulut Veritabanı</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTarget('google_drive')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  config.target === 'google_drive'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  {config.target === 'google_drive' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Google Drive</div>
                  <div className="text-[10px] text-slate-500 font-medium">JSON Dosya Yedeği</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTarget('both')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  config.target === 'both'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  {config.target === 'both' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Her İkisi de (Çift)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Maksimum Güvenlik</div>
                </div>
              </button>

            </div>
          </div>

          {/* Connected Cloud Services Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Firebase Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-800">Firebase Firestore</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  BAĞLI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                `ibkb_backups` veritabanı koleksiyonunda canlı eşitleniyor.
              </p>
              <button
                onClick={handleRestoreFromFirebase}
                disabled={isRestoring}
                className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <CloudDownload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Firebase'den Yükle</span>
              </button>
            </div>

            {/* Google Drive Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800">Google Drive</span>
                </div>
                {hasGoogleToken ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    OTURUM AÇIK
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                    GİRİŞ GEREKLİ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                `ibkb_declarations_backup.json` dosyasına yazılır.
              </p>

              {hasGoogleToken ? (
                <button
                  onClick={handleRestoreFromDrive}
                  disabled={isRestoring}
                  className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <CloudDownload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Drive'dan Yükle</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Drive Bağla</span>
                </button>
              )}
            </div>

          </div>

          {/* Action Buttons Toolbar */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleExportJsonFile}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            >
              <FileJson className="w-4 h-4 text-slate-600" />
              <span>JSON İndir</span>
            </button>

            <button
              onClick={handleManualBackup}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-100"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Yedekleniyor...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Şimdi Manuel Bulut Yedekle</span>
                </>
              )}
            </button>
          </div>

          {/* Backup Log History */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Son Bulut Senkronizasyon Geçmişi</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Toplam {config.totalBackupsCount} Başarılı İşlem
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  Henüz otomatik bulut yedekleme kaydı oluşmadı.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {history.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-bold text-slate-800">{item.target}</div>
                          <div className="text-[10px] text-slate-400">{item.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          item.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {item.status} ({item.declarationCount} Kayıt)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
