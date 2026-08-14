const fs = require('fs');

// 1. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');

serverContent = serverContent.replace(
  'const CACHE_TTL = 10 * 60 * 1000; // 10 minutes',
  'const CACHE_TTL = 30 * 60 * 1000; // 30 minutes'
);

serverContent = serverContent.replace(
  /const promptText = `Şu anki zaman: \$\{new Date\(\)\.toISOString\(\)\}\. Türkiye'deki son İhracat Bedeli Kabul Belgesi \(İBKB\), Kambiyo Mevzuatı, Merkez Bankası \(TCMB\) ihracat genelgesi değişiklikleri veya Gümrük mevzuatı güncellemelerini Google'da ara\. En önemli 3-4 güncel haber başlığını ve çok kısa özetlerini \(birer cümlelik\) madde imleri olmadan, sadece aralarına " \| " işareti koyarak tek bir satır metin olarak dön\. Örneğin: "1 Ocak 2024 tarihli karara göre ihracat bedellerinin %40'ının satışı zorunluluğu %30'a indirildi\. \| İhracat bedeli kabul belgesi terkin limiti 30\.000 USD'den 50\.000 USD'ye yükseltilmesi gündemde\." Promosyonel içerikleri yoksay, sadece resmi veya önemli sektörel haberleri ver\.`;/g,
  "`Şu anki zaman: ${new Date().toISOString()}. Türkiye'deki en güncel Resmi Gazete kararları, Vergi Usul Kanunu (VUK), SGK, KDV, Gelir İdaresi Başkanlığı (GİB) duyuruları, TÜRMOB ve resmi muhasebeyi ilgilendiren diğer tüm güncel mevzuat haberlerini Google'da ara. En önemli 3-5 güncel haber başlığını ve çok kısa özetlerini (birer cümlelik) madde imleri olmadan, sadece aralarına \" | \" işareti koyarak tek bir satır metin olarak dön. Promosyonel içerikleri yoksay, sadece resmi veya önemli sektörel (muhasebe/finans/vergi) haberleri ver.`;"
);
// Above regex might be tricky. Let's do string replacement instead.

serverContent = serverContent.replace(
  "const fallbackNews = \"Geçici API limitine ulaşıldı: Standart İBKB mevzuatı geçerlidir. İhracat bedellerinin yurda getirilme süresi 180 gündür, zorunlu TCMB satışı %30 olarak uygulanmaktadır.\";",
  "const fallbackNews = \"Geçici API limitine ulaşıldı: Resmi Gazete, GİB ve SGK mevzuatında yer alan standart muhasebe ve vergi usul kanunları geçerliliğini korumaktadır.\";"
);

fs.writeFileSync('server.ts', serverContent);

// 2. Update NewsTicker.tsx
let clientContent = fs.readFileSync('src/components/NewsTicker.tsx', 'utf8');

clientContent = clientContent.replace(
  "  useEffect(() => {\n    fetchNews();\n  }, []);",
  "  useEffect(() => {\n    fetchNews();\n    const intervalId = setInterval(() => {\n      fetchNews();\n    }, 30 * 60 * 1000); // 30 minutes\n    return () => clearInterval(intervalId);\n  }, []);"
);

fs.writeFileSync('src/components/NewsTicker.tsx', clientContent);
