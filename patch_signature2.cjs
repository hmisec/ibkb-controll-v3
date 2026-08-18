const fs = require('fs');
let content = fs.readFileSync('src/components/PetitionGeneratorModal.tsx', 'utf8');

content = content.replace(
  '<div className="mt-12 flex justify-between font-sans text-xs">\\n                  <div className="text-left">',
  '<div className="mt-12 flex flex-col justify-start gap-8 font-sans text-xs">\\n                  <div className="text-left">'
);

content = content.replace(
  '<div className="text-left font-black min-w-[220px] order-1 sm:order-1">',
  '<div className="text-left font-black min-w-[220px]">'
);

fs.writeFileSync('src/components/PetitionGeneratorModal.tsx', content);
console.log('Fixed');
