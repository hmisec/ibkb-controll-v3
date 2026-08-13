import React, { useState } from 'react';
import { X, Save, Sparkles, Building2, Calendar, FileText, Globe } from 'lucide-react';
import { Declaration, PaymentMethod, Incoterm, Currency } from '../types';
import { validateDeclarationNumber } from '../utils/exportCalculations';

interface NewDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDeclaration: Omit<Declaration, 'id' | 'daysLeft' | 'riskLevel' | 'closedAmount' | 'remainingAmount' | 'ibkbRecords' | 'createdAt' | 'updatedAt'>) => void;
  onAiFillTrigger?: () => void;
}

export const NewDeclarationModal: React.FC<NewDeclarationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAiFillTrigger,
}) => {
  if (!isOpen) return null;

  const [declarationNo, setDeclarationNo] = useState('24340100EX00' + Math.floor(1000 + Math.random() * 9000));
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporterTitle, setExporterTitle] = useState('');
  const [exporterTaxNo, setExporterTaxNo] = useState('');
  const [importerTitle, setImporterTitle] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Almanya');
  const [customsOffice, setCustomsOffice] = useState('Erenköy Gümrük Müdürlüğü');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MAL_MUKABILI');
  const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState<number>(50000);
  const [exchangeRateToTRY, setExchangeRateToTRY] = useState<number>(33.50);
  const [tcmbMandatorySaleRate, setTcmbMandatorySaleRate] = useState<number>(30);
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

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

    const deadlineDate = new Date(closingDate);
    deadlineDate.setDate(deadlineDate.getDate() + 180);

    onSave({
      declarationNo: declarationNo.trim().toUpperCase(),
      registrationDate,
      closingDate,
      deadlineDate: deadlineDate.toISOString().split('T')[0],
      hasExtension: false,
      exporterTitle,
      exporterTaxNo,
      importerTitle,
      destinationCountry,
      customsOffice,
      paymentMethod,
      incoterm,
      currency,
      amount: Number(amount),
      exchangeRateToTRY: Number(exchangeRateToTRY),
      tcmbMandatorySaleRate: Number(tcmbMandatorySaleRate),
      tcmbMandatoryAmount: (amount * tcmbMandatorySaleRate) / 100,
      tcmbSoldAmount: 0,
      status: 'ACTIVE',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">YENİ İHRACAT BEYANNAMESİ EKLE</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">180 Günlük yasal İBKB takip saatini başlatır</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onAiFillTrigger && (
              <button
                type="button"
                onClick={onAiFillTrigger}
                className="text-xs font-black uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                title="Yapay Zeka Evrak Metninden Otomatik Doldur"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI İLE DOLDUR</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold uppercase tracking-wider">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Declaration Number & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Beyanname No (16 Haneli)*
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={declarationNo}
                onChange={(e) => setDeclarationNo(e.target.value.toUpperCase())}
                placeholder="24340100EX001842"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Tescil Tarihi
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
                Fiili İntaç / Kapanma Tarihi*
              </label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] font-bold uppercase text-indigo-600 block mt-1">
                *180 günlük yasal süre bu tarihten başlar
              </span>
            </div>
          </div>

          {/* Exporter & Importer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                İhracatçı Firma Unvanı & VKN
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={exporterTitle}
                  onChange={(e) => setExporterTitle(e.target.value)}
                  className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
                <input
                  type="text"
                  value={exporterTaxNo}
                  onChange={(e) => setExporterTaxNo(e.target.value)}
                  placeholder="VKN"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Alıcı Firma & Varış Ülkesi*
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  required
                  value={importerTitle}
                  onChange={(e) => setImporterTitle(e.target.value)}
                  placeholder="Örn: Berlin Trading GmbH"
                  className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
                <input
                  type="text"
                  required
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="Ülke"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Customs Office & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Gümrük İdaresi
              </label>
              <select
                value={customsOffice}
                onChange={(e) => setCustomsOffice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="Erenköy Gümrük Müdürlüğü">Erenköy Gümrük Müd.</option>
                <option value="Ambarlı Gümrük Müdürlüğü">Ambarlı Gümrük Müd.</option>
                <option value="Muratbey Gümrük Müdürlüğü">Muratbey Gümrük Müd.</option>
                <option value="İzmir Gümrük Müdürlüğü">İzmir Gümrük Müd.</option>
                <option value="Mersin Gümrük Müdürlüğü">Mersin Gümrük Müd.</option>
                <option value="Sabiha Gökçen Gümrük Müdürlüğü">Sabiha Gökçen Gümrük Müd.</option>
                <option value="Diğer">Diğer Gümrük Şubesi</option>
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
                <option value="PESIN">Peşin Ödeme</option>
                <option value="MAL_MUKABILI">Mal Mukabili</option>
                <option value="VESAIK_MUKABILI">Vesaik Mukabili</option>
                <option value="AKREDITIF">Akreditifli</option>
                <option value="KABUL_KREDILI">Kabul Kredili</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Teslim Şekli (Incoterm)
              </label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
              >
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="EXW">EXW</option>
                <option value="CFR">CFR</option>
                <option value="DDP">DDP</option>
                <option value="FCA">FCA</option>
              </select>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Döviz Cinsi & Tutar*
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-black focus:border-indigo-600 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
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
                  className="col-span-2 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-black focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                TCMB Gösterge Kuru (TRY)
              </label>
              <input
                type="number"
                step="0.01"
                value={exchangeRateToTRY}
                onChange={(e) => setExchangeRateToTRY(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                TCMB Zorunlu Satış Oranı (%)
              </label>
              <select
                value={tcmbMandatorySaleRate}
                onChange={(e) => setTcmbMandatorySaleRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:outline-none"
              >
                <option value={30}>%30 Zorunlu Satış</option>
                <option value={40}>%40 Zorunlu Satış</option>
                <option value={0}>%0 Muaf (Hizmet/İstisna)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Notlar ve Özel Açıklama
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sipariş no, sevkiyat detayları veya özel banka notları..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
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
              <Save className="w-4 h-4" />
              <span>BEYANNAMEYİ KAYDET & TAKİP ET</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
