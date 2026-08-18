const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationDetailModal.tsx', 'utf8');

const { formatCurrency } = require('./src/utils/exportCalculations.ts'); // Wait, I don't need this in JS script

const minRepatriationBlock = `
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
              <h4 className="font-black text-amber-900 dark:text-amber-400 border-b border-amber-200 dark:border-amber-800 pb-2.5 flex items-center gap-2 uppercase tracking-wide text-xs">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Yurda Getirme Zorunluluğu
              </h4>
              <div className="space-y-2 text-amber-800 dark:text-amber-200 font-bold">
                <div><span className="text-amber-600/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider text-[11px] block">İhracat Bedeli (FOB):</span> {formatCurrency(declaration.amount, declaration.currency)}</div>
                <div className="text-amber-900 dark:text-amber-300 font-black text-sm"><span className="text-amber-600/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider text-[11px] block">Min. Getirilmesi Gereken (%90):</span> {formatCurrency(declaration.amount * 0.9, declaration.currency)}</div>
                <p className="text-[10px] font-medium text-amber-700/60 dark:text-amber-500/60 leading-tight mt-2">
                  * İlgili mevzuat gereği ihracat bedelinin en az %90'ının fiili ihraç tarihinden itibaren 180 gün içerisinde yurda getirilmesi zorunludur.
                </p>
              </div>
            </div>
`;

// Insert the minRepatriationBlock after Finansal & TCMB Şartları
content = content.replace(
  '</div>\\n            </div>\\n          </div>\\n\\n          {/* Linked IBKB Records Section */}',
  '</div>\\n            </div>\\n' + minRepatriationBlock + '\\n          </div>\\n\\n          {/* Linked IBKB Records Section */}'
);

// We should also change grid-cols-2 to grid-cols-3
content = content.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">'
);

// We need a Print PDF button in the Action Ribbon
content = content.replace(
  '<span className="text-slate-700 font-black uppercase tracking-wider mr-2 text-xs">Hızlı Aksiyonlar:</span>',
  '<span className="text-slate-700 font-black uppercase tracking-wider mr-2 text-xs">Hızlı Aksiyonlar:</span>\\n            <button\\n              onClick={() => window.print()}\\n              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-indigo-200 transition"\\n            >\\n              <Printer className="w-4 h-4" />\\n              <span>Gümrük Özeti (PDF)</span>\\n            </button>'
);

// Now we need the Printable Template inside the component
const printableTemplate = `
        {/* Printable Paper - Hidden on screen, visible on Print */}
        <div className="hidden print:block printable-paper text-black p-8 font-serif bg-white w-full">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Gümrük Beyanname Özeti</h1>
              <p className="text-sm font-bold text-gray-600">İhracat Bedeli Yurda Getirme (İBKB) Kontrol Formu</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold uppercase text-gray-500">Tarih</div>
              <div className="text-lg font-black">{new Date().toLocaleDateString('tr-TR')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-black p-4 rounded-lg">
              <h2 className="text-xs font-bold uppercase text-gray-500 border-b border-gray-300 pb-2 mb-3">İhracatçı Firma</h2>
              <div className="font-black text-lg mb-1">{declaration.exporterTitle}</div>
              <div className="text-sm font-bold text-gray-700">VKN/TCKN: {declaration.exporterTaxNo}</div>
            </div>
            <div className="border border-black p-4 rounded-lg">
              <h2 className="text-xs font-bold uppercase text-gray-500 border-b border-gray-300 pb-2 mb-3">Alıcı Firma</h2>
              <div className="font-black text-lg mb-1">{declaration.importerTitle}</div>
              <div className="text-sm font-bold text-gray-700">Varış Ülkesi: {declaration.destinationCountry}</div>
            </div>
          </div>

          <h2 className="text-lg font-black bg-gray-100 p-2 border border-black uppercase tracking-widest text-center mb-4">Beyanname & Gümrük Detayları</h2>
          <table className="w-full text-left text-sm border-collapse border border-black mb-8">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50 w-1/3">Gümrük Beyanname No</td>
                <td className="p-3 font-black font-mono">{declaration.declarationNo}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50">Tescil Tarihi</td>
                <td className="p-3 font-bold">{formatDateTR(declaration.registrationDate)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50">İntaç / Fiili İhraç Tarihi</td>
                <td className="p-3 font-bold">{formatDateTR(declaration.closingDate) || 'Belirtilmedi'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50">Gümrük İdaresi</td>
                <td className="p-3 font-bold">{declaration.customsOffice}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold bg-gray-50">Yasal Süre Sonu (180 Gün)</td>
                <td className="p-3 font-black text-red-600">{deadlineStr}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-lg font-black bg-gray-100 p-2 border border-black uppercase tracking-widest text-center mb-4">Finansal Şartlar & Yükümlülükler</h2>
          <table className="w-full text-left text-sm border-collapse border border-black mb-8">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50 w-1/3">İhracat Bedeli (FOB)</td>
                <td className="p-3 font-black text-lg">{formatCurrency(declaration.amount, declaration.currency)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50 text-red-600">Yurda Getirilmesi Gereken Min. Tutar (%90)</td>
                <td className="p-3 font-black text-lg text-red-600">{formatCurrency(declaration.amount * 0.9, declaration.currency)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50">TCMB Satış Zorunluluğu</td>
                <td className="p-3 font-bold">%{declaration.tcmbMandatorySaleRate} - {formatCurrency(declaration.tcmbMandatoryAmount, declaration.currency)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-3 font-bold bg-gray-50">Kapatılan Tutar</td>
                <td className="p-3 font-bold text-emerald-600">{formatCurrency(declaration.closedAmount, declaration.currency)}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold bg-gray-50">Açık Bakiye</td>
                <td className="p-3 font-black">{formatCurrency(declaration.remainingAmount, declaration.currency)}</td>
              </tr>
            </tbody>
          </table>

          {declaration.ibkbRecords.length > 0 && (
            <>
              <h2 className="text-lg font-black bg-gray-100 p-2 border border-black uppercase tracking-widest text-center mb-4">İBKB Kapatma Kayıtları</h2>
              <table className="w-full text-left text-sm border-collapse border border-black mb-8">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-2 border-r border-gray-300">İBKB No</th>
                    <th className="p-2 border-r border-gray-300">Banka</th>
                    <th className="p-2 border-r border-gray-300">Tarih</th>
                    <th className="p-2 text-right">Kapatılan Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.ibkbRecords.map((ibkb) => (
                    <tr key={ibkb.id} className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300 font-mono font-bold">{ibkb.ibkbNo}</td>
                      <td className="p-2 border-r border-gray-300">{ibkb.bankName}</td>
                      <td className="p-2 border-r border-gray-300">{formatDateTR(ibkb.documentDate)}</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(ibkb.amount, ibkb.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="border border-black p-4 text-xs italic text-gray-700 mt-12 text-center rounded-lg">
            Bu belge elektronik ortamda oluşturulmuştur. İlgili ihracat bedellerinin Türk Parası Kıymetini Koruma Hakkında 32 Sayılı Karar 
            kapsamında 180 gün içerisinde yurda getirilmesi ve bankaya satılarak İBKB'ye bağlanması zorunludur.
          </div>
        </div>
`;

content = content.replace(
  '{/* Modal Content Scrollable */}',
  printableTemplate + '\\n        {/* Modal Content Scrollable */}'
);

fs.writeFileSync('src/components/DeclarationDetailModal.tsx', content);
