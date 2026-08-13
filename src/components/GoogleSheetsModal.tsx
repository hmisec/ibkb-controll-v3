import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  LogOut, 
  User as UserIcon,
  Copy,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Declaration } from '../types';
import { initAuth, googleSignIn, googleLogout } from '../lib/googleAuth';
import { createExportSpreadsheet, fetchSheetData, extractSpreadsheetId } from '../lib/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
  onImportDeclarations: (newDecs: Omit<Declaration, 'id' | 'daysLeft' | 'riskLevel' | 'closedAmount' | 'remainingAmount' | 'ibkbRecords' | 'createdAt' | 'updatedAt'>[]) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  declarations,
  onImportDeclarations,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Import State
  const [sheetInput, setSheetInput] = useState('');
  const [isReadingSheet, setIsReadingSheet] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setAccessToken(null);
    setExportedUrl(null);
    setPreviewRows([]);
  };

  const handleTriggerExport = () => {
    if (!accessToken) {
      handleLogin();
      return;
    }
    setShowExportConfirm(true);
  };

  const executeExport = async () => {
    setShowExportConfirm(false);
    if (!accessToken) return;

    setIsExporting(true);
    setAuthError(null);
    try {
      const result = await createExportSpreadsheet(accessToken, declarations);
      setExportedUrl(result.spreadsheetUrl);
    } catch (err: any) {
      setAuthError(err.message || 'Google Sheets aktarımı sırasında bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (exportedUrl) {
      navigator.clipboard.writeText(exportedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReadSheet = async () => {
    if (!accessToken) {
      handleLogin();
      return;
    }
    if (!sheetInput.trim()) {
      setImportError('Lütfen geçerli bir Google Sheets bağlantısı veya ID adresi girin.');
      return;
    }

    setIsReadingSheet(true);
    setImportError(null);
    setPreviewRows([]);

    try {
      const rawRows = await fetchSheetData(accessToken, sheetInput);
      if (rawRows.length <= 1) {
        setImportError('Tabloda veri satırı bulunamadı.');
        return;
      }

      // Convert rows (skip header)
      const parsed: any[] = [];
      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0 || !row[0]) continue;

        parsed.push({
          declarationNo: row[0] || `24340100EX${Math.floor(100000 + Math.random() * 900000)}`,
          registrationDate: row[1] || '10/01/2026',
          closingDate: row[2] || '12/01/2026',
          exporterTitle: row[3] || '',
          exporterTaxNo: row[4] || '',
          importerTitle: row[5] || 'Alıcı İthalatçı Ltd.',
          destinationCountry: row[6] || 'Almanya',
          customsOffice: row[7] || 'İstanbul İhtisas Gümrüğü',
          amount: parseFloat(row[8]) || 50000,
          currency: (row[9] || 'USD').toUpperCase() as any,
          paymentMethod: 'Peşin',
          incoterm: 'FOB',
          exchangeRateToTRY: 34.50,
          tcmbMandatorySaleRate: 40,
          tcmbMandatoryAmount: (parseFloat(row[8]) || 50000) * 0.4,
          tcmbSoldAmount: parseFloat(row[13]) || 0,
          status: 'ACTIVE',
          hasExtension: false,
          notes: row[17] || 'Google Sheets tablosundan aktarıldı',
        });
      }

      if (parsed.length === 0) {
        setImportError('Ayrıştırılabilir geçerli beyanname satırı bulunamadı.');
      } else {
        setPreviewRows(parsed);
      }
    } catch (err: any) {
      setImportError(err.message || 'Google Sheets verisi okunurken bir hata oluştu.');
    } finally {
      setIsReadingSheet(false);
    }
  };

  const handleConfirmImport = () => {
    setShowImportConfirm(true);
  };

  const executeImport = () => {
    setShowImportConfirm(false);
    if (previewRows.length === 0) return;
    onImportDeclarations(previewRows);
    setPreviewRows([]);
    setSheetInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                GOOGLE SHEETS & DRIVE ENTEGRASYONU
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Google Drive Raporlama ve Otomatik Veri Aktarımı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-7 h-7 rounded-full border border-slate-300" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-extrabold text-slate-900 block">{user.displayName || user.email}</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Google Oturumu Açık
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Google Sheets entegrasyonu için Google hesabınızla giriş yapın:</span>
            </div>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoadingAuth}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs border border-slate-300 shadow-xs flex items-center space-x-2 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoadingAuth ? 'Giriş Yapılıyor...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-black uppercase tracking-wider shrink-0">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'EXPORT'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Google Drive'a Tablo Oluştur</span>
          </button>

          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'IMPORT'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Google Sheets'ten Aktar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {activeTab === 'EXPORT' ? (
            <div className="space-y-4">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Google Drive Rapor Tablosu Oluşturucu</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Sistemde yer alan toplam <strong>{declarations.length} adet Gümrük Beyannamesi</strong> ve ilişkili İBKB kapatma kayıtları Google Drive hesabınızda sıfırdan biçimlendirilmiş bir Google Spreadsheet tablosu olarak oluşturulacaktır.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleTriggerExport}
                    disabled={isExporting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isExporting ? 'Google Sheets Tablosu Hazırlanıyor...' : '1-Tıklamayla Google Drive\'a Aktar'}</span>
                  </button>
                </div>
              </div>

              {/* Success Result Box */}
              {exportedUrl && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-emerald-900 font-black text-sm uppercase tracking-wide">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Google Sheets Tablonuz Hazır!</span>
                  </div>
                  <p className="text-emerald-800 font-bold text-xs">
                    Rapor tablonuz Google Drive hesabınızda başarıyla oluşturuldu. Tablonuzu incelemek veya paylaşmak için aşağıdaki bağlantıyı kullanabilirsiniz:
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href={exportedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Google Sheets'te Aç 🚀</span>
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* IMPORT TAB */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-slate-500 font-black text-xs uppercase tracking-wider">
                  Google Sheets Bağlantısı veya Tablo ID Adresi:
                </label>
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold text-xs focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 font-semibold">
                  Google Drive hesabınızdaki veya erişim yetkiniz olan herhangi bir Google Sheets bağlantısını yapıştırın.
                </p>
              </div>

              <button
                onClick={handleReadSheet}
                disabled={isReadingSheet}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isReadingSheet ? 'Google Sheets Okunuyor...' : 'Tablo Verilerini Tara & Ayrıştır'}</span>
              </button>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {previewRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-indigo-900 font-black uppercase tracking-wider">
                    <span>Ayrıştırılan {previewRows.length} Adet Beyanname Önizlemesi</span>
                    <button
                      onClick={handleConfirmImport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md shadow-emerald-100 transition"
                    >
                      Sisteme Aktar
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 font-black text-slate-700 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Beyanname No</th>
                          <th className="py-2 px-3">Alıcı Firma</th>
                          <th className="py-2 px-3">Tutar</th>
                          <th className="py-2 px-3">Tarih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                        {previewRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono">{r.declarationNo}</td>
                            <td className="py-2 px-3">{r.importerTitle}</td>
                            <td className="py-2 px-3 font-black text-emerald-700">{r.amount} {r.currency}</td>
                            <td className="py-2 px-3">{r.closingDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-end space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200"
          >
            KAPAT
          </button>
        </div>

      </div>

      {/* --- CONFIRMATION MODALS FOR DATA CREATION / IMPORT --- */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-900 shadow-2xl">
            <div className="flex items-center space-x-3 text-emerald-600 font-black text-base uppercase tracking-tight">
              <FileSpreadsheet className="w-6 h-6" />
              <span>Google Drive Tablosu Onayı</span>
            </div>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Google Drive hesabınızda <strong>"TCMB İhracat & İBKB Takip Raporu"</strong> adıyla yeni bir Google Spreadsheet belgesi oluşturulacaktır. Devam etmek istiyor musunuz?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowExportConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase"
              >
                İptal
              </button>
              <button
                onClick={executeExport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase shadow-md shadow-emerald-100"
              >
                Onayla ve Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-900 shadow-2xl">
            <div className="flex items-center space-x-3 text-indigo-600 font-black text-base uppercase tracking-tight">
              <Upload className="w-6 h-6" />
              <span>Veri İçe Aktarma Onayı</span>
            </div>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Ayrıştırılan <strong>{previewRows.length} adet beyanname kaydı</strong> mevcut ihracat takip sisteminize eklenecektir. Bu işlemi onaylıyor musunuz?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowImportConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase"
              >
                İptal
              </button>
              <button
                onClick={executeImport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase shadow-md shadow-indigo-100"
              >
                Onayla ve Sisteme Aktar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
