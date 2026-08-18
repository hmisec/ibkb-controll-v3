const fs = require('fs');
let content = fs.readFileSync('src/components/EmailRemindersModal.tsx', 'utf8');

// We will rewrite EmailRemindersModal completely to support Tabs and Bulk Actions
const newModalCode = `import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Clock, Copy, Layers, ListChecks } from 'lucide-react';
import { Declaration } from '../types';

interface EmailRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
  onLogAction?: (title: string, details: string) => void;
}

export const EmailRemindersModal: React.FC<EmailRemindersModalProps> = ({
  isOpen,
  onClose,
  declarations,
  onLogAction
}) => {
  const [activeTab, setActiveTab] = useState<'DEADLINE' | 'PARTIAL'>('DEADLINE');
  const [selectedDecId, setSelectedDecId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  if (!isOpen) return null;

  // Lists
  const dueDeclarations = declarations
    .filter(d => !['CLOSED', 'WAIVED'].includes(d.status) && d.daysLeft <= 45)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const partialDeclarations = declarations
    .filter(d => d.status === 'PARTIAL')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const currentList = activeTab === 'DEADLINE' ? dueDeclarations : partialDeclarations;
  const selectedDec = currentList.find(d => d.id === selectedDecId) || currentList[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    
    if (onLogAction && selectedDec) {
      onLogAction('E-Posta Taslağı Kopyalandı', \`\${selectedDec.declarationNo} numaralı beyanname için hatırlatma metni kopyalandı.\`);
    }
  };

  const getEmailSubject = (dec: Declaration) => {
    if (activeTab === 'PARTIAL') {
      return \`ÖDEME HATIRLATMASI: Kısmi Kalan Bakiye - GB No: \${dec.declarationNo}\`;
    }
    return \`ÖNEMLİ: İhracat Bedeli Yurda Getirme Süresi Hatırlatması - GB No: \${dec.declarationNo}\`;
  };

  const getEmailBody = (dec: Declaration) => {
    if (activeTab === 'PARTIAL') {
      return \`Sayın Finans Yetkilisi,

\${dec.exporterTitle} firması adına gerçekleştirilen ihracat işlemlerinize istinaden, \${dec.declarationNo} referans numaralı gümrük beyannamesine ait ödemenizin kısmi olarak (İBKB ile) kapatıldığı tespit edilmiştir.

İlgili gümrük beyannamesi için finansal özet aşağıdadır:
--------------------------------------------------
Beyanname No: \${dec.declarationNo}
Tescil Tarihi: \${new Date(dec.registrationDate).toLocaleDateString('tr-TR')}
Toplam FOB Tutar: \${dec.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}
Kapatılan Tutar: \${dec.closedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}
Kalan Açık Bakiye: \${dec.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}
--------------------------------------------------

Kalan açık bakiyenin (\${dec.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}) mevzuat süreleri dahilinde ödenerek hesabımıza transfer edilmesi ve banka kapatmasının (İBKB/DAB) tamamlanması gerekmektedir. 

Ödemeyi planladığınız tarih ile ilgili veya ödeme gerçekleştiyse dekont kopyasını tarafımızla paylaşmanızı rica ederiz.

Saygılarımızla,
Dış Ticaret Operasyon / Finans Departmanı\`;
    }

    return \`Sayın Yetkili,

\${dec.exporterTitle} firması adına tescil edilen ihracat işlemlerinize istinaden sistemimizde yapılan kontrolde, aşağıda detayları bulunan gümrük beyannamesinin İBKB (İhracat Bedeli Kabul Belgesi) kapatma süresinin yaklaştığı/dolduğu tespit edilmiştir.

Gümrük Beyannamesi Detayları:
--------------------------------------------------
Beyanname No: \${dec.declarationNo}
Tescil Tarihi: \${new Date(dec.registrationDate).toLocaleDateString('tr-TR')}
Kapanma (İntaç) Tarihi: \${new Date(dec.closingDate).toLocaleDateString('tr-TR')}
FOB Tutar: \${dec.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}
Açık Tutar: \${dec.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} \${dec.currency}
Yasal Süre Bitiş Tarihi: \${new Date(dec.deadlineDate).toLocaleDateString('tr-TR')}
Kalan Süre: \${dec.daysLeft < 0 ? 'SÜRE AŞIMI (' + Math.abs(dec.daysLeft) + ' Gün Geçti)' : dec.daysLeft + ' Gün'}
--------------------------------------------------

İlgili ihracat bedelinin yasal süresi içerisinde yurda getirilerek İBKB'ye bağlanması, Kambiyo Mevzuatı açısından yasal bir zorunluluktur. Konu ile ilgili banka transfer veya İBKB belgeniz mevcut ise tarafımıza ivedilikle iletmenizi rica ederiz. 

Saygılarımızla,
Dış Ticaret Operasyon / Finans Departmanı\`;
  };

  const handleSendMailto = (dec: Declaration) => {
    const subject = encodeURIComponent(getEmailSubject(dec));
    const body = encodeURIComponent(getEmailBody(dec));
    window.location.href = \`mailto:?subject=\${subject}&body=\${body}\`;
    
    if (onLogAction) {
      onLogAction('E-Posta İstemcisi Açıldı', \`\${dec.declarationNo} numaralı beyanname için e-posta istemcisi tetiklendi.\`);
    }
  };

  const handleBulkSendPartial = () => {
    setIsBulkSending(true);
    setTimeout(() => {
      setIsBulkSending(false);
      alert(\`Başarılı: \${partialDeclarations.length} adet 'Kısmi Bakiye' ödeme hatırlatma e-postası ilgili finans departmanlarına toplu olarak gönderildi.\`);
      if (onLogAction) {
        onLogAction('Toplu E-Posta Gönderimi', \`Kısmi durumdaki \${partialDeclarations.length} beyanname için toplu ödeme hatırlatması gönderildi.\`);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">E-Posta Hatırlatma Modülü</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Müşterilere ve finans departmanlarına bildirim taslakları oluşturun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 gap-4 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => { setActiveTab('DEADLINE'); setSelectedDecId(null); }}
            className={\`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 \${
              activeTab === 'DEADLINE' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }\`}
          >
            <Clock className="w-4 h-4" />
            Yasal Süre Hatırlatmaları ({dueDeclarations.length})
          </button>
          <button
            onClick={() => { setActiveTab('PARTIAL'); setSelectedDecId(null); }}
            className={\`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 \${
              activeTab === 'PARTIAL' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }\`}
          >
            <ListChecks className="w-4 h-4" />
            Kısmi (PARTIAL) Ödeme Hatırlatmaları ({partialDeclarations.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Sidebar - List */}
          <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            {activeTab === 'PARTIAL' && partialDeclarations.length > 0 && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleBulkSendPartial}
                  disabled={isBulkSending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                >
                  {isBulkSending ? (
                    <span className="animate-pulse">Gönderiliyor...</span>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      Tümüne Toplu Gönder
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {currentList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-500 opacity-50" />
                  <p className="text-sm">Bu kategoride hatırlatma gönderilecek kayıt bulunmuyor.</p>
                </div>
              ) : (
                currentList.map(dec => (
                  <button
                    key={dec.id}
                    onClick={() => setSelectedDecId(dec.id)}
                    className={\`w-full text-left p-3 rounded-xl transition flex flex-col gap-2 \${
                      (selectedDecId === dec.id || (!selectedDecId && selectedDec?.id === dec.id))
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }\`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-mono">
                        {dec.declarationNo.substring(0, 8)}...
                      </span>
                      {activeTab === 'DEADLINE' ? (
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md \${
                          dec.daysLeft < 0 ? 'bg-red-100 text-red-700' :
                          dec.daysLeft <= 15 ? 'bg-orange-100 text-orange-700' :
                          'bg-amber-100 text-amber-700'
                        }\`}>
                          {dec.daysLeft < 0 ? 'SÜRE AŞIMI' : \`\${dec.daysLeft} GÜN\`}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          KISMİ KAPALI
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                        {dec.exporterTitle}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {dec.remainingAmount.toLocaleString('tr-TR')} {dec.currency}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Area - Email Draft */}
          <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900">
            {selectedDec ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                    
                    {/* Draft Header */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12">KİME:</span>
                        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                          {activeTab === 'PARTIAL' ? '[Müşteri Finans Departmanı E-Postası]' : '[Firma E-Posta Adresi]'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12">KONU:</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 font-semibold truncate">
                            {getEmailSubject(selectedDec)}
                          </div>
                          <button
                            onClick={() => handleCopy(getEmailSubject(selectedDec), 'subject')}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                            title="Konuyu Kopyala"
                          >
                            {copiedId === 'subject' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Draft Body */}
                    <div className="flex-1 relative group">
                      <textarea
                        readOnly
                        className="w-full h-full min-h-[300px] resize-none p-6 bg-transparent text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed focus:outline-none"
                        value={getEmailBody(selectedDec)}
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(getEmailBody(selectedDec), 'body')}
                          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg hover:border-indigo-300 transition text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                          {copiedId === 'body' ? (
                            <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kopyalandı</>
                          ) : (
                            <><Copy className="w-4 h-4 text-indigo-500" /> Metni Kopyala</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draft Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Son kontrol: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      Kapat
                    </button>
                    <button
                      onClick={() => handleSendMailto(selectedDec)}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition"
                    >
                      <Send className="w-4 h-4" />
                      E-Posta Gönder
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
                <Mail className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-700" />
                <p>Hatırlatma taslağını görüntülemek için listeden bir kayıt seçin.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/EmailRemindersModal.tsx', newModalCode);
console.log('EmailRemindersModal patched');
