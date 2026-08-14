const fs = require('fs');
let content = fs.readFileSync('src/components/DeclarationTable.tsx', 'utf8');

const mobileDetails = `
                      <div className="text-[11px] font-sans font-medium text-slate-400 mt-0.5">
                        {dec.customsOffice}
                      </div>
                      <div className="md:hidden mt-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200 space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">
                          {dec.importerTitle}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          Tutar: {formatCurrency(dec.amount, dec.currency)}
                        </div>
                      </div>
`;

content = content.replace(
  '<div className="text-[11px] font-sans font-medium text-slate-400 mt-0.5">\\n                        {dec.customsOffice}\\n                      </div>',
  mobileDetails.trim()
);

fs.writeFileSync('src/components/DeclarationTable.tsx', content);
console.log('Added mobile details.');
