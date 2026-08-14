const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

// Reduce table padding in headers
content = content.replace(/py-3\.5 px-4/g, 'py-2 px-2');

// Reduce padding in body columns
content = content.replace(/py-4 px-4/g, 'py-2 px-2');

// Reduce button padding and icon size in actions
content = content.replace(/className="p-2 rounded-xl/g, 'className="p-1.5 rounded-lg');
content = content.replace(/w-4 h-4/g, 'w-3.5 h-3.5');

// Save
fs.writeFileSync('src/components/DeclarationTable.tsx', content);
console.log('Table size shrunk.');
