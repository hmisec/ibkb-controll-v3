import React from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Printer, 
  Plus, 
  History,
  DollarSign,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { Declaration } from '../types';
import { formatCurrency, getDeadlineDateStr } from '../utils/exportCalculations';

interface DeclarationDetailModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onAddIBKB: (declaration: Declaration) => void;
  onRequestExtension: (declaration: Declaration) => void;
  onApplyTerkin: (declaration: Declaration) => void;
  onGeneratePetition: (declaration: Declaration) => void;
}

export const DeclarationDetailModal: React.FC<DeclarationDetailModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onAddIBKB,
  onRequestExtension,
  onApplyTerkin,
  onGeneratePetition,
}) => {
  if (!isOpen || !declaration) return null;

  const daysLeft = declaration.daysLeft;
  const isClosed = declaration.status === 'CLOSED' || declaration.status === 'WAIVED';
  const deadlineStr = getDeadlineDateStr(declaration.closingDate, declaration.hasExtension);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black font-mono text-slate-900">{declaration.declarationNo}</h3>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isClosed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {declaration.status}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {declaration.customsOffice} • TESCİL: {declaration.registrationDate}
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

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Top Key Indicator Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block font-black uppercase tracking-wider text-[11px]">Toplam FOB İhracat:</span>
              <span className="text-base font-black text-slate-900">
                {formatCurrency(declaration.amount, declaration.currency)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-black uppercase tracking-wider text-[11px]">Kapatılan Tutar:</span>
              <span className="text-base font-black text-emerald-700">
                {formatCurrency(declaration.closedAmount, declaration.currency)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-black uppercase tracking-wider text-[11px]">Kalan Açık Bakiye:</span>
              <span className="text-base font-black text-amber-700">
                {formatCurrency(declaration.remainingAmount, declaration.currency)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block font-black uppercase tracking-wider text-[11px]">180 Günlük Yasal Süre:</span>
              <span className={`text-base font-black ${daysLeft <= 15 ? 'text-red-600' : 'text-slate-900'}`}>
                {isClosed ? 'TAMAMLANDI' : `${daysLeft} GÜN KALDI`}
              </span>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Son Tarih: {deadlineStr}</div>
            </div>
          </div>

          {/* Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-700 font-black uppercase tracking-wider mr-2 text-xs">Hızlı Aksiyonlar:</span>
            
            {declaration.remainingAmount > 0 && (
              <button
                onClick={() => { onClose(); onAddIBKB(declaration); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-100 transition"
              >
                <Plus className="w-4 h-4" />
                <span>İBKB Kapatma Ekle</span>
              </button>
            )}

            {declaration.remainingAmount > 0 && !declaration.hasExtension && (
              <button
                onClick={() => { onClose(); onRequestExtension(declaration); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition"
              >
                <Clock className="w-4 h-4" />
                <span>+90 Gün Ek Süre Kaydet</span>
              </button>
            )}

            {declaration.remainingAmount > 0 && (
              <button
                onClick={() => { onClose(); onApplyTerkin(declaration); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>$30K Terkin Uygula</span>
              </button>
            )}

            <button
              onClick={() => { onClose(); onGeneratePetition(declaration); }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-300 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Banka Dilekçesi Yazdır</span>
            </button>
          </div>

          {/* Declaration Metadata Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide text-xs">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Firma & Varış Detayları
              </h4>
              <div className="space-y-2 text-slate-700 font-bold">
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">İhracatçı:</span> {declaration.exporterTitle} ({declaration.exporterTaxNo})</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Alıcı Firma:</span> {declaration.importerTitle}</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Varış Ülkesi:</span> {declaration.destinationCountry}</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Gümrük İdaresi:</span> {declaration.customsOffice}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Finansal & TCMB Şartları
              </h4>
              <div className="space-y-2 text-slate-700 font-bold">
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Ödeme Şekli:</span> {declaration.paymentMethod}</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Teslim Şekli:</span> {declaration.incoterm}</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Gümrük Kuru:</span> {declaration.exchangeRateToTRY} TRY</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">TCMB Satış Şartı (%):</span> %{declaration.tcmbMandatorySaleRate} ({formatCurrency(declaration.tcmbMandatoryAmount, declaration.currency)})</div>
                <div><span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">Gerçekleşen TCMB Satışı:</span> {formatCurrency(declaration.tcmbSoldAmount, declaration.currency)}</div>
              </div>
            </div>
          </div>

          {/* Linked IBKB Records Section */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
            <h4 className="font-black text-slate-900 mb-3 flex items-center justify-between uppercase tracking-wide text-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                İlişkili İBKB / DAB Belgeleri ({declaration.ibkbRecords.length})
              </span>
            </h4>

            {declaration.ibkbRecords.length === 0 ? (
              <div className="text-slate-400 py-4 text-center italic font-bold">
                Bu beyannameye henüz bağlı İBKB belgesi bulunmamaktadır.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">İBKB No</th>
                      <th className="py-2.5 px-3">Banka & Şube</th>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3 text-right">Tutar</th>
                      <th className="py-2.5 px-3 text-right">TCMB Satış Tutarı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {declaration.ibkbRecords.map((ibkb) => (
                      <tr key={ibkb.id} className="hover:bg-slate-100/80">
                        <td className="py-2.5 px-3 font-mono font-black text-slate-900">{ibkb.ibkbNo}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">{ibkb.bankName} - {ibkb.bankBranch}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">{ibkb.documentDate}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                          {formatCurrency(ibkb.amount, ibkb.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono font-bold">
                          {formatCurrency(ibkb.tcmbSoldAmount, ibkb.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {declaration.notes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700">
              <span className="font-black text-slate-900 block mb-1 uppercase tracking-wider text-xs">Açıklama & Notlar:</span>
              <p className="text-slate-600 font-medium">{declaration.notes}</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
