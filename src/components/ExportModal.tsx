import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText,
  FileIcon
} from 'lucide-react';
import { Declaration } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { formatCurrency, formatDateTR } from '../utils/exportCalculations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  declarations,
}) => {
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getFilteredData = () => {
    let filtered = [...declarations];
    if (exportStartDate) {
      filtered = filtered.filter(d => new Date(d.registrationDate) >= new Date(exportStartDate));
    }
    if (exportEndDate) {
      filtered = filtered.filter(d => new Date(d.registrationDate) <= new Date(exportEndDate));
    }
    return filtered;
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const data = getFilteredData().map(d => ({
        'Durum': d.status,
        'Beyanname No': d.declarationNo,
        'Tescil Tarihi': formatDateTR(d.registrationDate),
        'İhracatçı': d.exporterTitle,
        'VKN': d.exporterTaxNo,
        'Alıcı': d.importerTitle,
        'FOB Tutar': `${d.amount} ${d.currency}`,
        'Kapatılan': `${d.closedAmount} ${d.currency}`,
        'Kalan Açık': `${d.remainingAmount} ${d.currency}`,
        'Kalan Gün': d.daysLeft,
        'Son Tarih': formatDateTR(d.deadlineDate)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Beyannameler");
      XLSX.writeFile(wb, "ibkb_beyannameler.xlsx");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('landscape');
      const data = getFilteredData().map(d => [
        d.status,
        d.declarationNo,
        formatDateTR(d.registrationDate),
        d.exporterTitle.substring(0, 20) + '...',
        `${d.amount} ${d.currency}`,
        `${d.remainingAmount} ${d.currency}`,
        d.daysLeft.toString()
      ]);

      (doc as any).autoTable({
        head: [['Durum', 'Beyanname No', 'Tescil', 'Firma', 'FOB Tutar', 'Kalan Bakiye', 'Kalan Gün']],
        body: data,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [67, 56, 202] }
      });

      doc.save('ibkb_beyannameler.pdf');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const filtered = getFilteredData();
      
      const rows = [
        new TableRow({
          children: [
            'Durum', 'Beyanname No', 'Firma', 'Kalan Bakiye', 'Kalan Gün'
          ].map(text => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] }))
        }),
        ...filtered.map(d => new TableRow({
          children: [
            d.status,
            d.declarationNo,
            d.exporterTitle,
            `${d.remainingAmount} ${d.currency}`,
            d.daysLeft.toString()
          ].map(text => new TableCell({ children: [new Paragraph(text)] }))
        }))
      ];

      const table = new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "İBKB Gümrük Beyanname Raporu",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({ text: `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}` }),
            new Paragraph({ text: "" }),
            table
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "ibkb_beyannameler.docx");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dışa Aktar</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Verileri Excel, PDF veya Word formatında indirin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Başlangıç Tarihi</label>
              <input 
                type="date" 
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Bitiş Tarihi</label>
              <input 
                type="date" 
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
            >
              <FileSpreadsheet className="w-5 h-5" /> Excel (.xlsx) Olarak İndir
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
            >
              <FileText className="w-5 h-5" /> PDF (.pdf) Olarak İndir
            </button>
            <button 
              onClick={handleExportWord}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
            >
              <FileIcon className="w-5 h-5" /> Word (.docx) Olarak İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
