const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  /\`Şu anki zaman: \$\{new Date\(\)\.toISOString\(\)\}\. Türkiye'deki en güncel/g,
  "const promptText = `Şu anki zaman: ${new Date().toISOString()}. Türkiye'deki en güncel"
);
fs.writeFileSync('server.ts', content);
