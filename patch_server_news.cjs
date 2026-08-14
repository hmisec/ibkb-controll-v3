const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newsBlockStart = content.indexOf('const CACHE_TTL = 30 * 60 * 1000; // 30 minutes');
const newsBlockEnd = content.indexOf('app.post("/api/sheets/export"');

if (newsBlockStart !== -1 && newsBlockEnd !== -1) {
  const newLogic = `
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let cachedNewsJSON: any[] | null = null;
let lastFetchTime: number = 0;

const DEFAULT_NEWS_JSON = [
  { text: "Gelir İdaresi Başkanlığı (GİB) tarafından e-Fatura ve e-Defter uygulamalarına ilişkin yeni kılavuzlar yayımlandı.", url: "https://www.gib.gov.tr", isCritical: false },
  { text: "2024 Yılı SGK taban ve tavan prim esas kazanç tutarları asgari ücretle birlikte güncellendi.", url: "https://www.sgk.gov.tr", isCritical: false },
  { text: "TÜRMOB, enflasyon muhasebesi (düzeltmesi) uygulamalarına yönelik usul ve esasları paylaştı.", url: "https://www.turmob.org.tr", isCritical: false },
  { text: "İhracat bedellerinin yurda getirilme süresi (İBKB) veya Merkez Bankası döviz bozdurma zorunlulukları hakkında güncelleme yapıldı.", url: "https://www.tcmb.gov.tr", isCritical: true }
];

async function fetchNewsBackground() {
  try {
    const ai = getGeminiClient();
    const promptText = \`Şu anki zaman: \$\{new Date().toISOString()\}. Sadece son 3 gün içerisinde yayınlanmış, Türkiye'deki en güncel Resmi Gazete kararları, Vergi Usul Kanunu (VUK), SGK, KDV, Gelir İdaresi Başkanlığı (GİB) duyuruları, TÜRMOB ve resmi muhasebeyi/ihracatı ilgilendiren diğer tüm güncel mevzuat haberlerini Google'da ara.
Bana sonuçları KESİNLİKLE GEÇERLİ BİR JSON DİZİSİ (Array) olarak dön. JSON dışında hiçbir açıklama metni veya markdown karakteri (örneğin \`\`\`json) ekleme.
Dizideki her obje şu formata sahip olmalı:
- "text": Haberin 1-2 cümlelik kısa ve net özeti.
- "url": Haberin okunabileceği ilgili resmi kurum linki veya haber kaynağının URL'si.
- "isCritical": Eğer haber ihracat bedellerinin getirilme süresi, İBKB kuralları, vergi affı, TCMB oran değişiklikleri, SGK teşviklerinin kaldırılması gibi çok acil/kullanıcıyı doğrudan ve kritik düzeyde ilgilendiren majör bir değişikliği içeriyorsa true, rutin bir haber ise false. Sadece en önemli %10'luk kısım true olmalıdır.

Promosyonel içerikleri yoksay, sadece resmi veya önemli sektörel haberleri ver. En fazla 5 adet haber dön.\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
        responseMimeType: "application/json"
      },
    });

    const text = response.text || "[]";
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
            cachedNewsJSON = parsed;
            lastFetchTime = Date.now();
            console.log("[News Updater] Mevzuat haberleri (JSON formatında) başarıyla güncellendi.");
        }
    } catch (e) {
        console.error("JSON Parsing Error from Gemini for News:", e, "Raw Text:", text);
    }
  } catch (error: any) {
    if (!error?.message?.includes("429") && !error?.message?.includes("RESOURCE_EXHAUSTED")) { 
        console.error("[News Updater] Error:", error); 
    } else { 
        console.warn("[News Updater] Gemini API Rate Limit hit. Keeping existing cache."); 
    }
    if (!cachedNewsJSON) {
        cachedNewsJSON = DEFAULT_NEWS_JSON;
        lastFetchTime = Date.now();
    }
  }
}

// Start background task
fetchNewsBackground();
setInterval(fetchNewsBackground, CACHE_TTL);

app.get("/api/gemini/news", (req, res) => {
  if (!cachedNewsJSON) {
      return res.json({ news: DEFAULT_NEWS_JSON, lastFetchTime: Date.now(), isFallback: true });
  }
  return res.json({ news: cachedNewsJSON, lastFetchTime });
});

// Google Sheets / CSV Export endpoint
`;

  content = content.substring(0, newsBlockStart) + newLogic.trim() + '\n' + content.substring(newsBlockEnd + 30);
  fs.writeFileSync('server.ts', content);
  console.log('Successfully patched server.ts');
} else {
  console.log('Could not find block. Start:', newsBlockStart, 'End:', newsBlockEnd);
}
