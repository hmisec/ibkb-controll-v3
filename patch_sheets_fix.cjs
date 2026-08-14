const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the buggy sheets endpoint
content = content.replace(
  '// Google Sheets / CSV Export endpoint\n (req, res) => {',
  '// Google Sheets / CSV Export endpoint\napp.post("/api/sheets/export", (req, res) => {'
);
// Also it might be written differently:
content = content.replace(
  /\/\/ Google Sheets \/ CSV Export endpoint\n\s*\(req, res\) => \{/g,
  '// Google Sheets / CSV Export endpoint\napp.post("/api/sheets/export", (req, res) => {'
);


fs.writeFileSync('server.ts', content);
