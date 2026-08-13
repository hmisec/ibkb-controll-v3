import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Building2, Calendar, FileText, Globe, AlertCircle } from 'lucide-react';
import { Declaration, PaymentMethod, Incoterm, Currency } from '../types';
import { validateDeclarationNumber } from '../utils/exportCalculations';

interface EditDeclarationModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onSaveEdit: (updatedDec: Declaration) => void;
}

export const EditDeclarationModal: React.FC<EditDeclarationModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onSaveEdit,
}) => {
  if (!isOpen || !declaration) return null;

  const [declarationNo, setDeclarationNo] = useState(declaration.declarationNo);
  const [registrationDate, setRegistrationDate] = useState(declaration.registrationDate);
  const [closingDate, setClosingDate] = useState(declaration.closingDate);
  const [exporterTitle, setExporterTitle] = useState(declaration.exporterTitle || 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.');
  const [exporterTaxNo, setExporterTaxNo] = useState(declaration.exporterTaxNo || '3960817425');
  const [importerTitle, setImporterTitle] = useState(declaration.importerTitle);
  const [destinationCountry, setDestinationCountry] = useState(declaration.destinationCountry);
  const [customsOffice, setCustomsOffice] = useState(declaration.customsOffice);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(declaration.paymentMethod);
  const [incoterm, setIncoterm] = useState<Incoterm>(declaration.incoterm);
  const [currency, setCurrency] = useState<Currency>(declaration.currency);
  const [amount, setAmount] = useState<number>(declaration.amount);
  const [exchangeRateToTRY, setExchangeRateToTRY] = useState<number>(declaration.exchangeRateToTRY || 33.50);
  const [tcmbMandatorySaleRate, setTcmbMandatorySaleRate] = useState<number>(declaration.tcmbMandatorySaleRate || 30);
  const [invoiceNo, setInvoiceNo] = useState(declaration.invoiceNo || '');
  const [dovizAccountNo, setDovizAccountNo] = useState(declaration.dovizAccountNo || 'TR33 0011 1000 0000 9876 5432 10');
  const [tlAccountNo, setTlAccountNo] = useState(declaration.tlAccountNo || 'TR12 0011 1000 0000 1234 5678 90');
  const [signerName, setSignerName] = useState(declaration.signerName || 'AHMET YILMAZ');
  const [signerTitle, setSignerTitle] = useState(declaration.signerTitle || 'İHRACAT OPERASYON MÜDÜRÜ');
  const [notes, setNotes] = useState(declaration.notes || '');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (declaration) {
      setDeclarationNo(declaration.declarationNo);
      setRegistrationDate(declaration.registrationDate);
      setClosingDate(declaration.closingDate);
      setExporterTitle(declaration.exporterTitle || 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.');
      setExporterTaxNo(declaration.exporterTaxNo || '3960817425');
      setImporterTitle(declaration.importerTitle);
      setDestinationCountry(declaration.destinationCountry);
      setCustomsOffice(declaration.customsOffice);
      setPaymentMethod(declaration.paymentMethod);
      setIncoterm(declaration.incoterm);
      setCurrency(declaration.currency);
      setAmount(declaration.amount);
      setExchangeRateToTRY(declaration.exchangeRateToTRY || 33.50);
      setTcmbMandatorySaleRate(declaration.tcmbMandatorySaleRate || 30);
      setInvoiceNo(declaration.invoiceNo || 'FT-2026-' + Math.floor(10000 + Math.random() * 90000));
      setDovizAccountNo(declaration.dovizAccountNo || 'TR33 0011 1000 0000 9876 5432 10');
      setTlAccountNo(declaration.tlAccountNo || 'TR12 0011 1000 0000 1234 5678 90');
      setSignerName(declaration.signerName || 'AHMET YILMAZ');
      setSignerTitle(declaration.signerTitle || 'İHRACAT OPERASYON MÜDÜRÜ');
      setNotes(declaration.notes || '');
      setErrorMsg('');
    }
  }, [declaration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fmtCheck = validateDeclarationNumber(declarationNo);
    if (!fmtCheck.isValid) {
      setErrorMsg(fmtCheck.message || 'Geçersiz Beyanname No');
      return;
    }

    if (!importerTitle.trim()) {
      setErrorMsg('Alıcı Firma Ünvanı girilmelidir.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Tutar 0\'dan büyük olmalıdır.');
      return;
    }

    const numAmount = Number(amount);
    const numClosed = Number((declaration.closedAmount || 0).toFixed(2));
    const numTerkin = Number((declaration.terkinAmount || 0).toFixed(2));
    const rawRem = Number((numAmount - numClosed - numTerkin).toFixed(2));
    const newRemaining = rawRem <= 0.01 ? 0 : rawRem;

    const deadlineDate = new Date(closingDate);
    const daysAdd = declaration.hasExtension ? 270 : 180;
    deadlineDate.setDate(deadlineDate.getDate() + daysAdd);

    const updated: Declaration = {
      ...declaration,
      declarationNo: declarationNo.trim().toUpperCase(),
      registrationDate,
      closingDate,
      deadlineDate: deadlineDate.toISOString().split('T')[0],
      exporterTitle,
      exporterTaxNo,
      importerTitle,
      destinationCountry,
      customsOffice,
      paymentMethod,
      incoterm,
      currency,
      amount: numAmount,
      closedAmount: numClosed,
      remainingAmount: newRemaining,
      exchangeRateToTRY: Number(exchangeRateToTRY),
      tcmbMandatorySaleRate: Number(tcmbMandatorySaleRate),
      tcmbMandatoryAmount: Number(((numAmount * tcmbMandatorySaleRate) / 100).toFixed(2)),
      invoiceNo,
      dovizAccountNo,
      tlAccountNo,
      signerName,
      signerTitle,
      notes,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onSaveEdit(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                BEYANNAME BİLGİLERİNİ DÜZENLE
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {declaration.declarationNo} kaydını güncelleyin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Declaration Number & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Gümrük Beyanname No*
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={declarationNo}
                onChange={(e) => setDeclarationNo(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Tescil Tarihi*
              </label>
              <input
                type="date"
                required
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Fiili İhracat (İntaç)*
              </label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Exporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                İhracatçı Firma Ünvanı (Int. Ltd. Şti.)
              </label>
              <input
                type="text"
                value={exporterTitle}
                onChange={(e) => setExporterTitle(e.target.value)}
                placeholder="GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                İhracatçı VKN / TCKN
              </label>
              <input
                type="text"
                value={exporterTaxNo}
                onChange={(e) => setExporterTaxNo(e.target.value)}
                placeholder="3960817425"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Importer Info & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Alıcı (İthalatçı) Firma Ünvanı*
              </label>
              <input
                type="text"
                required
                value={importerTitle}
                onChange={(e) => setImporterTitle(e.target.value)}
                placeholder="BERLIN TRADING GMBH"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Varış Ülkesi & Gümrük İdaresi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="Almanya"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
                <input
                  type="text"
                  required
                  value={customsOffice}
                  onChange={(e) => setCustomsOffice(e.target.value)}
                  placeholder="Erenköy Gümrük"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Currency, Amount, Exchange Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Döviz Cinsi & Tutar (Küsüratlı)*
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
                  <option value="CHF">CHF</option>
                  <option value="RUB">RUB</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.01}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="col-span-2 bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-black text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Tescil Kuru (TL)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={exchangeRateToTRY}
                onChange={(e) => setExchangeRateToTRY(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                TCMB Satış Oranı (%)
              </label>
              <select
                value={tcmbMandatorySaleRate}
                onChange={(e) => setTcmbMandatorySaleRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              >
                <option value={30}>%30 Zorunlu Satış</option>
                <option value={40}>%40 Zorunlu Satış</option>
                <option value={0}>%0 (Muaf / İstisna)</option>
              </select>
            </div>
          </div>

          {/* Incoterm & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Teslim Şekli (Incoterm)
              </label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="FOB">FOB - Free On Board</option>
                <option value="CIF">CIF - Cost, Insurance & Freight</option>
                <option value="EXW">EXW - Ex Works</option>
                <option value="CFR">CFR - Cost and Freight</option>
                <option value="FCA">FCA - Free Carrier</option>
                <option value="DDP">DDP - Delivered Duty Paid</option>
                <option value="CPT">CPT - Carriage Paid To</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Ödeme Şekli
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="MAL_MUKABILI">Mal Mukabili Ödeme</option>
                <option value="PESIN">Peşin Ödeme</option>
                <option value="VESAIK_MUKABILI">Vesaik Mukabili Ödeme</option>
                <option value="AKREDITIF">Akreditifli Ödeme</option>
                <option value="KABUL_KREDILI">Kabul Kredili Ödeme</option>
              </select>
            </div>
          </div>

          {/* Bank Accounts & Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
            <div>
              <label className="block text-purple-900 font-black text-xs uppercase tracking-wider mb-1">
                Fatura No
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Örn: FT-2026-10293"
                className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-purple-600 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-purple-900 font-black text-xs uppercase tracking-wider mb-1">
                Döviz Hesap / IBAN
              </label>
              <input
                type="text"
                value={dovizAccountNo}
                onChange={(e) => setDovizAccountNo(e.target.value)}
                placeholder="TR33 ..."
                className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-purple-600 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-purple-900 font-black text-xs uppercase tracking-wider mb-1">
                TL Hesap / IBAN
              </label>
              <input
                type="text"
                value={tlAccountNo}
                onChange={(e) => setTlAccountNo(e.target.value)}
                placeholder="TR12 ..."
                className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-purple-600 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Özel Notlar / Açıklamalar
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İhracat beyannamesine ilişkin ek not veya hatırlatmalar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200"
            >
              İPTAL
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-100 flex items-center space-x-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>DEĞİŞİKLİKLERİ KAYDET</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
