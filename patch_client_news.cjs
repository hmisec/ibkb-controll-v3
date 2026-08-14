const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Newspaper, Loader2, RefreshCw, Clock } from 'lucide-react';

export const NewsTicker: React.FC = () => {
  const [newsItems, setNewsItems] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/gemini/news');
      if (!res.ok) throw new Error('Haberler alınamadı');
      
      const data = await res.json();
      
      // Parse the | separated string into an array, filter out empty strings
      const parsedItems = data.news.split('|').map((item: string) => item.trim()).filter(Boolean);
      setNewsItems(parsedItems);
      
      if (data.lastFetchTime) {
        const date = new Date(data.lastFetchTime);
        setLastUpdated(date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      // We don't necessarily want to show an error if we already have items (silent update fail)
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
    // Refresh the client side state every 5 minutes (server handles 30 min background fetches)
    const intervalId = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000); 
    
    return () => clearInterval(intervalId);
  }, []);

  return (
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
            {/* Double the items to create a seamless loop effect if needed, but animation handles standard scroll */}
            {newsItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  {item}
                </span>
                {/* Separator dot */}
                {idx !== newsItems.length - 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-600"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      \`}} />
    </div>
  );
};
`;

fs.writeFileSync('src/components/NewsTicker.tsx', code);
console.log('Successfully updated NewsTicker.tsx');
