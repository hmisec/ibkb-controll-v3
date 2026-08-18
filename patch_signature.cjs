const fs = require('fs');
let content = fs.readFileSync('src/components/PetitionGeneratorModal.tsx', 'utf8');

content = content.replace(/className="pt-4 flex justify-end"/g, 'className="pt-4 flex justify-start"');
content = content.replace(/className="text-center min-w-\\[240px\\]"/g, 'className="text-left min-w-[240px]"');

fs.writeFileSync('src/components/PetitionGeneratorModal.tsx', content);
console.log('Fixed');
