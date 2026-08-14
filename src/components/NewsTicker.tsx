import React, { useState, useEffect } from 'react';
import { Newspaper, Loader2, RefreshCw, Clock, ExternalLink, AlertTriangle, X, ShieldAlert, ChevronRight } from 'lucide-react';

interface NewsItem {
  text: string;
  url: string;
  isCritical: boolean;
}


function getValidUrl(item: NewsItem) {
  if (!item.url || item.url === '#' || item.url === '/' || !item.url.startsWith('http')) {
    return `https://www.google.com/search?q=${encodeURIComponent(item.text)}`;
  }
  return item.url;
}

export const NewsTicker: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Critical Toast State
  const [criticalNews, setCriticalNews] = useState<NewsItem | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isToastMinimized, setIsToastMinimized] = useState(false);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/gemini/news');
      if (!res.ok) throw new Error('Haberler alınamadı');
      
      const data = await res.json();
      
      // Update news array from JSON
      let parsedItems: NewsItem[] = [];
      if (Array.isArray(data.news)) {
          parsedItems = data.news;
      } else if (typeof data.news === 'string') {
          // Fallback if the backend still gives string somehow
          parsedItems = data.news.split('|').map((item: string) => ({ text: item.trim(), url: '#', isCritical: false })).filter((i: any) => i.text);
      }
      
      setNewsItems(parsedItems);
      
      if (data.lastFetchTime) {
        const date = new Date(data.lastFetchTime);
        setLastUpdated(date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      }

      // Check for critical news
      const critical = parsedItems.find(item => item.isCritical);
      if (critical) {
          // Check if we already alerted this specific news to avoid spamming
          const alertedUrl = localStorage.getItem('lastAlertedCriticalNews');
          if (alertedUrl !== critical.url) {
              setCriticalNews(critical);
              setIsToastVisible(true);
              setIsToastMinimized(false);
              localStorage.setItem('lastAlertedCriticalNews', critical.url);
          }
      }

    } catch (err: any) {
      if (newsItems.length === 0) {
          setError('Mevzuat haberleri yüklenemedi.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const intervalId = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000); 
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 w-full overflow-hidden flex items-center shadow-sm">
      <div className="flex items-center justify-center bg-amber-500 text-white px-4 py-2 font-black text-[10px] uppercase tracking-widest h-full shrink-0 gap-1.5 z-20 relative shadow-[4px_0_12px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
        <Newspaper className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mevzuat Haberleri</span>
      </div>
      
      {lastUpdated && !loading && !error && (
        <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-amber-100/50 dark:bg-amber-900/30 text-[10px] font-bold text-amber-600 dark:text-amber-400 z-10 shrink-0 border-r border-amber-200 dark:border-amber-800/60 h-full uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          Son Güncelleme: {lastUpdated}
        </div>
      )}
      
      <div className="flex-1 overflow-hidden relative flex items-center h-full px-4">
        {loading && newsItems.length === 0 ? (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Canlı mevzuat güncellemeleri yükleniyor...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
            <button onClick={() => { setLoading(true); setError(null); fetchNews(); }} className="hover:underline flex items-center gap-1 ml-2 text-amber-700 dark:text-amber-400">
              <RefreshCw className="w-3 h-3" /> Tekrar Dene
            </button>
          </div>
        ) : (
          <div className="whitespace-nowrap animate-marquee flex items-center gap-6">
            {newsItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 group">
                <a 
                  href={getValidUrl(item)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${item.isCritical ? 'text-red-600 dark:text-red-400 hover:text-red-800' : 'text-amber-900 dark:text-amber-200 hover:text-amber-600'}`}
                >
                  {item.isCritical && <AlertTriangle className="w-3 h-3 shrink-0 animate-pulse" />}
                  <span>{item.text}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                
                {idx !== newsItems.length - 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-600"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>

    {/* CRITICAL NEWS TOAST ALERT */}
    {isToastVisible && criticalNews && (
      isToastMinimized ? (
        <div className="fixed top-20 right-4 z-[999] animate-in slide-in-from-right duration-200">
          <button
            onClick={() => setIsToastMinimized(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 font-extrabold text-xs uppercase tracking-wider transition border border-red-500"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>KRİTİK MEVZUAT DEĞİŞİKLİĞİ</span>
          </button>
        </div>
      ) : (
        <div className="fixed top-20 right-4 z-[999] max-w-md w-full p-1 animate-in slide-in-from-right duration-300 shadow-2xl">
          <div className="bg-slate-900 border-2 border-red-500/80 rounded-2xl shadow-2xl text-white overflow-hidden backdrop-blur-md">
            
            {/* Top Header Bar */}
            <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  KRİTİK MEVZUAT ALARMI
                </h4>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsToastMinimized(true)}
                  className="p-1 hover:bg-red-700 rounded-lg transition text-white/80 hover:text-white"
                  title="Küçült"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsToastVisible(false)}
                  className="p-1 hover:bg-red-700 rounded-lg transition text-white/80 hover:text-white"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toast Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ÖNEMLİ DEĞİŞİKLİK TESPİT EDİLDİ</span>
                  </div>
                  <p className="text-sm text-slate-100 font-semibold leading-relaxed">
                    {criticalNews.text}
                  </p>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsToastVisible(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Anladım, Kapat
                </button>
                <a
                  href={getValidUrl(criticalNews)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsToastVisible(false)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <span>Habere Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    )}
    </>
  );
};
