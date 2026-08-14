const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

content = content.replace(
  '<td className="py-2 px-2 max-w-[180px]">',
  '<td className="py-2 px-2 max-w-[180px] hidden md:table-cell">'
);

content = content.replace(
  '<td className="py-2 px-2 text-slate-700 font-bold whitespace-nowrap">',
  '<td className="py-2 px-2 text-slate-700 font-bold whitespace-nowrap hidden lg:table-cell">'
);

fs.writeFileSync('src/components/DeclarationTable.tsx', content);
console.log('Fixed TD visibility 2.');
