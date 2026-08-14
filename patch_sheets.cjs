const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleSheetsModal.tsx', 'utf8');

// Add states
content = content.replace(
  "const [showExportConfirm, setShowExportConfirm] = useState(false);",
  "const [showExportConfirm, setShowExportConfirm] = useState(false);\n  const [exportStartDate, setExportStartDate] = useState('');\n  const [exportEndDate, setExportEndDate] = useState('');"
);

// Add CSV Export function
const csvFunc = `
  const handleDownloadCSV = () => {
    let filtered = declarations;
    if (exportStartDate) {
      filtered = filtered.filter(d => new Date(d.registrationDate) >= new Date(exportStartDate));
    }
    if (exportEndDate) {
      filtered = filtered.filter(d => new Date(d.registrationDate) <= new Date(exportEndDate));
    }

    const headers = [
      'Beyanname No',
      'Tescil Tarihi',
      'İntaç Tarihi',
      'İhracatçı',
      'Alıcı',
      'Gidilecek Ülke',
      'Döviz Cinsi',
      'FOB Tutar',
      'Kapanan Tutar',
      'Açık Tutar',
      'Durum',
      'Kalan Süre (Gün)'
    ].join(',');

    const rows = filtered.map(d => [
      d.declarationNo,
      new Date(d.registrationDate).toLocaleDateString('tr-TR'),
      new Date(d.closingDate).toLocaleDateString('tr-TR'),
      \`"\${d.exporterTitle}"\`,
      \`"\${d.importerTitle}"\`,
      d.destinationCountry,
      d.currency,
      d.amount,
      d.closedAmount,
      d.remainingAmount,
      d.status,
      d.daysLeft
    ].join(','));

    const csvContent = [headers, ...rows].join('\\n');
    const blob = new Blob(["\\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`Ihracat_Beyannameleri_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

content = content.replace(
  "const handleTriggerExport = () => {",
  csvFunc + "\n\n  const handleTriggerExport = () => {"
);

// Add Date Filters and CSV button to UI
const uiFilters = `
                {/* Date Filters & CSV Export */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Tarih Aralığı Filtresi ve Excel/CSV İndirme
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Başlangıç Tescil Tarihi</label>
                      <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bitiş Tescil Tarihi</label>
                      <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="w-full sm:w-auto self-end">
                      <button onClick={handleDownloadCSV} className="w-full px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center justify-center gap-2 transition">
                        <Download className="w-4 h-4" />
                        <span>CSV Olarak İndir</span>
                      </button>
                    </div>
                  </div>
                </div>
`;

content = content.replace(
  "{/* Export Tab */}",
  "{/* Export Tab */}\n" + uiFilters
);

fs.writeFileSync('src/components/GoogleSheetsModal.tsx', content);
