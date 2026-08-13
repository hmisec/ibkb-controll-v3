import React from 'react';
import { 
  Declaration, 
  DeclarationStatus, 
  RiskLevel 
} from '../types';
import { 
  formatCurrency, 
  getDeadlineDateStr 
} from '../utils/exportCalculations';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  FileText, 
  Sparkles, 
  MoreVertical, 
  Calendar,
  Building2,
  FileCheck,
  ShieldAlert,
  Printer
} from 'lucide-react';

interface DeclarationTableProps {
  declarations: Declaration[];
  onSelectDeclaration: (declaration: Declaration) => void;
  onAddIBKB: (declaration: Declaration) => void;
  onRequestExtension: (declaration: Declaration) => void;
  onApplyTerkin: (declaration: Declaration) => void;
  onGeneratePetition: (declaration: Declaration) => void;
}

export const DeclarationTable: React.FC<DeclarationTableProps> = ({
  declarations,
  onSelectDeclaration,
  onAddIBKB,
  onRequestExtension,
  onApplyTerkin,
  onGeneratePetition,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest border-b border-slate-200">
              <th className="py-4 px-4">Beyanname No</th>
              <th className="py-4 px-4">İntaç (Kapanma) Tarihi</th>
              <th className="py-4 px-4">180 Gün Yasal Süre / Kalan Gün</th>
              <th className="py-4 px-4">Alıcı Firma & Ülke</th>
              <th className="py-4 px-4 text-right">Toplam Tutar</th>
              <th className="py-4 px-4 text-right">Açık Bakiye</th>
              <th className="py-4 px-4 text-center">Durum</th>
              <th className="py-4 px-4 text-center">İşlemler</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {declarations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-700">Kayıtlı Beyanname Bulunamadı</p>
                    <p className="text-xs text-slate-400">Filtre kriterlerinize uygun beyanname veya İBKB kaydı yok.</p>
                  </div>
                </td>
              </tr>
            ) : (
              declarations.map((dec) => {
                const daysLeft = dec.daysLeft;
                const isClosed = dec.status === 'CLOSED' || dec.status === 'WAIVED';
                const deadlineStr = getDeadlineDateStr(dec.closingDate, dec.hasExtension);

                // Risk Badge styling
                let riskBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                let riskIcon = <Clock className="w-3.5 h-3.5" />;
                
                if (isClosed) {
                  riskBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  riskIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                } else if (daysLeft < 0) {
                  riskBadgeClass = 'bg-red-100 text-red-800 border-red-200 animate-pulse';
                  riskIcon = <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
                } else if (daysLeft <= 15) {
                  riskBadgeClass = 'bg-red-100 text-red-800 border-red-200';
                  riskIcon = <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
                } else if (daysLeft <= 45) {
                  riskBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                  riskIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
                } else {
                  riskBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  riskIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                }

                // Progress percentage for 180-day clock (0 to 100%)
                const totalAllowedDays = dec.hasExtension ? 270 : 180;
                const elapsedDays = Math.max(0, totalAllowedDays - Math.max(0, daysLeft));
                const progressPct = Math.min(100, Math.round((elapsedDays / totalAllowedDays) * 100));

                return (
                  <tr 
                    key={dec.id} 
                    className="hover:bg-slate-50/80 transition group"
                  >
                    
                    {/* Beyanname No */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectDeclaration(dec)}
                          className="hover:text-indigo-600 transition underline underline-offset-4 decoration-slate-300 font-extrabold text-sm"
                        >
                          {dec.declarationNo}
                        </button>
                        {dec.hasExtension && (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-200" title="90 Gün Ek Süre Alındı">
                            +90 GÜN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-sans font-medium text-slate-400 mt-0.5">
                        {dec.customsOffice}
                      </div>
                    </td>

                    {/* Intac Date */}
                    <td className="py-4 px-4 text-slate-700 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dec.closingDate || 'Belirtilmedi'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Tescil: {dec.registrationDate}
                      </div>
                    </td>

                    {/* 180-Day Countdown Clock */}
                    <td className="py-4 px-4 whitespace-nowrap min-w-[200px]">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className={`inline-flex items-center space-x-1 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${riskBadgeClass}`}>
                          {riskIcon}
                          <span>
                            {isClosed ? (
                              'Kapandı'
                            ) : daysLeft < 0 ? (
                              `${Math.abs(daysLeft)} GÜN AŞIM (RİSK)`
                            ) : (
                              `${daysLeft} GÜN KALDI`
                            )}
                          </span>
                        </span>
                        {!isClosed && (
                          <span className="text-[10px] font-bold text-slate-400">
                            Son: {deadlineStr}
                          </span>
                        )}
                      </div>

                      {/* Timeline Bar */}
                      {!isClosed && (
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              daysLeft < 0
                                ? 'bg-red-600'
                                : daysLeft <= 15
                                ? 'bg-red-500'
                                : daysLeft <= 45
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Importer & Country */}
                    <td className="py-4 px-4 max-w-[180px]">
                      <div className="font-bold text-slate-900 truncate" title={dec.importerTitle}>
                        {dec.importerTitle}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 truncate">
                        {dec.destinationCountry} • {dec.paymentMethod}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      <div>{formatCurrency(dec.amount, dec.currency)}</div>
                      <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                        FOB ({dec.incoterm})
                      </div>
                    </td>

                    {/* Open Remaining Amount */}
                    <td className="py-4 px-4 text-right font-mono font-black text-sm whitespace-nowrap">
                      <div className={dec.remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        {formatCurrency(dec.remainingAmount, dec.currency)}
                      </div>
                      {dec.closedAmount > 0 && (
                        <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                          Kapalı: {formatCurrency(dec.closedAmount, dec.currency)}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                        dec.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : dec.status === 'WAIVED'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : dec.status === 'PARTIAL'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : dec.status === 'EXTENDED'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : dec.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {dec.status === 'CLOSED' && 'TAM KAPALI'}
                        {dec.status === 'WAIVED' && 'TERKİN (MUAF)'}
                        {dec.status === 'PARTIAL' && 'KISMİ KAPALI'}
                        {dec.status === 'EXTENDED' && '+90 GÜN EK SÜRE'}
                        {dec.status === 'OVERDUE' && 'SÜRESİ DOLMUŞ'}
                        {dec.status === 'ACTIVE' && 'AÇIK (İBKB BEKLİYOR)'}
                        {dec.status === 'DRAFT' && 'TASLAK'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        
                        {/* Add İBKB */}
                        {dec.remainingAmount > 0 && (
                          <button
                            onClick={() => onAddIBKB(dec)}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition shadow-2xs"
                            title="İBKB / DAB Kapatma Ekle"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Extension request */}
                        {dec.remainingAmount > 0 && !dec.hasExtension && (
                          <button
                            onClick={() => onRequestExtension(dec)}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition shadow-2xs"
                            title="90 Gün Ek Süre Kaydı"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        {/* Terkin / Waiver */}
                        {dec.remainingAmount > 0 && (
                          <button
                            onClick={() => onApplyTerkin(dec)}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-2xs"
                            title="30.000 USD Terkin / Muafiyet Kapatması"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}

                        {/* Print Petition */}
                        <button
                          onClick={() => onGeneratePetition(dec)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Banka Ek Süre Dilekçesi Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => onSelectDeclaration(dec)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="Tüm Detayları Gör"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};
