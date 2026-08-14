import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client (Server-Side Only)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// --- API ROUTES ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI Document Auto-Parsing Endpoint (Gümrük Beyannamesi & İBKB OCR/Parsing)
app.post("/api/gemini/parse-document", async (req, res) => {
  try {
    const { rawText, documentType, imageBase64, mimeType } = req.body;
    
    if (!rawText && !imageBase64) {
      return res.status(400).json({ error: "Lütfen belge metni veya görseli sağlayın." });
    }

    const ai = getGeminiClient();

    const promptText = `Sen Türkiye Cumhuriyeti Gümrük ve Dış Ticaret mevzuatında uzmanlaşmış bir Yapay Zeka evrak ayrıştırma asistanısın.
Sana sunulan metni veya belgeyi analiz et ve ilgili alanları kesin JSON formatında çıkar.

Belge Türü: ${documentType === "IBKB" ? "İBKB / Döviz Alım Belgesi" : "Gümrük Beyannamesi (Export Declaration)"}

Kurallar:
- Beyanname numaraları 16 karakterdir (Örn: 24340100EX001842).
- Tarihleri 'YYYY-MM-DD' formatında ver.
- Tutarları sayısal (number) olarak ver.
- Döviz cinsini (USD, EUR, GBP, TRY vb.) tespit et.
- Belgede tespit edilemeyen alanları null veya boş string olarak bırak.`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/png",
          data: imageBase64,
        },
      });
    }
    contents.push({ text: promptText + (rawText ? `\n\nOkunan Metin:\n${rawText}` : "") });

    const schemaProperties = documentType === "IBKB" ? {
      ibkbNo: { type: Type.STRING, description: "İBKB veya Belge Numarası" },
      bankName: { type: Type.STRING, description: "Banka Adı" },
      bankBranch: { type: Type.STRING, description: "Banka Şube Adı" },
      documentDate: { type: Type.STRING, description: "İBKB Düzenlenme Tarihi (YYYY-MM-DD)" },
      currency: { type: Type.STRING, description: "Döviz Cinsi (USD, EUR vb.)" },
      amount: { type: Type.NUMBER, description: "Belge Tutarı" },
      tcmbSoldAmount: { type: Type.NUMBER, description: "TCMB Satış Tutarı (TL Satış)" },
      declarationNo: { type: Type.STRING, description: "İlişkili Gümrük Beyanname Numarası" },
      notes: { type: Type.STRING, description: "Notlar veya Açıklama" },
    } : {
      declarationNo: { type: Type.STRING, description: "16 Haneli Gümrük Beyanname Numarası" },
      registrationDate: { type: Type.STRING, description: "Tescil Tarihi (YYYY-MM-DD)" },
      closingDate: { type: Type.STRING, description: "Fiili İhracat / İntaç / Kapanma Tarihi (YYYY-MM-DD)" },
      exporterTitle: { type: Type.STRING, description: "İhracatçı Unvanı" },
      exporterTaxNo: { type: Type.STRING, description: "İhracatçı VKN / TCKN" },
      importerTitle: { type: Type.STRING, description: "Alıcı Firma Unvanı" },
      destinationCountry: { type: Type.STRING, description: "Varış Ülkesi" },
      customsOffice: { type: Type.STRING, description: "Gümrük İdaresi Adı" },
      paymentMethod: { type: Type.STRING, description: "Ödeme Şekli (PESIN, MAL_MUKABILI, VESAIK_MUKABILI, AKREDITIF)" },
      incoterm: { type: Type.STRING, description: "Teslim Şekli (FOB, CIF, EXW vb.)" },
      currency: { type: Type.STRING, description: "Döviz Cinsi" },
      amount: { type: Type.NUMBER, description: "Toplam FOB İhracat Tutarı" },
      exchangeRateToTRY: { type: Type.NUMBER, description: "Gümrük Kur / Gösterge Kuru" },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Gemini Document Parse Error:", error);
    return res.status(500).json({ error: error?.message || "Evrak ayrıştırılırken hata oluştu." });
  }
});

// Gemini AI Mevzuat & İBKB Danışmanı Endpoint
app.post("/api/gemini/mevzuat-consultant", async (req, res) => {
  try {
    const { question, declarationContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Soru metni gereklidir." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Sen Türkiye Cumhuriyeti Merkez Bankası (TCMB) İhracat Genelgesi, Kambiyo Mevzuatı, Hazine ve Maliye Bakanlığı Tebliğleri ve Gümrük Beyanname Kapatma süreçlerinde uzmanlaşmış baş mevzuat danışmanısın.

Görevlerin:
1. Kullanıcının sorusuna resmi mevzuat maddelerine (TCMB İhracat Genelgesi Madde 4, Madde 8, Madde 28 Terkin vb.) dayanarak net, anlaşılır ve eyleme dönüştürülebilir Türkçe cevaplar ver.
2. 180 Günlük yasal süre, %30-%40 zorunlu TCMB döviz satışı, 30.000 USD terkin limiti, 90 günlük banka ek süresi ve vergi dairesi ihbar süreçleri hakkında kesin rehberlik sun.
3. Yanıtı maddeler halinde ve profesyonel dille formatla.`;

    const prompt = `${declarationContext ? `Mevcut Beyanname Durumu:\n${JSON.stringify(declarationContext, null, 2)}\n\n` : ''}Kullanıcı Sorusu: ${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return res.json({ answer: response.text || "Yanıt oluşturulamadı." });
  } catch (error: any) {
    console.error("Gemini Mevzuat Error:", error);
    return res.status(500).json({ error: error?.message || "Mevzuat danışmanına erişilemedi." });
  }
});


// Gemini AI İhracat Mevzuat Haberleri Endpoint
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
    const promptText = `Şu anki zaman: ${new Date().toISOString()}. Sadece son 3 gün içerisinde yayınlanmış, Türkiye'deki en güncel Resmi Gazete kararları, Vergi Usul Kanunu (VUK), SGK, KDV, Gelir İdaresi Başkanlığı (GİB) duyuruları, TÜRMOB ve resmi muhasebeyi/ihracatı ilgilendiren diğer tüm güncel mevzuat haberlerini Google'da ara.
Bana sonuçları KESİNLİKLE GEÇERLİ BİR JSON DİZİSİ (Array) olarak dön. JSON dışında hiçbir açıklama metni veya markdown karakteri (örneğin JSON formatinda) ekleme.
Dizideki her obje şu formata sahip olmalı:
- "text": Haberin 1-2 cümlelik kısa ve net özeti.
- "url": Haberin okunabileceği ilgili resmi kurum linki veya haber kaynağının URL'si.
- "isCritical": Eğer haber ihracat bedellerinin getirilme süresi, İBKB kuralları, vergi affı, TCMB oran değişiklikleri, SGK teşviklerinin kaldırılması gibi çok acil/kullanıcıyı doğrudan ve kritik düzeyde ilgilendiren majör bir değişikliği içeriyorsa true, rutin bir haber ise false. Sadece en önemli %10'luk kısım true olmalıdır.

Promosyonel içerikleri yoksay, sadece resmi veya önemli sektörel haberleri ver. En fazla 5 adet haber dön.`;

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
app.post("/api/sheets/export", (req, res) => {
  const { declarations } = req.body;
  if (!declarations || !Array.isArray(declarations)) {
    return res.status(400).json({ error: "Beyanname listesi bulunamadı." });
  }

  // Create CSV format
  const headers = [
    "Beyanname No",
    "Tescil Tarihi",
    "Fiili İntaç (Kapanma)",
    "Yasal Son Tarih (180 Gün)",
    "Kalan Gün",
    "Durum",
    "Risk Seviyesi",
    "İhracatçı VKN",
    "Alıcı Firma",
    "Varış Ülkesi",
    "Gümrük İdaresi",
    "Döviz Cinsi",
    "Toplam Tutar",
    "Kapatılan Tutar",
    "Açık Tutar",
    "TCMB Zorunlu Satış Tutarı",
    "Ek Süre Var mı?"
  ];

  const rows = declarations.map((d: any) => [
    `"${d.declarationNo}"`,
    `"${d.registrationDate}"`,
    `"${d.closingDate}"`,
    `"${d.deadlineDate}"`,
    d.daysLeft,
    `"${d.status}"`,
    `"${d.riskLevel}"`,
    `"${d.exporterTaxNo}"`,
    `"${d.importerTitle.replace(/"/g, '""')}"`,
    `"${d.destinationCountry}"`,
    `"${d.customsOffice}"`,
    `"${d.currency}"`,
    d.amount,
    d.closedAmount,
    d.remainingAmount,
    d.tcmbSoldAmount,
    d.hasExtension ? "Evet (+90 Gün)" : "Hayır"
  ]);

  const csvString = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=ihracat_ibkb_takip_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send("\uFEFF" + csvString); // UTF-8 BOM for Excel
});

// --- SERVER INTEGRATION & VITE MIDDLEWARE ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`İhracat Beyanname & İBKB Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
