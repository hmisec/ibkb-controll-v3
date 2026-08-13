import React from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { SystemStats } from '../types';
import { formatCurrency } from '../utils/exportCalculations';

interface StatsCardsProps {
  stats: SystemStats;
  onFilterByRisk: (risk: string) => void;
  onFilterByTerkin: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onFilterByRisk,
  onFilterByTerkin,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* 1. Open Volume Waiting Closure */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
          <span>AÇIK İBKB BAKİYESİ</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {formatCurrency(stats.openAmountUSD, 'USD')}
        </div>
        <div className="mt-2 text-[11px] text-amber-600 flex items-center gap-1 font-bold uppercase tracking-wider">
          <span>{stats.totalDeclarations} BEYANNAMENİN BAKIYESİ</span>
        </div>
      </div>

      {/* 2. Closed Volume */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
          <span>İBKB İLE KAPATILAN</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {formatCurrency(stats.closedAmountUSD, 'USD')}
        </div>
        <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-bold uppercase tracking-wider">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>TOPLAMIN %{Math.round((stats.closedAmountUSD / (stats.totalExportVolumeUSD || 1)) * 100)}'İ KAPANDI</span>
        </div>
      </div>

      {/* 3. 180-Day Critical Alarms Hero Card */}
      <div 
        onClick={() => onFilterByRisk('CRITICAL')}
        className="bg-red-600 text-white rounded-2xl p-5 shadow-xl shadow-red-100 relative overflow-hidden group cursor-pointer hover:bg-red-700 transition-colors"
      >
        <div className="flex items-center justify-between text-red-100 text-xs font-bold uppercase tracking-widest mb-2">
          <span>180 GÜN KRİTİK ALARM</span>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>{stats.criticalAlarmCount + stats.overdueCount}</span>
          {stats.overdueCount > 0 && (
            <span className="text-[10px] font-black text-red-700 bg-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              {stats.overdueCount} SÜRESİ DOLMUŞ
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-red-100 flex items-center gap-1 font-bold uppercase tracking-wider">
          <span>SON 15 GÜN & SÜRE AŞIMLARI &rarr;</span>
        </div>
      </div>

      {/* 4. Terkin / Waiver Opportunity ($30K Exception) */}
      <div 
        onClick={onFilterByTerkin}
        className="bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition cursor-pointer rounded-2xl p-5 shadow-sm relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-indigo-500 text-xs font-bold uppercase tracking-widest mb-2">
          <span>$30 BİN TERKİN FIRSATI</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-900 tracking-tight">
          {stats.terkinEligibleCount} BEYANNAME
        </div>
        <div className="mt-2 text-[11px] text-indigo-700 flex items-center gap-1 font-extrabold uppercase tracking-wider">
          <span>TEK TIKLA MUAFİYETLE KAPAT &rarr;</span>
        </div>
      </div>

      {/* 5. Compliance Index */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
          <span>TCMB UYUM ENDEKSİ</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
          %{stats.complianceScorePercent}
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden border border-slate-200">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${stats.complianceScorePercent}%` }}
          />
        </div>
      </div>

    </div>
  );
};
