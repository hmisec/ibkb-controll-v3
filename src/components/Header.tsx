import React from 'react';
import { CalendarDays,  
  ShieldAlert, 
  Bell, 
  Sparkles, 
  FileSpreadsheet, 
  History, 
  Lock, 
  Unlock, 
  Plus, 
  Building2,
  FileText,
  CloudUpload,
  Palette,
  ChevronDown,
  Mail
} from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  session: UserSession;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
  onToggleSecurity: () => void;
  onLockNow: () => void;
  onOpenNotifications: () => void;
  unreadNotifCount: number;
  criticalCount: number;
  overdueCount: number;
  onOpenNewDeclaration: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuditLogs: () => void;
  onOpenCloudBackup: () => void;
  onOpenEmailReminders: () => void;
  onOpenAgenda: () => void;
  onExportSheets: () => void;
  isExportingSheets: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activeTheme,
  onChangeTheme,
  onToggleSecurity,
  onLockNow,
  onOpenNotifications,
  unreadNotifCount,
  criticalCount,
  overdueCount,
  onOpenNewDeclaration,
  onOpenAiAssistant,
  onOpenAuditLogs,
  onOpenCloudBackup,
  onOpenEmailReminders,
  onOpenAgenda,
  onExportSheets,
  isExportingSheets,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 min-h-[4.5rem]">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none text-white shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  İBKB <span className="text-indigo-600 dark:text-indigo-400">&</span> İHRACAT TAKİP
                </h1>
                <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  TCMB 2026 MEVZUAT
                </span>
              </div>
              {session.companyName ? (
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5 truncate max-w-[240px] sm:max-w-none">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{session.companyName}</span>
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>İhracat Takip Sistemi</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats & Badges */}
          <div className="hidden lg:flex items-center space-x-3">
            {overdueCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>{overdueCount} SÜRESİ DOLMUŞ GB</span>
              </div>
            )}
            {criticalCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{criticalCount} ACİL ALARM (&lt;15 GÜN)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Selector */}
            <div className="relative hidden md:block">
              <select
                value={activeTheme}
                onChange={(e) => onChangeTheme(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider pl-8 pr-7 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="default">İndigo (Açık)</option>
                <option value="dark">İndigo (Koyu)</option>
                <option value="ocean">Okyanus (Açık)</option>
                <option value="ocean-dark">Okyanus (Koyu)</option>
                <option value="emerald">Zümrüt (Açık)</option>
                <option value="emerald-dark">Zümrüt (Koyu)</option>
                <option value="rose">Yakut (Açık)</option>
                <option value="rose-dark">Yakut (Koyu)</option>
              </select>
              <Palette className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Cloud Backup Button */}
            <button
              onClick={onOpenCloudBackup}
              className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-extrabold uppercase tracking-wider px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
              title="Otomatik Bulut Yedekleme & Senkronizasyon"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CloudUpload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">BULUT YEDEK</span>
            </button>

            {/* Agenda Button */}
            <button
              onClick={onOpenAgenda}
              className="flex items-center space-x-1.5 bg-fuchsia-50 dark:bg-fuchsia-950/80 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-200 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 transition-colors"
              title="Kapanma Süreleri Ajandası"
            >
              <CalendarDays className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
              <span className="hidden sm:inline">AJANDA</span>
            </button>

            {/* Email Reminders Button */}
            <button
              onClick={onOpenEmailReminders}
              className="flex items-center space-x-1.5 bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-200 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-sky-200 dark:border-sky-800 transition-colors"
              title="E-Posta Hatırlatmaları"
            >
              <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">E-POSTA</span>
            </button>

            {/* AI Document OCR & Consultant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Yapay Zeka Evrak Ayrıştırma ve TCMB Mevzuat Danışmanı"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">AI MEVZUAT</span>
            </button>

            {/* Zero-Error Notification Panel Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
              title="Sıfır Hata Bildirim Paneli"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Audit Logs */}
            <button
              onClick={onOpenAuditLogs}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 hidden sm:flex"
              title="İşlem Geçmişi & Audit Log"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Sheets Export */}
            <button
              onClick={onExportSheets}
              disabled={isExportingSheets}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition hidden sm:flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
              title="Google Sheets / CSV Dışa Aktar"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="hidden xl:inline">EXPORT</span>
            </button>

            {/* Security Lock Toggle & Role Settings */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onToggleSecurity}
                className="px-3 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                title="Kullanıcı Rolü & Şifre Ayarları"
              >
                <Unlock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline">{session.userRole}</span>
              </button>

              <button
                onClick={onLockNow}
                className="px-2.5 py-2.5 rounded-r-xl bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 border border-l-0 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 transition text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                title="Ekranı Anında Kilitle"
              >
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline">KİLİTLE</span>
              </button>
            </div>

            {/* New Declaration Button */}
            <button
              onClick={onOpenNewDeclaration}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>YENİ BEYANNAME</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
