import React from 'react';
import { X, History, User, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">GÜVENLİ DENETİM & İŞLEM GEÇMİŞİ (AUDIT TRAIL)</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Beyanname ve İBKB kapama değişiklik kayıtları</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3 text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider">
              Henüz işlem geçmişi kaydı bulunmuyor.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-lg text-xs">
                      {log.declarationNo}
                    </span>
                    <span className="text-xs text-indigo-600 font-black uppercase tracking-wider">{log.action}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-800 font-bold leading-relaxed">{log.details}</p>

                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5 pt-1.5 border-t border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.userName} ({log.userRole})</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
