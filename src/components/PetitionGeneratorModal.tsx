import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  FileCheck, 
  Clock, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Table as TableIcon,
  UserCheck,
  Percent,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Declaration } from '../types';
import { formatCurrency, getDeadlineDateStr } from '../utils/exportCalculations';

interface PetitionGeneratorModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  allDeclarations?: Declaration[];
  onClose: () => void;
}

export type PetitionType = 'CLOSING' | 'QNB_MULTI' | 'EXTENSION' | 'TERKIN';

export interface QnbRow {
  id: string;
  declarationNo: string;
  invoiceNo: string;
  declarationDate: string;
  declarationAmountAndCurr: string;
  creditDate: string;
  incomingAmountAndCurr: string;
  referenceNo: string;
  ibkbGbLinkAmount: string;
  dovizAccountNo: string;
  tlAccountNo: string;
}

export const PetitionGeneratorModal: React.FC<PetitionGeneratorModalProps> = ({
  isOpen,
  declaration,
  allDeclarations = [],
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Petition state options
  const [petitionType, setPetitionType] = useState<PetitionType>('QNB_MULTI');
  const [bankName, setBankName] = useState<string>('QNB FİNANSBANK A.Ş.');
  const [bankBranch, setBankBranch] = useState<string>('TİCARİ ŞUBESİ MÜDÜRLÜĞÜ’NE');
  const [customSubject, setCustomSubject] = useState<string>('');

  // QNB Finansbank Specific State
  const [qnbIban, setQnbIban] = useState<string>('TR33 0011 1000 0000 9876 5432 10');
  const [tlIban, setTlIban] = useState<string>('TR12 0011 1000 0000 1234 5678 90');
  const [tcmbRate, setTcmbRate] = useState<string>('30');
  const [qnbRows, setQnbRows] = useState<QnbRow[]>([]);

  // Signature & Company Customization
  const [companyTitle, setCompanyTitle] = useState<string>('GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.');
  const [signerName, setSignerName] = useState<string>('AHMET YILMAZ');
  const [signerTitle, setSignerTitle] = useState<string>('İHRACAT & DİŞ TİCARET OPERASYON MÜDÜRÜ');

  // Accordion state for expanded row editor
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Initialize QNB rows and values when declaration changes
  useEffect(() => {
    if (declaration) {
      if (declaration.exporterTitle) {
        setCompanyTitle(declaration.exporterTitle);
      }
      if (declaration.signerName) {
        setSignerName(declaration.signerName);
      }
      if (declaration.signerTitle) {
        setSignerTitle(declaration.signerTitle);
      }
      if (declaration.dovizAccountNo) {
        setQnbIban(declaration.dovizAccountNo);
      }
      if (declaration.tlAccountNo) {
        setTlIban(declaration.tlAccountNo);
      }

      const initialRow: QnbRow = {
        id: 'qnb-row-1',
        declarationNo: declaration.declarationNo || '',
        invoiceNo: declaration.invoiceNo || ('FT-2026-' + Math.floor(10000 + Math.random() * 90000)),
        declarationDate: declaration.closingDate || new Date().toISOString().substring(0, 10),
        declarationAmountAndCurr: `${declaration.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${declaration.currency}`,
        creditDate: declaration.closingDate || new Date().toISOString().substring(0, 10),
        incomingAmountAndCurr: `${declaration.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${declaration.currency}`,
        referenceNo: 'FT' + Math.floor(1000000000 + Math.random() * 9000000000),
        ibkbGbLinkAmount: `${declaration.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${declaration.currency}`,
        dovizAccountNo: declaration.dovizAccountNo || 'TR33 0011 1000 0000 9876 5432 10',
        tlAccountNo: declaration.tlAccountNo || 'TR12 0011 1000 0000 1234 5678 90',
      };
      setQnbRows([initialRow]);
      setExpandedRowId('qnb-row-1');
    }
  }, [declaration]);

  // Update rows when global IBANs change
  const handleGlobalDovizIbanChange = (newVal: string) => {
    setQnbIban(newVal);
    setQnbRows(prev => prev.map(r => ({ ...r, dovizAccountNo: newVal })));
  };

  const handleGlobalTlIbanChange = (newVal: string) => {
    setTlIban(newVal);
    setQnbRows(prev => prev.map(r => ({ ...r, tlAccountNo: newVal })));
  };

  if (!isOpen || !declaration) return null;

  const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const deadlineStr = getDeadlineDateStr(declaration.closingDate, declaration.hasExtension);

  const handlePrint = () => {
    window.print();
  };

  const handleAddQnbRow = () => {
    const newId = 'qnb-row-' + Date.now();
    const newRow: QnbRow = {
      id: newId,
      declarationNo: '2634' + Math.floor(10000000000000 + Math.random() * 90000000000000),
      invoiceNo: 'FT-2026-' + Math.floor(10000 + Math.random() * 90000),
      declarationDate: new Date().toISOString().substring(0, 10),
      declarationAmountAndCurr: '50.000,00 EUR',
      creditDate: new Date().toISOString().substring(0, 10),
      incomingAmountAndCurr: '50.000,00 EUR',
      referenceNo: 'FT' + Math.floor(1000000000 + Math.random() * 9000000000),
      ibkbGbLinkAmount: '50.000,00 EUR',
      dovizAccountNo: qnbIban,
      tlAccountNo: tlIban,
    };
    setQnbRows((prev) => [...prev, newRow]);
    setExpandedRowId(newId);
  };

  const handleRemoveQnbRow = (id: string) => {
    if (qnbRows.length <= 1) return;
    setQnbRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateQnbRow = (id: string, field: keyof QnbRow, value: string) => {
    setQnbRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Determine Subject and Body based on selected Petition Type
  let defaultSubject = '';
  if (petitionType === 'CLOSING') {
    defaultSubject = `${declaration.declarationNo} Nolu Gümrük Beyannamesine İlişkin İhracat Hesabının İBKB Belgeleri İle Kapatılması Hk.`;
  } else if (petitionType === 'EXTENSION') {
    defaultSubject = `${declaration.declarationNo} Nolu Gümrük Beyannamesi İçin TCMB İhracat Genelgesi Madde 8 Uyarınca +90 Gün Ek Süre Talebi Hk.`;
  } else if (petitionType === 'TERKIN') {
    defaultSubject = `${declaration.declarationNo} Nolu Gümrük Beyannamesinin TCMB İhracat Genelgesi Madde 28 Uyarınca Terkin (%10 / $30K Muafiyet) Kapsamında Kapatılması Hk.`;
  } else if (petitionType === 'QNB_MULTI') {
    defaultSubject = 'İHRACAT ÇOKLU İBKB TALİMATI';
  }

  const activeSubject = customSubject || defaultSubject;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[95vh]">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                RESMİ BANKA DİLEKÇESİ & İBKB TALİMATI
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                BEYANNAME NO: {declaration.declarationNo}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-100 dark:shadow-none transition"
            >
              <Printer className="w-4 h-4" />
              <span>YAZDIR / PDF KAYDET</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition border border-slate-200 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options / Tab Selector & Parameter Form */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-4 max-h-[45vh] overflow-y-auto print:hidden">
          
          {/* Petition Type Radio / Button Tabs */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Dilekçe & Talimat Formatı Seçiniz:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() => setPetitionType('QNB_MULTI')}
                className={`p-2.5 rounded-xl font-extrabold uppercase tracking-wider text-left border transition flex items-center gap-2 ${
                  petitionType === 'QNB_MULTI'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TableIcon className="w-4 h-4 shrink-0" />
                <span>1. QNB Finansbank Çoklu İBKB Talimatı</span>
              </button>

              <button
                type="button"
                onClick={() => { setPetitionType('CLOSING'); setCustomSubject(''); }}
                className={`p-2.5 rounded-xl font-extrabold uppercase tracking-wider text-left border transition flex items-center gap-2 ${
                  petitionType === 'CLOSING'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>2. İBKB Kapatma Dilekçesi (Tekli)</span>
              </button>

              <button
                type="button"
                onClick={() => { setPetitionType('EXTENSION'); setCustomSubject(''); }}
                className={`p-2.5 rounded-xl font-extrabold uppercase tracking-wider text-left border transition flex items-center gap-2 ${
                  petitionType === 'EXTENSION'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>3. +90 Gün Ek Süre Dilekçesi</span>
              </button>

              <button
                type="button"
                onClick={() => { setPetitionType('TERKIN'); setCustomSubject(''); }}
                className={`p-2.5 rounded-xl font-extrabold uppercase tracking-wider text-left border transition flex items-center gap-2 ${
                  petitionType === 'TERKIN'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>4. Terkinli Kapatma Dilekçesi</span>
              </button>

            </div>
          </div>

          {/* General Customization Panel: Signer & Company Details */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>KAŞE / İMZA VE FİRMA BİLGİLERİ (SERBEST DÜZENLEME)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Firma Unvanı (Kaşe Başlığı)
                </label>
                <input
                  type="text"
                  value={companyTitle}
                  onChange={(e) => setCompanyTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-extrabold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  İmza Sahibi Adı Soyadı
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Örn: AHMET YILMAZ"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-extrabold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  İmza Sahibi Unvanı
                </label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  placeholder="Örn: İHRACAT MÜDÜRÜ / ŞİRKET YETKİLİSİ"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-extrabold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* QNB Finansbank Multi-Row Controls */}
          {petitionType === 'QNB_MULTI' && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-black text-purple-900 dark:text-purple-200 uppercase flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>QNB FİNANSBANK İHRAÇAT ÇOKLU İBKB TALİMATI PARAMETRELERİ</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddQnbRow}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] uppercase rounded-xl transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Beyanname Satırı Ekle ({qnbRows.length})</span>
                </button>
              </div>

              {/* Global Accounts & Percent Rate Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-extrabold text-purple-800 dark:text-purple-300 uppercase mb-1">
                    Gelen Bedel Döviz IBAN Hesabı
                  </label>
                  <input
                    type="text"
                    value={qnbIban}
                    onChange={(e) => handleGlobalDovizIbanChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-purple-800 dark:text-purple-300 uppercase mb-1">
                    TL Hesap Numarası / IBAN
                  </label>
                  <input
                    type="text"
                    value={tlIban}
                    onChange={(e) => handleGlobalTlIbanChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-purple-800 dark:text-purple-300 uppercase mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-purple-600" />
                    <span>TCMB Döviz Satış Oranı (%) Serbest Giriş</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tcmbRate}
                      onChange={(e) => setTcmbRate(e.target.value)}
                      placeholder="30"
                      className="w-20 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 font-mono font-black text-purple-700 dark:text-purple-300 text-center"
                    />
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setTcmbRate('30')}
                        className={`px-2 py-1 rounded-lg font-bold border transition ${tcmbRate === '30' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
                      >
                        %30
                      </button>
                      <button
                        type="button"
                        onClick={() => setTcmbRate('40')}
                        className={`px-2 py-1 rounded-lg font-bold border transition ${tcmbRate === '40' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
                      >
                        %40
                      </button>
                      <button
                        type="button"
                        onClick={() => setTcmbRate('0')}
                        className={`px-2 py-1 rounded-lg font-bold border transition ${tcmbRate === '0' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
                      >
                        %0
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Table Rows Details (Expanded Cards for 100% full column editing) */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300 flex items-center justify-between">
                  <span>Sıra Bazlı Tüm Kolon Değerlerini Düzenleyin (10/10 Sütun):</span>
                  <span className="text-slate-400 font-normal">Aşağıdaki alanları değiştirdiğinizde tablo anında güncellenir. Ayrıca sayfa önizlemesindeki tablodan da doğrudan tıklayıp yazabilirsiniz.</span>
                </div>

                {qnbRows.map((row, idx) => {
                  const isExpanded = expandedRowId === row.id;

                  return (
                    <div key={row.id} className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl overflow-hidden transition shadow-2xs">
                      
                      {/* Row Accordion Header */}
                      <div 
                        onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/80 cursor-pointer flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-purple-900/30 transition text-xs"
                      >
                        <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono">{row.declarationNo || 'Beyanname No Boş'}</span>
                          <span className="text-slate-400 font-normal">|</span>
                          <span className="text-slate-600 dark:text-slate-300">Fatura: {row.invoiceNo}</span>
                          <span className="text-slate-400 font-normal">|</span>
                          <span className="text-emerald-600 font-black">{row.incomingAmountAndCurr}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveQnbRow(row.id);
                            }}
                            disabled={qnbRows.length <= 1}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition disabled:opacity-20"
                            title="Satırı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {/* Row Expanded Inputs Grid (All 10 columns) */}
                      {isExpanded && (
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-[11px] bg-white dark:bg-slate-900 border-t border-purple-100 dark:border-purple-900/50">
                          
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              1. Beyanname No (18 Hane)
                            </label>
                            <input
                              type="text"
                              value={row.declarationNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationNo', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              2. Fatura No
                            </label>
                            <input
                              type="text"
                              value={row.invoiceNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'invoiceNo', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              3. Beyanname Tarihi
                            </label>
                            <input
                              type="text"
                              value={row.declarationDate}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationDate', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              4. GB Döviz & Tutar
                            </label>
                            <input
                              type="text"
                              value={row.declarationAmountAndCurr}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationAmountAndCurr', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              5. Bedel Geçiş Tarihi
                            </label>
                            <input
                              type="text"
                              value={row.creditDate}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'creditDate', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              6. Gelen Bedel & Tutar
                            </label>
                            <input
                              type="text"
                              value={row.incomingAmountAndCurr}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'incomingAmountAndCurr', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              7. Gelen Bedel Referans No
                            </label>
                            <input
                              type="text"
                              value={row.referenceNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'referenceNo', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              8. İBKB Bağlantı Tutarı
                            </label>

                            {/* Quick Percentage / Multiplier Helper */}
                            <div className="flex items-center gap-1.5 mb-1 bg-purple-50 dark:bg-purple-950/50 p-1 rounded-lg border border-purple-200 dark:border-purple-800">
                              <span className="text-[10px] font-black text-purple-900 dark:text-purple-300">% Oran:</span>
                              <input
                                type="number"
                                placeholder="Örn: 85"
                                className="w-16 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded px-1.5 py-0.5 font-bold text-[10px] text-purple-900 dark:text-purple-200 focus:outline-none"
                                onChange={(e) => {
                                  const pct = parseFloat(e.target.value);
                                  if (!isNaN(pct)) {
                                    // Extract numeric base from declaration amount or incoming amount
                                    const rawStr = row.declarationAmountAndCurr || row.incomingAmountAndCurr || '';
                                    const matches = rawStr.match(/[\d.,]+/);
                                    if (matches) {
                                      // Convert Turkish format e.g. 10.000,00 -> 10000
                                      const cleanNumStr = matches[0].replace(/\./g, '').replace(',', '.');
                                      const baseAmount = parseFloat(cleanNumStr);
                                      if (!isNaN(baseAmount)) {
                                        const calcVal = (baseAmount * pct) / 100;
                                        const currMatch = rawStr.match(/[A-Z]{3}/) || ['USD'];
                                        const formattedVal = `${calcVal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currMatch[0]}`;
                                        handleUpdateQnbRow(row.id, 'ibkbGbLinkAmount', formattedVal);
                                      }
                                    }
                                  }
                                }}
                              />
                              <span className="text-[9px] font-medium text-purple-700 dark:text-purple-300">
                                (Yazılan %'ye göre tutarı hesaplar)
                              </span>
                            </div>

                            <input
                              type="text"
                              value={row.ibkbGbLinkAmount}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'ibkbGbLinkAmount', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              9. Döviz Hesap / IBAN
                            </label>
                            <input
                              type="text"
                              value={row.dovizAccountNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'dovizAccountNo', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                              10. TL Hesap / IBAN
                            </label>
                            <input
                              type="text"
                              value={row.tlAccountNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'tlAccountNo', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Standard Target Bank Customization Inputs */}
          {petitionType !== 'QNB_MULTI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  İlgili Banka Unvanı
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="TÜRKİYE İŞ BANKASI A.Ş.">TÜRKİYE İŞ BANKASI A.Ş.</option>
                  <option value="T.C. ZİRAAT BANKASI A.Ş.">T.C. ZİRAAT BANKASI A.Ş.</option>
                  <option value="TÜRKİYE GARANTİ BANKASI A.Ş. (GARANTİ BBVA)">TÜRKİYE GARANTİ BANKASI A.Ş. (GARANTİ BBVA)</option>
                  <option value="AKBANK T.A.Ş.">AKBANK T.A.Ş.</option>
                  <option value="YAPI VE KREDİ BANKASI A.Ş.">YAPI VE KREDİ BANKASI A.Ş.</option>
                  <option value="TÜRKİYE HALK BANKASI A.Ş.">TÜRKİYE HALK BANKASI A.Ş.</option>
                  <option value="TÜRKİYE VAKIFLAR BANKASI T.A.O. (VAKIFBANK)">TÜRKİYE VAKIFLAR BANKASI T.A.O. (VAKIFBANK)</option>
                  <option value="QNB FİNANSBANK A.Ş.">QNB FİNANSBANK A.Ş.</option>
                  <option value="KUVEYT TÜRK KATILIM BANKASI A.Ş.">KUVEYT TÜRK KATILIM BANKASI A.Ş.</option>
                  <option value="DENİZBANK A.Ş.">DENİZBANK A.Ş.</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  İlgili Şube Müdürlüğü Unvanı
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="Örn: KADIKÖY TİCARİ ŞUBESİ MÜDÜRLÜĞÜ’NE"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          )}

        </div>

        {/* Printable Paper Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 flex-1 print:p-0 print:m-0 print:bg-white print:overflow-visible">
          <div ref={printRef} className="printable-paper bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl font-serif text-xs leading-relaxed max-w-4xl mx-auto border border-slate-200 print:shadow-none print:p-0 print:border-none print:max-w-none print:w-full print:m-0 print:text-black">
            
            {/* IF QNB MULTI FORMAT EXACT MATCH */}
            {petitionType === 'QNB_MULTI' ? (
              <div className="font-sans text-black space-y-4">
                
                {/* QNB Header Title */}
                <div className="text-center font-black text-sm uppercase tracking-wide">
                  İHRACAT ÇOKLU İBKB TALİMATI
                </div>

                <div className="flex justify-between items-baseline font-black text-xs pt-2">
                  <div>QNB FİNANSBANK A.Ş.</div>
                  <div>TARİH: {todayStr}</div>
                </div>

                {/* Main Legal Paragraph 1 */}
                <p className="text-justify font-medium leading-relaxed">
                  Nezdinizdeki <span className="font-bold font-mono">[{qnbIban}]</span> nolu hesabımıza ihracat bedeli olarak gelen ve aşağıda detayı bulunan işlemlerin gerçekleştirilerek İBKB düzenlenmesini rica ederiz.
                </p>

                {/* Main Legal Paragraph 2 (TCMB Döviz Satış Kararı) */}
                <p className="text-justify font-normal leading-relaxed text-[11px]">
                  İhracat Genelgesinin Ek 1 inci Maddesinde tarif edilen döviz cinsleri (USD-EUR-GBP) için düzenlenecek İBKB tutarlarının %<strong className="font-mono">{tcmbRate}</strong> 'lik kısmının aşağıda belirtilen döviz tevdiat hesabımıza borç geçilerek döviz satışı yapılmak üzere T.C. Merkez Bankasına satılmasını ve işbu talimatımızın Bankanıza ulaştığı saatten bağımsız “Türkiye Cumhuriyet Merkez Bankasına Yapılacak Döviz Satışına İlişkin Uygulama Talimatı“ hükümleri çerçevesinde İBKB düzenlendiği anda geçerli olacak işlem kuru (Merkez Bankası tarafından saat 10:00, 11:00, 12:00, 13:00, 14:00 ve 15:00'de ilan edilen ve İBKB düzenlendiği saat itibarıyla en son açıklanmış olan döviz alış kuru) üzerinden hesaplanacak TL karşılığının aşağıda belirttiğimiz TL hesabımıza veya Bankanız nezdindeki herhangi bir TL hesaba alacak geçilmesini kabul ve beyan ederiz.
                </p>

                {/* QNB Multi-Column Table (Matching Exact Image Structure with Live Inline Editable Table Cells) */}
                <div className="border-2 border-black overflow-x-auto my-4 print:border-black print:overflow-visible print:my-2">
                  <table className="w-full text-center text-[10px] print:text-[8px] border-collapse border border-black print:table-fixed">
                    <thead>
                      <tr className="bg-slate-100 font-extrabold text-black divide-x divide-black border-b border-black">
                        <th className="p-1 print:p-0.5 print:w-[3%]">#</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[130px] print:min-w-0 print:w-[14%]">
                          Beyanname no<br />
                          <span className="font-normal text-[8px] print:text-[6.5px]">(18 Haneli Kod)</span>
                        </th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[80px] print:min-w-0 print:w-[9%]">FATURA NO</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[80px] print:min-w-0 print:w-[8%]">Beyanname tarihi</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[100px] print:min-w-0 print:w-[10%]">Beyanname Döviz Cinsi ve tutarı</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[80px] print:min-w-0 print:w-[8%]">Bedelin Hesaba Geçtiği Tarih</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[100px] print:min-w-0 print:w-[10%]">Gelen Bedelin Döviz Cinsi ve Tutarı</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[130px] print:min-w-0 print:w-[12%] whitespace-nowrap print:whitespace-normal">Gelen Bedelin Referans Numarası</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[100px] print:min-w-0 print:w-[10%]">İBKB - GB Bağlantı Tutarı - EUR</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[110px] print:min-w-0 print:w-[8%]">Döviz Hesap Numarası</th>
                        <th className="p-1.5 print:p-0.5 font-bold min-w-[110px] print:min-w-0 print:w-[8%]">TL Hesap Numarası</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-medium">
                      {qnbRows.map((row, idx) => (
                        <tr key={row.id} className="divide-x divide-black hover:bg-slate-50 transition">
                          <td className="p-1 font-bold">{idx + 1}</td>
                          
                          {/* Inline Editable Cells */}
                          <td className="p-1">
                            <input
                              type="text"
                              value={row.declarationNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationNo', e.target.value)}
                              className="w-full bg-transparent text-center font-mono font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.invoiceNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'invoiceNo', e.target.value)}
                              className="w-full bg-transparent text-center font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.declarationDate}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationDate', e.target.value)}
                              className="w-full bg-transparent text-center outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.declarationAmountAndCurr}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'declarationAmountAndCurr', e.target.value)}
                              className="w-full bg-transparent text-center font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.creditDate}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'creditDate', e.target.value)}
                              className="w-full bg-transparent text-center outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.incomingAmountAndCurr}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'incomingAmountAndCurr', e.target.value)}
                              className="w-full bg-transparent text-center font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1 min-w-[150px]">
                            <input
                              type="text"
                              value={row.referenceNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'referenceNo', e.target.value)}
                              className="w-full bg-transparent text-center font-mono font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black text-[10px] px-1"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.ibkbGbLinkAmount}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'ibkbGbLinkAmount', e.target.value)}
                              className="w-full bg-transparent text-center font-bold outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.dovizAccountNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'dovizAccountNo', e.target.value)}
                              className="w-full bg-transparent text-center font-mono text-[8px] outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                          <td className="p-1">
                            <input
                              type="text"
                              value={row.tlAccountNo}
                              onChange={(e) => handleUpdateQnbRow(row.id, 'tlAccountNo', e.target.value)}
                              className="w-full bg-transparent text-center font-mono text-[8px] outline-none border-b border-transparent hover:border-slate-300 focus:border-black"
                            />
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 font-bold space-y-4 text-xs">
                  <div>Saygılarımızla,</div>
                  <div className="pt-8 flex justify-between items-start">
                    <div>
                      <div className="font-black text-sm uppercase">KAŞE / İMZA</div>
                      <div className="text-xs font-bold text-slate-800 uppercase mt-0.5">{companyTitle}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm uppercase">{signerName}</div>
                      <div className="text-xs font-bold text-slate-600 uppercase mt-0.5">{signerTitle}</div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* STANDARD SINGLE DECLARATION PETITIONS */
              <div>
                {/* Letterhead */}
                <div className="text-center font-black border-b border-slate-300 pb-4 mb-6">
                  <div className="text-base tracking-wide uppercase font-sans font-black">{companyTitle}</div>
                  <div className="text-xs font-sans text-slate-600 font-bold mt-1 uppercase tracking-wider">
                    Vergi Kimlik No: {declaration.exporterTaxNo || '3960817425'} • İhracat & Dış Ticaret Operasyon Departmanı
                  </div>
                </div>

                {/* Date */}
                <div className="text-right font-sans text-xs text-slate-600 mb-6 font-bold uppercase tracking-wider">
                  Tarih: {todayStr}
                </div>

                {/* Target Bank Addressing Header */}
                <div className="text-center font-black text-base mb-6 tracking-wide uppercase font-sans">
                  {bankName}<br />
                  <span className="text-sm font-bold text-slate-800">{bankBranch}</span>
                </div>

                {/* Letter Body Content according to selected type */}
                <div className="space-y-4 text-justify font-sans text-xs text-slate-800 font-medium">
                  
                  <p>
                    <strong className="font-black uppercase text-slate-900">Konu:</strong> {activeSubject}
                  </p>

                  <p>
                    Şirketimiz tarafından gerçekleştirilen ve detayları aşağıda sunulan ihracat işlemimize ilişkin gümrük beyannamesi ve ödeme bilgileri kayıtlarınızdadır.
                  </p>

                  {/* Table details */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden my-4 shadow-2xs font-sans">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-slate-50">
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider w-2/5">Gümrük Beyanname No:</td>
                          <td className="py-2 px-3 font-mono font-black text-slate-900">{declaration.declarationNo}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Fiili İntaç / Kapanış Tarihi:</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{declaration.closingDate}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Alıcı Firma & Ülke:</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{declaration.importerTitle} ({declaration.destinationCountry})</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Beyanname Toplam Tutarı:</td>
                          <td className="py-2 px-3 font-black text-slate-900">{formatCurrency(declaration.amount, declaration.currency)}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Daha Önce Kapatılan Tutar:</td>
                          <td className="py-2 px-3 font-black text-emerald-700">{formatCurrency(declaration.closedAmount, declaration.currency)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Açık / Kalan Bakiye:</td>
                          <td className="py-2 px-3 font-black text-red-700">{formatCurrency(declaration.remainingAmount, declaration.currency)}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="py-2 px-3 font-extrabold text-slate-600 uppercase tracking-wider">Yasal Son İşlem Tarihi:</td>
                          <td className="py-2 px-3 font-black text-slate-900">{deadlineStr}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Dynamic Body Text */}
                  {petitionType === 'CLOSING' && (
                    <>
                      <p>
                        Söz konusu beyannameye ilişkin ihracat bedeli yurda getirilmiş ve ekte sunulan İBKB (İhracat Bedeli Kabul Belgesi) / DAB belgeleri düzenlenmiştir.
                      </p>
                      
                      {declaration.ibkbRecords.length > 0 && (
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl my-2 text-emerald-950 font-sans">
                          <div className="font-extrabold text-[11px] text-emerald-900 uppercase mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            İlişik İBKB Belgeleri Listesi:
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {declaration.ibkbRecords.map((ibkb) => (
                              <li key={ibkb.id}>
                                <strong className="font-mono">{ibkb.ibkbNo}</strong> - {ibkb.bankName} ({ibkb.documentDate}): {formatCurrency(ibkb.amount, ibkb.currency)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p>
                        Düzenlenen İBKB belgeleri ile ihracat bedelimizin tamamı/ilgili kısmı karşılanmış olduğundan, TCMB İhracat Genelgesi hükümleri çerçevesinde ilgili <strong>ihracat hesabının resmi olarak kapatılmasını</strong> ve kapanış onayının tarafımıza bildirilmesini arz ederiz.
                      </p>
                    </>
                  )}

                  {petitionType === 'EXTENSION' && (
                    <>
                      <p>
                        Yurtdışı alıcı firmanın finansal operational takvimi ve uluslararası banka transfer süreçlerindeki dönemsel gecikmeler (haklı sebep) nedeniyle ihracat bedelinin tahsilat ve İBKB kapama işlemleri devam etmektedir.
                      </p>
                      <p>
                        TCMB İhracat Genelgesi'nin 8. maddesi uyarınca, beyanname kapanış süremizin dolmesine mahal vermeden tarafımıza <strong>+90 (doksan) gün ek süre</strong> tanınmasını ve bankanız / TCMB sistemindeki ek süre kayıtlarının güncellenmesini saygılarımızla arz ve talep ederiz.
                      </p>
                    </>
                  )}

                  {petitionType === 'TERKIN' && (
                    <>
                      <p>
                        İhracat bedelinin kapatılamayan kalan kısmı <strong>{formatCurrency(declaration.remainingAmount, declaration.currency)}</strong> tutarındadır.
                      </p>
                      <p>
                        TCMB İhracat Genelgesi'nin 28. maddesi uyarınca; beyanname açık bakiyesi 30.000 USD (veya %10 yasal terkin sınırı) dahilinde kaldığından, kalan tutarın <strong>Müstesna / Terkin Kapsamında kapatılması</strong> hususunu ve beyannamenin kapatıldığına dair onay yazısının tarafımıza iletilmesini arz ederiz.
                      </p>
                    </>
                  )}

                </div>

                {/* Signatures */}
                <div className="mt-12 flex justify-between font-sans text-xs">
                  <div className="text-left">
                    <div className="font-extrabold text-slate-700 uppercase tracking-wider">Ekler:</div>
                    <div className="text-[10px] text-slate-600 font-bold mt-1">
                      1. Gümrük Beyannamesi Örneği<br />
                      {petitionType === 'CLOSING' && '2. İBKB / DAB Belgesi Suretleri<br />'}
                      {petitionType === 'EXTENSION' && '2. Swift / Yurt Dışı Muvafakat Yazışması<br />'}
                      {petitionType === 'TERKIN' && '2. Terkin Hesaplama Cetveli<br />'}
                      3. İmza Sirküleri Sureti
                    </div>
                  </div>

                  <div className="text-center font-black">
                    <div className="uppercase font-extrabold">{companyTitle}</div>
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-3">{signerName}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{signerTitle}</div>
                    <div className="mt-8 border-b-2 border-slate-400 w-44 mx-auto"></div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
