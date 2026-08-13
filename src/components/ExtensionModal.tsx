import React, { useState } from 'react';
import { X, Clock, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Declaration } from '../types';
import { formatCurrency, getDeadlineDateStr } from '../utils/exportCalculations';

interface ExtensionModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onSaveExtension: (declarationId: string, notes: string) => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onSaveExtension,
}) => {
  if (!isOpen || !declaration) return null;

  const [notes, setNotes] = useState('Alıcı firmanın ödeme gecikmesi gerekçesiyle bankaya +90 Gün Ek Süre dilekçesi verilmiştir.');

  // Current deadline and extended deadline (+90 days)
  const currentDeadline = getDeadlineDateStr(declaration.closingDate, false);
  const newDeadline = getDeadlineDateStr(declaration.closingDate, true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveExtension(declaration.id, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">+90 GÜN YASAL EK SÜRE KAYDI</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{declaration.declarationNo}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-bold uppercase tracking-wider text-xs">
              <span>Mevcut 180 Günlük Bitiş Tarihi:</span>
              <span className="font-mono text-amber-700 font-black">{currentDeadline}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-black uppercase tracking-wider text-xs pt-2 border-t border-indigo-200">
              <span>+90 Gün Ek Süre Sonrası Bitiş Tarihi:</span>
              <span className="font-mono text-emerald-700 font-black text-sm">{newDeadline}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
            <div className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              TCMB İHRACAT GENELGESİ MADDE 8 HÜKMÜ:
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              İhracatçıların haklı sebep beyanları halinde ilgili banka tarafından beyanname bazında 90 güne kadar ek süre verilebilir. Ek süre boyunca cezai takip durdurulur.
            </p>
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Banka Ek Süre Dilekçe & Onay Notu
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200"
            >
              İPTAL
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>+90 GÜN EK SÜREYİ ONAYLA</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
