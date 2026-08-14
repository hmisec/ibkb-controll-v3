const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

content = content.replace(
  '<td className="py-2 px-2 text-center whitespace-nowrap">',
  '<td className="py-2 px-2 text-center">'
);

content = content.replace(
  '<div className="flex items-center justify-center space-x-1.5">',
  '<div className="flex items-center justify-center gap-1.5 flex-wrap">'
);

fs.writeFileSync('src/components/DeclarationTable.tsx', content);
