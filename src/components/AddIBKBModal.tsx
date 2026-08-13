import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Calendar, FileText, Sparkles, DollarSign } from 'lucide-react';
import { Declaration, IBKBRecord, Currency } from '../types';
import { formatCurrency } from '../utils/exportCalculations';

interface AddIBKBModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onSaveIBKB: (declarationId: string, ibkb: Omit<IBKBRecord, 'id' | 'declarationId' | 'createdAt'>) => void;
}

export const AddIBKBModal: React.FC<AddIBKBModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onSaveIBKB,
}) => {
  if (!isOpen || !declaration) return null;

  const [ibkbNo, setIbkbNo] = useState('İBKB-2026-TR-' + Math.floor(10000 + Math.random() * 90000));
  const [bankName, setBankName] = useState('Türkiye İş Bankası');
  const [bankBranch, setBankBranch] = useState('Ticari Şube');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<Currency>(declaration.currency);
  const [amount, setAmount] = useState<number>(declaration.remainingAmount);
  const [exchangeRate, setExchangeRate] = useState<number>(declaration.exchangeRateToTRY || 33.50);
  const [tcmbSaleRateUsed, setTcmbSaleRateUsed] = useState<number>(declaration.tcmbMandatorySaleRate || 30);
  const [notes, setNotes] = useState('');

  // Computed TCMB Sale Amount
  const computedTcmbSoldAmount = Number(((amount * tcmbSaleRateUsed) / 100).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('İBKB tutarı 0\'dan büyük olmalıdır.');
      return;
    }

    onSaveIBKB(declaration.id, {
      ibkbNo: ibkbNo.trim().toUpperCase(),
      bankName,
      bankBranch,
      documentDate,
      currency,
      amount: Number(amount),
      convertedAmountInDeclarationCurrency: Number(amount), // assuming same currency or parity 1.0 for simplicity
      exchangeRate: Number(exchangeRate),
      tcmbSoldAmount: computedTcmbSoldAmount,
      tcmbSaleRateUsed,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">İBKB / DAB KAPATMA BELGESİ BAĞLA</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {declaration.declarationNo} ({formatCurrency(declaration.remainingAmount, declaration.currency)} Açık)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">Kapanacak Beyanname Tutarı:</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {formatCurrency(declaration.amount, declaration.currency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">Mevcut Açık Bakiye:</div>
              <div className="text-sm font-black text-amber-600 mt-0.5">
                {formatCurrency(declaration.remainingAmount, declaration.currency)}
              </div>
            </div>
          </div>

          {/* IBKB Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                İBKB / Belge Numarası*
              </label>
              <input
                type="text"
                required
                value={ibkbNo}
                onChange={(e) => setIbkbNo(e.target.value.toUpperCase())}
                placeholder="İBKB-2026-TR-88120"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Belge Düzenlenme Tarihi*
              </label>
              <input
                type="date"
                required
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Bank & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Düzenleyen Banka*
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="Türkiye İş Bankası">Türkiye İş Bankası</option>
                <option value="Ziraat Bankası">Ziraat Bankası</option>
                <option value="Garanti BBVA">Garanti BBVA</option>
                <option value="Akbank">Akbank</option>
                <option value="Yapı Kredi">Yapı Kredi</option>
                <option value="QNB Finansbank">QNB Finansbank</option>
                <option value="VakıfBank">VakıfBank</option>
                <option value="Halkbank">Halkbank</option>
                <option value="DenizBank">DenizBank</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Banka Şubesi
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="Örn: Kadıköy Ticari"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* IBKB Amount & TCMB Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Kapatılan İBKB Tutarı*
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-black focus:border-indigo-600 focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="TRY">TRY</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.01}
                  max={declaration.remainingAmount * 1.05} // allows 5% tolerance
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="col-span-2 bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-black text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                TCMB Satış Oranı (%)
              </label>
              <select
                value={tcmbSaleRateUsed}
                onChange={(e) => setTcmbSaleRateUsed(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              >
                <option value={30}>%30 Zorunlu TCMB Satışı</option>
                <option value={40}>%40 Zorunlu TCMB Satışı</option>
                <option value={0}>%0 (Muafiyet)</option>
              </select>
            </div>
          </div>

          {/* Automatic Calculation Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
            <div>
              <span className="font-extrabold uppercase tracking-wider text-[11px] text-emerald-700">TCMB'ye Satılan Otomatik Döviz Tutar:</span>
              <div className="text-xs font-black text-emerald-950 mt-0.5">
                {formatCurrency(computedTcmbSoldAmount, currency)} (%{tcmbSaleRateUsed} Hesaplama)
              </div>
            </div>
            <div className="text-right">
              <span className="font-extrabold uppercase tracking-wider text-[11px] text-emerald-700">Kapanış Sonrası Bakiye:</span>
              <div className="text-xs font-black text-slate-900 mt-0.5">
                {formatCurrency(Math.max(0, declaration.remainingAmount - amount), currency)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              İBKB Açıklama ve Dekont Notu
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Swift ref no veya dekont sıra no..."
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-100 flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>İBKB BELGESİNİ BAĞLA & KAPAT</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
