import React, { useState, useEffect, useMemo } from 'react';
import { 
  Declaration, 
  IBKBRecord, 
  AuditNotification, 
  AuditLog, 
  UserSession, 
  SystemStats 
} from './types';
import { 
  initialDeclarations, 
  initialAuditLogs, 
  initialSession,
  sampleDemoDeclarations
} from './data/mockData';
import { 
  calculateDaysLeft, 
  computeRiskLevel, 
  evaluateZeroErrorRules 
} from './utils/exportCalculations';

import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { DeclarationTable } from './components/DeclarationTable';
import { NotificationPanel } from './components/NotificationPanel';
import { NewDeclarationModal } from './components/NewDeclarationModal';
import { EditDeclarationModal } from './components/EditDeclarationModal';
import { AddIBKBModal } from './components/AddIBKBModal';
import { ExtensionModal } from './components/ExtensionModal';
import { TerkinModal } from './components/TerkinModal';
import { DeclarationDetailModal } from './components/DeclarationDetailModal';
import { PetitionGeneratorModal } from './components/PetitionGeneratorModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SecurityPinModal } from './components/SecurityPinModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { CriticalToastAlert } from './components/CriticalToastAlert';
import { performCloudBackup, getStoredBackupConfig, BackupState } from './lib/cloudBackupService';

import { 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  SlidersHorizontal,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [declarations, setDeclarations] = useState<Declaration[]>(() => {
    const saved = localStorage.getItem('export_declarations_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialDeclarations;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('export_logs_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialAuditLogs;
  });

  const [session, setSession] = useState<UserSession>(initialSession);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');

  // Modals state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNewDecOpen, setIsNewDecOpen] = useState(false);
  const [isEditDecOpen, setIsEditDecOpen] = useState(false);
  const [isAddIbkbOpen, setIsAddIbkbOpen] = useState(false);
  const [isExtOpen, setIsExtOpen] = useState(false);
  const [isTerkinOpen, setIsTerkinOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPetitionOpen, setIsPetitionOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState(false);

  // Selected Item for Modals
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);

  // Sheets Export State
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('export_declarations_v1', JSON.stringify(declarations));
  }, [declarations]);

  useEffect(() => {
    localStorage.setItem('export_logs_v1', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Automatic Cloud Backup Sync after every transaction (debounced)
  useEffect(() => {
    const config = getStoredBackupConfig();
    if (config.autoBackupEnabled) {
      const timer = setTimeout(() => {
        performCloudBackup(declarations, auditLogs, session)
          .catch((err) => console.warn('Otomatik bulut senkronizasyon arka plan uyarısı:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [declarations, auditLogs, session]);

  const handleRestoreFromCloud = (restored: BackupState) => {
    if (restored.declarations) {
      setDeclarations(restored.declarations);
    }
    if (restored.auditLogs) {
      setAuditLogs(restored.auditLogs);
    }
    if (restored.session) {
      setSession(restored.session);
    }
  };

  // Recalculate Days Left & Risk Level dynamically on load
  const updatedDeclarations = useMemo(() => {
    return declarations.map((dec) => {
      const days = calculateDaysLeft(dec.closingDate, dec.hasExtension);
      const risk = computeRiskLevel(days, dec.status);
      return {
        ...dec,
        daysLeft: days,
        riskLevel: risk,
      };
    });
  }, [declarations]);

  // Evaluate Zero-Error Audit Notifications
  const notifications: AuditNotification[] = useMemo(() => {
    return evaluateZeroErrorRules(updatedDeclarations);
  }, [updatedDeclarations]);

  // Critical Declarations in final 15-day risk zone
  const criticalDeclarations = useMemo(() => {
    return updatedDeclarations.filter(
      (d) => d.riskLevel === 'CRITICAL' && d.status !== 'CLOSED' && d.status !== 'WAIVED'
    );
  }, [updatedDeclarations]);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Compute System Statistics
  const stats: SystemStats = useMemo(() => {
    let totalVolUSD = 0;
    let openVolUSD = 0;
    let closedVolUSD = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let overdueCount = 0;
    let terkinCount = 0;

    updatedDeclarations.forEach((d) => {
      const rateToUSD = d.currency === 'USD' ? 1 : d.currency === 'EUR' ? 1.08 : 0.03;
      const totalUSD = d.amount * rateToUSD;
      const openUSD = d.remainingAmount * rateToUSD;
      const closedUSD = d.closedAmount * rateToUSD;

      totalVolUSD += totalUSD;
      openVolUSD += openUSD;
      closedVolUSD += closedUSD;

      if (d.riskLevel === 'CRITICAL') criticalCount++;
      if (d.riskLevel === 'WARNING') warningCount++;
      if (d.riskLevel === 'OVERDUE') overdueCount++;

      if (d.status !== 'CLOSED' && d.status !== 'WAIVED' && openUSD > 0 && openUSD <= 30000) {
        terkinCount++;
      }
    });

    const totalDecs = updatedDeclarations.length || 1;
    const compliantCount = updatedDeclarations.filter(d => d.riskLevel === 'SAFE' || d.status === 'CLOSED' || d.status === 'WAIVED').length;
    const compliancePercent = Math.round((compliantCount / totalDecs) * 100);

    return {
      totalDeclarations: updatedDeclarations.length,
      totalExportVolumeUSD: totalVolUSD,
      openAmountUSD: openVolUSD,
      closedAmountUSD: closedVolUSD,
      criticalAlarmCount: criticalCount,
      warningAlarmCount: warningCount,
      overdueCount: overdueCount,
      terkinEligibleCount: terkinCount,
      complianceScorePercent: compliancePercent,
    };
  }, [updatedDeclarations]);

  // Filtered List for Table
  const filteredDeclarations = useMemo(() => {
    return updatedDeclarations.filter((d) => {
      const matchSearch =
        !searchTerm ||
        d.declarationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.importerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.exporterTaxNo.includes(searchTerm) ||
        d.customsOffice.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
      const matchCurrency = currencyFilter === 'ALL' || d.currency === currencyFilter;

      return matchSearch && matchStatus && matchRisk && matchCurrency;
    });
  }, [updatedDeclarations, searchTerm, statusFilter, riskFilter, currencyFilter]);

  // --- HANDLERS ---

  const addAuditLog = (declarationNo: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      declarationNo,
      userRole: session.userRole,
      userName: session.userName,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleSaveNewDeclaration = (data: Omit<Declaration, 'id' | 'daysLeft' | 'riskLevel' | 'closedAmount' | 'remainingAmount' | 'ibkbRecords' | 'createdAt' | 'updatedAt'>) => {
    const days = calculateDaysLeft(data.closingDate, false);
    const risk = computeRiskLevel(days, data.status);

    const newDec: Declaration = {
      ...data,
      id: 'dec-' + Date.now(),
      closedAmount: 0,
      remainingAmount: data.amount,
      ibkbRecords: [],
      daysLeft: days,
      riskLevel: risk,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setDeclarations((prev) => [newDec, ...prev]);
    addAuditLog(newDec.declarationNo, 'Yeni Beyanname Kaydı', `${newDec.amount} ${newDec.currency} tutarında yeni ihracat kaydı oluşturuldu.`);
  };

  const handleSaveEditDeclaration = (updatedDec: Declaration) => {
    const days = calculateDaysLeft(updatedDec.closingDate, updatedDec.hasExtension);
    const risk = computeRiskLevel(days, updatedDec.status);

    setDeclarations((prev) =>
      prev.map((dec) => {
        if (dec.id !== updatedDec.id) return dec;
        return {
          ...updatedDec,
          daysLeft: days,
          riskLevel: risk,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );

    addAuditLog(updatedDec.declarationNo, 'Beyanname Bilgileri Güncellendi', `${updatedDec.declarationNo} nolu beyannamenin tutar, tarih veya firma detayları güncellendi.`);
  };

  const handleDeleteDeclaration = (declarationId: string) => {
    const target = declarations.find((d) => d.id === declarationId);
    setDeclarations((prev) => prev.filter((d) => d.id !== declarationId));
    if (target) {
      addAuditLog(target.declarationNo, 'Beyanname Silindi', `${target.declarationNo} numaralı beyanname sistemden silindi.`);
    }
  };

  const handleLoadSampleData = () => {
    setDeclarations(sampleDemoDeclarations);
    addAuditLog('SİSTEM', 'Örnek Veri Yükleme', 'Test amacıyla varsayılan örnek beyannameler yüklendi.');
  };

  const handleClearAllDeclarations = () => {
    setDeclarations([]);
    addAuditLog('SİSTEM', 'Tüm Kayıtlar Silindi', 'Kayıtlı tüm ihracat beyannameleri temizlendi.');
  };

  const handleSaveIBKB = (declarationId: string, ibkbData: Omit<IBKBRecord, 'id' | 'declarationId' | 'createdAt'>) => {
    setDeclarations((prev) =>
      prev.map((dec) => {
        if (dec.id !== declarationId) return dec;

        const newIBKB: IBKBRecord = {
          ...ibkbData,
          id: 'ibkb-' + Date.now(),
          declarationId,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };

        const updatedIBKBs = [newIBKB, ...dec.ibkbRecords];
        const newClosedAmount = dec.closedAmount + ibkbData.amount;
        const newRemaining = Math.max(0, dec.amount - newClosedAmount);
        const newStatus = newRemaining === 0 ? 'CLOSED' : 'PARTIAL';
        const newTcmbSold = dec.tcmbSoldAmount + ibkbData.tcmbSoldAmount;

        addAuditLog(dec.declarationNo, 'İBKB Kapatma Bağlama', `${ibkbData.ibkbNo} nolu ${ibkbData.amount} ${ibkbData.currency} tutarlı İBKB eklendi.`);

        return {
          ...dec,
          closedAmount: newClosedAmount,
          remainingAmount: newRemaining,
          tcmbSoldAmount: newTcmbSold,
          status: newStatus,
          ibkbRecords: updatedIBKBs,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
  };

  const handleSaveExtension = (declarationId: string, notes: string) => {
    setDeclarations((prev) =>
      prev.map((dec) => {
        if (dec.id !== declarationId) return dec;

        addAuditLog(dec.declarationNo, '+90 Gün Ek Süre Kaydı', 'TCMB İhracat Genelgesi Madde 8 uyarınca bankadan ek süre alındı.');

        return {
          ...dec,
          hasExtension: true,
          status: 'EXTENDED',
          notes: dec.notes ? `${dec.notes} | ${notes}` : notes,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
  };

  const handleApplyTerkinSave = (declarationId: string, terkinAmount: number, reason: string) => {
    setDeclarations((prev) =>
      prev.map((dec) => {
        if (dec.id !== declarationId) return dec;

        addAuditLog(dec.declarationNo, 'Terkin / Muafiyet Uygulaması', `${terkinAmount} ${dec.currency} tutarı 30.000 USD terkin istisnasından faydalandırılarak kapatıldı.`);

        return {
          ...dec,
          terkinAmount,
          closedAmount: dec.closedAmount + terkinAmount,
          remainingAmount: 0,
          status: 'WAIVED',
          notes: dec.notes ? `${dec.notes} | ${reason}` : reason,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
  };

  // Quick action from Notification panel
  const handleNotifQuickAction = (notif: AuditNotification) => {
    setIsNotifOpen(false);
    const target = updatedDeclarations.find((d) => d.id === notif.declarationId || d.declarationNo === notif.declarationNo);
    if (!target) return;

    setSelectedDeclaration(target);

    if (notif.quickActionType === 'APPLY_TERKIN') {
      setIsTerkinOpen(true);
    } else if (notif.quickActionType === 'REQUEST_EXTENSION') {
      setIsExtOpen(true);
    } else if (notif.quickActionType === 'ADD_IBKB') {
      setIsAddIbkbOpen(true);
    }
  };

  // AI Parse Auto-fill handler
  const handleParsedResultFromAi = (parsedData: any) => {
    if (parsedData.declarationNo) {
      setIsNewDecOpen(true);
    }
  };

  // Google Sheets Batch Import Handler
  const handleImportDeclarations = (newDecs: Omit<Declaration, 'id' | 'daysLeft' | 'riskLevel' | 'closedAmount' | 'remainingAmount' | 'ibkbRecords' | 'createdAt' | 'updatedAt'>[]) => {
    const formatted: Declaration[] = newDecs.map((data, index) => {
      const days = calculateDaysLeft(data.closingDate, false);
      const risk = computeRiskLevel(days, data.status);
      return {
        ...data,
        id: 'dec-sheets-' + Date.now() + '-' + index,
        closedAmount: 0,
        remainingAmount: data.amount,
        ibkbRecords: [],
        daysLeft: days,
        riskLevel: risk,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    });

    setDeclarations((prev) => [...formatted, ...prev]);
    addAuditLog('TOPLU AKTARIM', 'Google Sheets Veri Aktarımı', `${formatted.length} adet gümrük beyannamesi Google Sheets üzerinden sisteme aktarıldı.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Header Bar */}
      <Header
        session={session}
        onToggleSecurity={() => setIsSecurityModalOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadNotifCount={unreadNotifCount}
        criticalCount={stats.criticalAlarmCount}
        overdueCount={stats.overdueCount}
        onOpenNewDeclaration={() => setIsNewDecOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenCloudBackup={() => setIsCloudBackupOpen(true)}
        onExportSheets={() => setIsSheetsModalOpen(true)}
        isExportingSheets={isExportingSheets}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Executive Stats Bar */}
        <StatsCards
          stats={stats}
          onFilterByRisk={(risk) => setRiskFilter(risk)}
          onFilterByTerkin={() => { setStatusFilter('ALL'); setRiskFilter('ALL'); setSearchTerm(''); }}
        />

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Beyanname no, Alıcı firma, VKN veya Gümrük idaresi ara..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-bold placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none text-xs transition"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Risk Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-extrabold uppercase tracking-wider text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-extrabold focus:outline-none uppercase text-xs"
              >
                <option value="ALL">TÜM SÜRE / RİSKLER</option>
                <option value="CRITICAL">🔴 KRİTİK (&lt;15 GÜN)</option>
                <option value="WARNING">🟡 SARI ALARM (16-45 GÜN)</option>
                <option value="SAFE">🟢 GÜVENLİ (&gt;45 GÜN)</option>
                <option value="OVERDUE">⛔ SÜRESİ DOLMUŞ</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-extrabold uppercase tracking-wider text-slate-700">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-extrabold focus:outline-none uppercase text-xs"
              >
                <option value="ALL">TÜM KAPANMA DURUMLARI</option>
                <option value="ACTIVE">AÇIK (İBKB BEKLİYOR)</option>
                <option value="PARTIAL">KISMİ KAPALI</option>
                <option value="CLOSED">TAM KAPALI</option>
                <option value="EXTENDED">+90 GÜN EK SÜRELİ</option>
                <option value="WAIVED">TERKİN EDİLMİŞ (MUAF)</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-extrabold uppercase tracking-wider text-slate-700">
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-extrabold focus:outline-none uppercase text-xs"
              >
                <option value="ALL">TÜM DÖVİZLER</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'ALL' || riskFilter !== 'ALL' || currencyFilter !== 'ALL') && (
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setRiskFilter('ALL'); setCurrencyFilter('ALL'); }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                title="Filtreleri Sıfırla"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

          </div>

        </div>

        {/* Declarations Table View */}
        <DeclarationTable
          declarations={filteredDeclarations}
          onSelectDeclaration={(dec) => { setSelectedDeclaration(dec); setIsDetailOpen(true); }}
          onAddIBKB={(dec) => { setSelectedDeclaration(dec); setIsAddIbkbOpen(true); }}
          onRequestExtension={(dec) => { setSelectedDeclaration(dec); setIsExtOpen(true); }}
          onApplyTerkin={(dec) => { setSelectedDeclaration(dec); setIsTerkinOpen(true); }}
          onGeneratePetition={(dec) => { setSelectedDeclaration(dec); setIsPetitionOpen(true); }}
          onEditDeclaration={(dec) => { setSelectedDeclaration(dec); setIsEditDecOpen(true); }}
          onDeleteDeclaration={handleDeleteDeclaration}
          onLoadSampleData={handleLoadSampleData}
          onClearAllDeclarations={handleClearAllDeclarations}
        />

      </main>

      {/* --- ALL MODALS & DRAWERS --- */}

      {/* Zero-Error Notification Drawer */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {}}
        onQuickAction={handleNotifQuickAction}
      />

      {/* New Declaration Modal */}
      <NewDeclarationModal
        isOpen={isNewDecOpen}
        onClose={() => setIsNewDecOpen(false)}
        onSave={handleSaveNewDeclaration}
        onAiFillTrigger={() => { setIsNewDecOpen(false); setIsAiModalOpen(true); }}
      />

      {/* Edit Declaration Modal */}
      <EditDeclarationModal
        isOpen={isEditDecOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsEditDecOpen(false)}
        onSave={handleSaveEditDeclaration}
      />

      {/* Add İBKB Modal */}
      <AddIBKBModal
        isOpen={isAddIbkbOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsAddIbkbOpen(false)}
        onSaveIBKB={handleSaveIBKB}
      />

      {/* Extension Modal */}
      <ExtensionModal
        isOpen={isExtOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsExtOpen(false)}
        onSaveExtension={handleSaveExtension}
      />

      {/* Terkin Waiver Modal */}
      <TerkinModal
        isOpen={isTerkinOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsTerkinOpen(false)}
        onApplyTerkinSave={handleApplyTerkinSave}
      />

      {/* Declaration Detail Modal */}
      <DeclarationDetailModal
        isOpen={isDetailOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsDetailOpen(false)}
        onAddIBKB={(dec) => { setSelectedDeclaration(dec); setIsAddIbkbOpen(true); }}
        onRequestExtension={(dec) => { setSelectedDeclaration(dec); setIsExtOpen(true); }}
        onApplyTerkin={(dec) => { setSelectedDeclaration(dec); setIsTerkinOpen(true); }}
        onGeneratePetition={(dec) => { setSelectedDeclaration(dec); setIsPetitionOpen(true); }}
        onEditDeclaration={(dec) => { setSelectedDeclaration(dec); setIsEditDecOpen(true); }}
        onDeleteDeclaration={handleDeleteDeclaration}
      />

      {/* Petition Generator Modal */}
      <PetitionGeneratorModal
        isOpen={isPetitionOpen}
        declaration={selectedDeclaration}
        onClose={() => setIsPetitionOpen(false)}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onParsedDeclarationResult={handleParsedResultFromAi}
        activeDeclarationForContext={selectedDeclaration}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {/* Security PIN Modal */}
      <SecurityPinModal
        isOpen={isSecurityModalOpen}
        session={session}
        onClose={() => setIsSecurityModalOpen(false)}
        onUpdateRole={(newRole, newName) => setSession((prev) => ({ ...prev, userRole: newRole, userName: newName }))}
      />

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        declarations={updatedDeclarations}
        onImportDeclarations={handleImportDeclarations}
      />

      {/* Automatic Cloud Backup & Sync Modal */}
      <CloudBackupModal
        isOpen={isCloudBackupOpen}
        onClose={() => setIsCloudBackupOpen(false)}
        declarations={updatedDeclarations}
        auditLogs={auditLogs}
        session={session}
        onRestoreSuccess={handleRestoreFromCloud}
        onTriggerAuditLog={(action, desc) => addAuditLog('BULUT SENKRONİZASYON', action, desc)}
      />

      {/* Critical Risk Zone Floating Toast Alert & Web Push Notifications */}
      <CriticalToastAlert
        criticalDeclarations={criticalDeclarations}
        onOpenDetail={(dec) => { setSelectedDeclaration(dec); setIsDetailOpen(true); }}
        onRequestExtension={(dec) => { setSelectedDeclaration(dec); setIsExtOpen(true); }}
        onOpenPetition={(dec) => { setSelectedDeclaration(dec); setIsPetitionOpen(true); }}
      />

    </div>
  );
}
