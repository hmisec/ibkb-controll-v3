const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationDetailModal.tsx', 'utf8');

content = content.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/DeclarationDetailModal.tsx', content);
console.log('Fixed literal newlines');
