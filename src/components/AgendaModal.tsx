import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { Declaration } from '../types';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  declarations: Declaration[];
}

export const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose, declarations }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Previous month padding
    const firstDay = date.getDay() === 0 ? 6 : date.getDay() - 1; // Start Monday
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (!isOpen) return null;

  const openDeclarations = declarations.filter(d => d.status !== 'CLOSED' && d.status !== 'WAIVED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Kapanma Süreleri Ajandası</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Yaklaşan yasal kapanma sürelerini takvim üzerinde takip edin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center space-x-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                Bugün
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-800 last:border-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {daysInMonth.map((day, idx) => {
                if (!day) return <div key={'empty-'+idx} className="border-r border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30"></div>;
                
                const isToday = new Date().toDateString() === day.toDateString();
                const dueToday = openDeclarations.filter(d => new Date(d.deadlineDate).toDateString() === day.toDateString());
                
                return (
                  <div key={day.toISOString()} className={`p-2 border-r border-b border-slate-100 dark:border-slate-800/80 relative transition ${isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day.getDate()}
                    </span>
                    
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                      {dueToday.map(dec => (
                        <div key={dec.id} className={`text-[10px] p-1.5 rounded-lg border flex flex-col ${dec.daysLeft < 0 ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : dec.daysLeft <= 15 ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                          <span className="font-bold truncate">{dec.declarationNo.slice(-8)}</span>
                          <span className="font-semibold truncate opacity-75">{dec.exporterTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
