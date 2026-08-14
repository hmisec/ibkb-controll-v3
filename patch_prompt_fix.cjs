const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the buggy markdown snippet
content = content.replace(
  /\(örneğin \`\`\`json\) ekleme\./g,
  "(örneğin ```json) ekleme."
);

fs.writeFileSync('server.ts', content);
