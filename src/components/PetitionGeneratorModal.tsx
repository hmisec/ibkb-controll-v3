import React, { useRef } from 'react';
import { X, Printer, Download, FileText, Building2 } from 'lucide-react';
import { Declaration } from '../types';
import { formatCurrency, getDeadlineDateStr } from '../utils/exportCalculations';

interface PetitionGeneratorModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
}

export const PetitionGeneratorModal: React.FC<PetitionGeneratorModalProps> = ({
  isOpen,
  declaration,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !declaration) return null;

  const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const deadlineStr = getDeadlineDateStr(declaration.closingDate, false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">RESMİ BANKA EK SÜRE DİLEKÇESİ YAZDIR</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{declaration.declarationNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-100 transition"
            >
              <Printer className="w-4 h-4" />
              <span>YAZDIR / PDF KAYDET</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letter Body */}
        <div className="p-6 overflow-y-auto bg-slate-50 text-slate-900 flex-1">
          <div ref={printRef} className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl font-serif text-sm leading-relaxed max-w-xl mx-auto border border-slate-200 print:shadow-none print:p-0 print:border-none">
            
            {/* Letterhead */}
            <div className="text-center font-black border-b border-slate-200 pb-4 mb-6">
              <div className="text-base tracking-wide uppercase">{declaration.exporterTitle || 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.'}</div>
              <div className="text-xs font-sans text-slate-500 font-bold mt-1 uppercase tracking-wider">
                Vergi Kimlik No: {declaration.exporterTaxNo || '3960817425'} • İhracat Departmanı
              </div>
            </div>

            <div className="text-right font-sans text-xs text-slate-500 mb-6 font-bold uppercase tracking-wider">
              Tarih: {todayStr}
            </div>

            <div className="text-center font-black text-base mb-6 tracking-wide uppercase">
              TÜRKİYE İŞ BANKASI A.Ş.<br />
              <span className="text-sm font-bold text-slate-700">KADIKÖY TİCARİ ŞUBESİ MÜDÜRLÜĞÜ’NE</span>
            </div>

            <div className="space-y-4 text-justify font-sans text-xs text-slate-800 font-medium">
              <p>
                <strong className="font-black uppercase">Konu:</strong> {declaration.declarationNo} Nolu Gümrük Beyannamesi İçin TCMB İhracat Genelgesi Madde 8 Uyarınca +90 Gün Ek Süre Talebi Hk.
              </p>

              <p>
                Şirketimiz tarafından gerçekleştirilen ve detayları aşağıda yer alan ihracat işlemine ilişkin bedelin yurda getirilerek İBKB (İhracat Bedeli Kabul Belgesi) veya DAB'a bağlanması süreci devam etmektedir.
              </p>

              {/* Table details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden my-4 shadow-2xs">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50">
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider w-2/5">Gümrük Beyanname No:</td>
                      <td className="py-2 px-3 font-mono font-black text-slate-900">{declaration.declarationNo}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Fiili İntaç Tarihi:</td>
                      <td className="py-2 px-3 font-bold">{declaration.closingDate}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Alıcı Firma & Ülke:</td>
                      <td className="py-2 px-3 font-bold">{declaration.importerTitle} ({declaration.destinationCountry})</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Toplam İhracat Tutarı:</td>
                      <td className="py-2 px-3 font-black text-slate-900">{formatCurrency(declaration.amount, declaration.currency)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Açık Kapama Bekleyen Tutar:</td>
                      <td className="py-2 px-3 font-black text-red-700">{formatCurrency(declaration.remainingAmount, declaration.currency)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Mevcut 180 Günlük Son Tarih:</td>
                      <td className="py-2 px-3 font-black text-slate-900">{deadlineStr}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Yurtdışı alıcı firmanın finansal operasyonel takvimi ve uluslararası banka transfer süreçlerindeki dönemsel gecikmeler (haklı sebep) nedeniyle ihracat bedelinin tahsilatı devam etmektedir.
              </p>

              <p>
                TCMB İhracat Genelgesi'nin 8. maddesi uyarınca, beyanname kapanış süremizin dolmasına mahal vermeden tarafımıza <strong>+90 (doksan) gün ek süre</strong> tanınmasını ve gerekli sistem onaylarının yapılmasını saygılarımızla arz ve talep ederiz.
              </p>
            </div>

            {/* Signatures */}
            <div className="mt-12 flex justify-between font-sans text-xs">
              <div className="text-center">
                <div className="font-extrabold text-slate-700 uppercase tracking-wider">Ekler:</div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">1. Gümrük Beyannamesi Örneği<br />2. Swift / Yurt Dışı Yazışma Örneği</div>
              </div>
              <div className="text-center font-black">
                <div>{declaration.exporterTitle}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Şirket Yetkilisi İmza / Kaşe</div>
                <div className="mt-10 border-b border-slate-300 w-36 mx-auto"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
