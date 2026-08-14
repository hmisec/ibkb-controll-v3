const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

content = content.replace(
  '<td className="py-2 px-2 text-slate-700 font-bold whitespace-nowrap">\\n                      <div className="flex items-center gap-1.5">\\n                        <Calendar',
  '<td className="py-2 px-2 text-slate-700 font-bold whitespace-nowrap hidden lg:table-cell">\\n                      <div className="flex items-center gap-1.5">\\n                        <Calendar'
);

content = content.replace(
  '<td className="py-2 px-2">\\n                      <div className="font-bold text-slate-800 truncate max-w-[150px]" title={dec.importerTitle}>',
  '<td className="py-2 px-2 hidden md:table-cell">\\n                      <div className="font-bold text-slate-800 truncate max-w-[150px]" title={dec.importerTitle}>'
);

content = content.replace(
  '<td className="py-2 px-2 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">\\n                      <div>{formatCurrency(dec.amount, dec.currency)}</div>',
  '<td className="py-2 px-2 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap hidden sm:table-cell">\\n                      <div>{formatCurrency(dec.amount, dec.currency)}</div>'
);


fs.writeFileSync('src/components/DeclarationTable.tsx', content);
console.log('Fixed TD visibility.');
