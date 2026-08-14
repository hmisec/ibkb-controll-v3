import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  FolderOpen, 
  CheckCircle2, 
  Search, 
  Filter, 
  Paperclip,
  Receipt,
  Package,
  CreditCard,
  Truck,
  Printer,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { Declaration, DeclarationDocument, DocumentCategory } from '../types';
import { formatDateTR, formatCurrency } from '../utils/exportCalculations';

interface DocumentManagementModalProps {
  isOpen: boolean;
  declaration: Declaration | null;
  onClose: () => void;
  onAddDocument: (declarationId: string, doc: Omit<DeclarationDocument, 'id' | 'declarationId'>) => void;
  onDeleteDocument: (declarationId: string, docId: string) => void;
}

const CATEGORY_LABELS: Record<DocumentCategory, { label: string; bg: string; text: string; icon: any }> = {
  BEYANNAME_PDF: { label: 'Gümrük Beyannamesi (PDF)', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: FileText },
  INVOICE: { label: 'İhracat Faturası (E-Fatura)', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Receipt },
  PACKING_LIST: { label: 'Çeki Listesi (Packing List)', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Package },
  SWIFT_DEKONT: { label: 'Swift Dekontu / İBKB', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: CreditCard },
  CONSIGNMENT: { label: 'Konşimento / CMR', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Truck },
  OTHER: { label: 'Diğer Belge', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', icon: File },
};

export const DocumentManagementModal: React.FC<DocumentManagementModalProps> = ({
  isOpen,
  declaration,
  onClose,
  onAddDocument,
  onDeleteDocument,
}) => {
  if (!isOpen || !declaration) return null;

  const documents = declaration.documents || [];

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewDoc, setActivePreviewDoc] = useState<DeclarationDocument | null>(null);
  
  // Upload Form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newCategory, setNewCategory] = useState<DocumentCategory>('BEYANNAME_PDF');
  const [newFileName, setNewFileName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filtered docs
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newFileName) {
        setNewFileName(file.name);
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName && !selectedFile) {
      alert('Lütfen bir dosya seçin veya belge adı girin.');
      return;
    }

    const fileSizeStr = selectedFile 
      ? (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (Math.random() * 1.5 + 0.3).toFixed(1) + ' MB';

    onAddDocument(declaration.id, {
      category: newCategory,
      fileName: newFileName || (selectedFile ? selectedFile.name : 'Gümrük_Belgesi.pdf'),
      fileSize: fileSizeStr,
      fileType: selectedFile ? selectedFile.type : 'application/pdf',
      uploadDate: formatDateTR(new Date()),
      uploadedBy: 'Ahmet Yılmaz',
      notes: newNotes,
    });

    // Reset Form
    setSelectedFile(null);
    setNewFileName('');
    setNewNotes('');
    setShowUploadForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400 text-white flex items-center justify-center shrink-0 shadow-md">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Belge Yönetimi & Gümrük Arşivi</h3>
                <span className="bg-indigo-500/30 text-indigo-200 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  {declaration.declarationNo}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {declaration.importerTitle} • {declaration.customsOffice} ({documents.length} Yüklü Belge)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Belge Yükle</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Upload Form Accordion */}
          {showUploadForm && (
            <form onSubmit={handleUploadSubmit} className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-4.5 space-y-4 animate-in slide-in-from-top duration-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Yeni Gümrük Belgesi Yükle
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowUploadForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Kapat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Belge Kategorisi *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="BEYANNAME_PDF">Gümrük Beyannamesi (PDF)</option>
                    <option value="INVOICE">İhracat Faturası (E-Fatura / Commercial Invoice)</option>
                    <option value="PACKING_LIST">Çeki Listesi (Packing List)</option>
                    <option value="SWIFT_DEKONT">Swift Dekontu / İBKB Belgesi</option>
                    <option value="CONSIGNMENT">Konşimento / Taşıma Belgesi (CMR)</option>
                    <option value="OTHER">Diğer Evrak / Yazışma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Dosya Seçin (PDF, Görsel, Doküman)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full bg-white border border-slate-300 rounded-xl p-1.5 font-medium text-slate-700 text-xs focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Belge / Dosya Adı
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Örn: 24340100EX001842_Gümrük_Beyannamesi.pdf"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Açıklama / Not (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Örn: Islak imzalı gümrük onaylı nüsha"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-100"
                >
                  <Upload className="w-4 h-4" />
                  <span>Sisteme Kaydet</span>
                </button>
              </div>
            </form>
          )}

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Belge adı veya notlarda ara..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition border ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tüm Belgeler ({documents.length})
              </button>
              
              {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => {
                const count = documents.filter((d) => d.category === catKey).length;
                if (count === 0 && selectedCategory !== catKey) return null;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition border ${
                      selectedCategory === catKey
                        ? `${catInfo.bg} ${catInfo.text} font-black border-indigo-400`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {catInfo.label.split('(')[0]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document List View */}
          {filteredDocs.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-bold text-sm">Aranan kriterlere uygun gümrük belgesi bulunamadı.</p>
              <p className="text-slate-400 text-xs font-medium">Yukarıdaki "Yeni Belge Yükle" butonuna tıklayarak bu beyannameye belge ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDocs.map((doc) => {
                const catInfo = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.OTHER;
                const IconComponent = catInfo.icon;

                return (
                  <div 
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-md transition space-y-3 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-9 h-9 rounded-xl ${catInfo.bg} ${catInfo.text} flex items-center justify-center shrink-0 border`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${catInfo.bg} ${catInfo.text}`}>
                              {catInfo.label}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-xs mt-1 line-clamp-1 group-hover:text-indigo-600 transition" title={doc.fileName}>
                              {doc.fileName}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Notes / Description */}
                      {doc.notes && (
                        <p className="text-[11px] text-slate-500 font-medium mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {doc.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Action Ribbon */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-bold text-slate-400">
                        <span>{doc.fileSize}</span> • <span>{doc.uploadDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActivePreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] flex items-center gap-1 border border-indigo-200 transition"
                          title="Belgeyi Önizle & Görüntüle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Görüntüle</span>
                        </button>

                        <button
                          onClick={() => {
                            alert(`"${doc.fileName}" belgesi bilgisayarınıza indiriliyor...`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200"
                          title="Belgeyi İndir"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`"${doc.fileName}" belgesini silmek istediğinize emin misiniz?`)) {
                              onDeleteDocument(declaration.id, doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Belgeyi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer Summary */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <div>
            Toplam <strong className="text-slate-900 font-extrabold">{documents.length}</strong> gümrük belgesi arşivlendi.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold transition"
          >
            Tamam / Kapat
          </button>
        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Document Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-extrabold text-sm text-white font-mono">{activePreviewDoc.fileName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {CATEGORY_LABELS[activePreviewDoc.category]?.label} • {activePreviewDoc.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Yazdır"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePreviewDoc(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Document Paper Container */}
            <div className="p-6 overflow-y-auto bg-slate-200/80 flex justify-center flex-1">
              <div className="bg-white border border-slate-300 shadow-lg p-6 max-w-xl w-full text-xs font-sans space-y-5 rounded-lg text-slate-900 my-auto">
                
                {/* Official Header */}
                <div className="border-b-2 border-black pb-3 flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">T.C. TİCARET BAKANLIĞI</div>
                    <div className="text-sm font-black uppercase tracking-tight text-slate-900">{declaration.customsOffice}</div>
                    <div className="text-[10px] font-mono text-slate-600 mt-0.5">E-GÜMRÜK DİJİTAL BELGE ARŞİVİ</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-black text-slate-900">
                      ONAYLI SURET
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">Tarih: {activePreviewDoc.uploadDate}</div>
                  </div>
                </div>

                {/* Document Type Title */}
                <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded font-black text-sm uppercase text-indigo-950">
                  {CATEGORY_LABELS[activePreviewDoc.category]?.label || 'RESMİ BEYANNAME BELGESİ'}
                </div>

                {/* Specific Document Mock Representations */}
                <div className="space-y-3 font-medium text-slate-800">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="font-extrabold text-slate-500 block uppercase text-[9px]">Beyanname Tescil No:</span>
                      <span className="font-mono font-black text-slate-900">{declaration.declarationNo}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500 block uppercase text-[9px]">Fatura No:</span>
                      <span className="font-bold text-slate-900">{declaration.invoiceNo || 'FT-2026-10293'}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500 block uppercase text-[9px]">İhracatçı Firma:</span>
                      <span className="font-bold text-slate-900">{declaration.exporterTitle}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500 block uppercase text-[9px]">Alıcı Firma & Ülke:</span>
                      <span className="font-bold text-slate-900">{declaration.importerTitle} ({declaration.destinationCountry})</span>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded space-y-2">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 font-bold">
                      <span>Beyanname FOB Toplam Tutarı:</span>
                      <span className="font-mono font-black">{formatCurrency(declaration.amount, declaration.currency)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 font-bold">
                      <span>Fiili İntaç / Kapanış Tarihi:</span>
                      <span>{formatDateTR(declaration.closingDate)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Ödeme Şekli / Teslim Şekli:</span>
                      <span>{declaration.paymentMethod} / {declaration.incoterm}</span>
                    </div>
                  </div>

                  {activePreviewDoc.notes && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 font-bold text-[11px]">
                      Açıklama / Sistem Notu: {activePreviewDoc.notes}
                    </div>
                  )}
                </div>

                {/* Stamp & Verification */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px]">
                  <div className="text-slate-500 font-mono">
                    Gümrük Kayıt ID: {declaration.id}<br />
                    E-İmza Doğrulama Kodu: {Math.random().toString(36).substring(2, 12).toUpperCase()}
                  </div>
                  <div className="text-center font-bold">
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-700 text-indigo-700 flex items-center justify-center font-black text-[9px] uppercase tracking-tighter mx-auto mb-1 rotate-12">
                      GÜMRÜK<br />ONAYLI
                    </div>
                    <span>Dijital Arşiv Onayı</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Close */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs"
              >
                Pencereyi Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
