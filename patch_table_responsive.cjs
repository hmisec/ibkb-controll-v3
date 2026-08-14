const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

// Header modifications
content = content.replace('<th className="py-2 px-2">İntaç (Kapanma) Tarihi</th>', '<th className="py-2 px-2 hidden lg:table-cell">İntaç (Kapanma) Tarihi</th>');
content = content.replace('<th className="py-2 px-2">Alıcı Firma & Ülke</th>', '<th className="py-2 px-2 hidden md:table-cell">Alıcı Firma & Ülke</th>');
content = content.replace('<th className="py-2 px-2 text-right">Toplam Tutar</th>', '<th className="py-2 px-2 text-right hidden sm:table-cell">Toplam Tutar</th>');

// Body modifications
content = content.replace('<td className="py-2 px-2 whitespace-nowrap">', '<td className="py-2 px-2 whitespace-nowrap hidden lg:table-cell">');
content = content.replace('<td className="py-2 px-2">\\n                      <div className="font-bold text-slate-800 truncate max-w-[150px]" title={dec.importerTitle}>', '<td className="py-2 px-2 hidden md:table-cell">\\n                      <div className="font-bold text-slate-800 truncate max-w-[150px]" title={dec.importerTitle}>');
content = content.replace('<td className="py-2 px-2 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">', '<td className="py-2 px-2 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap hidden sm:table-cell">');


fs.writeFileSync('src/components/DeclarationTable.tsx', content);
console.log('Responsive table patched.');
