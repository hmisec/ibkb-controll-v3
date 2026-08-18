const fs = require('fs');
let content = fs.readFileSync('src/components/PetitionGeneratorModal.tsx', 'utf8');

// First block around line 819
content = content.replace(
  '<div className="pt-4 flex justify-end">\\n                    <div className="text-center min-w-[240px]">',
  '<div className="pt-4 flex justify-start">\\n                    <div className="text-left min-w-[240px]">'
);
content = content.replace(
  '<div className="mt-8 border-b-2 border-black w-48 mx-auto"></div>',
  '<div className="mt-8 border-b-2 border-black w-48 mx-0"></div>'
);

// Second block around line 969
content = content.replace(
  '<div className="mt-12 flex justify-between font-sans text-xs">\\n                  <div className="text-left">',
  '<div className="mt-12 flex flex-col sm:flex-row justify-between font-sans text-xs">\\n                  <div className="text-left order-2 sm:order-2 mt-8 sm:mt-0">'
);
content = content.replace(
  '<div className="text-center font-black min-w-[220px]">',
  '<div className="text-left font-black min-w-[220px] order-1 sm:order-1">'
);
content = content.replace(
  '<div className="mt-8 border-b-2 border-slate-400 w-44 mx-auto"></div>',
  '<div className="mt-8 border-b-2 border-slate-400 w-44 mx-0"></div>'
);


fs.writeFileSync('src/components/PetitionGeneratorModal.tsx', content);
console.log('Signature alignment patched');
