import React from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Sparkles, 
  FileSpreadsheet, 
  History, 
  Lock, 
  Unlock, 
  Plus, 
  Building2,
  FileText
} from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  session: UserSession;
  onToggleSecurity: () => void;
  onOpenNotifications: () => void;
  unreadNotifCount: number;
  criticalCount: number;
  overdueCount: number;
  onOpenNewDeclaration: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuditLogs: () => void;
  onExportSheets: () => void;
  isExportingSheets: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onToggleSecurity,
  onOpenNotifications,
  unreadNotifCount,
  criticalCount,
  overdueCount,
  onOpenNewDeclaration,
  onOpenAiAssistant,
  onOpenAuditLogs,
  onExportSheets,
  isExportingSheets,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 text-white">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  İBKB <span className="text-indigo-600">&</span> İHRACAT TAKİP
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200">
                  TCMB 2026 MEVZUAT
                </span>
              </div>
              {session.companyName ? (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{session.companyName}</span>
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>İhracat Takip Sistemi</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats & Badges */}
          <div className="hidden lg:flex items-center space-x-3">
            {overdueCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-red-50 text-red-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-red-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>{overdueCount} SÜRESİ DOLMUŞ GB</span>
              </div>
            )}
            {criticalCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{criticalCount} ACİL ALARM (&lt;15 GÜN)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* AI Document OCR & Consultant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-indigo-200 transition-colors"
              title="Yapay Zeka Evrak Ayrıştırma ve TCMB Mevzuat Danışmanı"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">AI MEVZUAT</span>
            </button>

            {/* Zero-Error Notification Panel Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
              title="Sıfır Hata Bildirim Paneli"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Audit Logs */}
            <button
              onClick={onOpenAuditLogs}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 hidden sm:flex"
              title="İşlem Geçmişi & Audit Log"
            >
              <History className="w-5 h-5" />
            </button>

            {/* Sheets Export */}
            <button
              onClick={onExportSheets}
              disabled={isExportingSheets}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition hidden sm:flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
              title="Google Sheets / CSV Dışa Aktar"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>EXPORT</span>
            </button>

            {/* Security Lock Toggle */}
            <button
              onClick={onToggleSecurity}
              className={`px-3 py-2.5 rounded-xl transition border text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                session.pinRequired
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Güvenlik & Rol Modu"
            >
              {session.pinRequired ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-slate-500" />}
              <span className="hidden md:inline">{session.userRole}</span>
            </button>

            {/* New Declaration Button */}
            <button
              onClick={onOpenNewDeclaration}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-colors flex items-center space-x-1.5"
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
