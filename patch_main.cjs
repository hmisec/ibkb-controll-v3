const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">',
  '<main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">'
);

fs.writeFileSync('src/App.tsx', content);
