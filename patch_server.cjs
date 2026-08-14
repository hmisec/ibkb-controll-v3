const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/"gemini-3.6-flash"/g, '"gemini-2.5-flash"');

const newNewsRoute = `let cachedNews = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.get("/api/gemini/news", async (req, res) => {
  try {
    // Check cache
    if (cachedNews && Date.now() - lastFetchTime < CACHE_TTL) {
      return res.json({ news: cachedNews, cached: true });
    }

    const ai = getGeminiClient();
    const promptText = \`Şu anki zaman: \${new Date().toISOString()}. Türkiye'deki son İhracat Bedeli Kabul Belgesi (İBKB), Kambiyo Mevzuatı, Merkez Bankası (TCMB) ihracat genelgesi değişiklikleri veya Gümrük mevzuatı güncellemelerini Google'da ara. En önemli 3-4 güncel haber başlığını ve çok kısa özetlerini (birer cümlelik) madde imleri olmadan, sadece aralarına " | " işareti koyarak tek bir satır metin olarak dön. Örneğin: "1 Ocak 2024 tarihli karara göre ihracat bedellerinin %40'ının satışı zorunluluğu %30'a indirildi. | İhracat bedeli kabul belgesi terkin limiti 30.000 USD'den 50.000 USD'ye yükseltilmesi gündemde." Promosyonel içerikleri yoksay, sadece resmi veya önemli sektörel haberleri ver.\`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || "Güncel mevzuat haberi bulunamadı.";
    cachedNews = text.replace(/\\n/g, " ").trim();
    lastFetchTime = Date.now();
    return res.json({ news: cachedNews });
  } catch (error: any) {
    console.error("Gemini News Error:", error);
    
    // Fallback for Rate Limits or API Issues
    const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
    const fallbackNews = "Geçici API limitine ulaşıldı: Standart İBKB mevzuatı geçerlidir. İhracat bedellerinin yurda getirilme süresi 180 gündür, zorunlu TCMB satışı %30 olarak uygulanmaktadır.";
    
    if (isRateLimit || !cachedNews) {
      return res.json({ news: cachedNews || fallbackNews, errorFallback: true });
    }
    
    return res.json({ news: cachedNews, errorFallback: true });
  }
});`;

let startIdx = content.indexOf('app.get("/api/gemini/news"');
let endIdx = content.indexOf('});\n\n// Google Sheets');

if(startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newNewsRoute + content.substring(endIdx + 3);
    fs.writeFileSync('server.ts', content);
    console.log('Successfully patched server.ts');
} else {
    console.log('Could not find news route to patch. StartIdx: ' + startIdx + ' EndIdx: ' + endIdx);
}
