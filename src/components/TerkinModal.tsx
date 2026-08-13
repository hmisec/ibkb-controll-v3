import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Declaration } from '../types';
import { formatCurrency } from '../utils/exportCalculations';

interface TerkinModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onApplyTerkinSave: (declarationId: string, terkinAmount: number, reason: string) => void;
}

export const TerkinModal: React.FC<TerkinModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onApplyTerkinSave,
}) => {
  if (!isOpen || !declaration) return null;

  const [terkinAmount, setTerkinAmount] = useState<number>(declaration.remainingAmount);
  const [reason, setReason] = useState('TCMB İhracat Genelgesi Madde 28 uyarınca 30.000 USD terkin istisnasından faydalanılarak cezasız kapatılmıştır.');

  // Check if remaining amount is under $30,000 USD equivalent
  const remainingInUSD = declaration.currency === 'USD' ? declaration.remainingAmount : declaration.currency === 'EUR' ? declaration.remainingAmount * 1.08 : declaration.remainingAmount * 0.03;
  const isEligible = remainingInUSD <= 30000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (terkinAmount <= 0) {
      alert('Terkin tutarı 0\'dan büyük olmalıdır.');
      return;
    }
    onApplyTerkinSave(declaration.id, terkinAmount, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">TERKİN / MUAFİYET KAPATMASI ($30K)</h3>
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
          
          <div className={`p-4 rounded-2xl border ${
            isEligible
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between font-black uppercase tracking-wider mb-1 text-xs">
              <span>Mevcut Açık Bakiye:</span>
              <span className="text-sm font-black text-slate-900">{formatCurrency(declaration.remainingAmount, declaration.currency)}</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              USD Karşılığı Tutar: ~{formatCurrency(remainingInUSD, 'USD')}
            </div>
            {isEligible ? (
              <div className="mt-2.5 text-xs font-extrabold bg-white p-2.5 rounded-xl text-emerald-900 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bu bakiye TCMB 30.000 USD terkin/bağışlama limiti dahilinde doğrudan terkin edilebilir!</span>
              </div>
            ) : (
              <div className="mt-2.5 text-xs font-extrabold bg-white p-2.5 rounded-xl text-amber-900 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tutar $30.000 USD üzerindedir; yalnızca $30.000 USD kadarı veya vergi dairesi onayı ile terkin edilebilir.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Terkin Edilecek Tutar ({declaration.currency})*
            </label>
            <input
              type="number"
              required
              min={1}
              max={declaration.remainingAmount}
              value={terkinAmount}
              onChange={(e) => setTerkinAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-black text-sm focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Terkin Sebebi & Mevzuat Dayanağı
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              <Sparkles className="w-4 h-4" />
              <span>TERKİN KAPATMASINI UYGULA</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
