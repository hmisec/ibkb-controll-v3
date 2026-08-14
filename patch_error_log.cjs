const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'console.error("Gemini News Error:", error);',
  'if (!error?.message?.includes("429") && !error?.message?.includes("RESOURCE_EXHAUSTED")) { console.error("Gemini News Error:", error); } else { console.warn("Gemini API Rate Limit hit for news."); }'
);

fs.writeFileSync('server.ts', content);
