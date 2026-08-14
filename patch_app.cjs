const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { AgendaModal } from './components/AgendaModal';",
  "import { AgendaModal } from './components/AgendaModal';\nimport { NewsTicker } from './components/NewsTicker';"
);

content = content.replace(
  "      {/* Header Bar */}",
  "      {/* Legislation News Ticker */}\n      <NewsTicker />\n\n      {/* Header Bar */}"
);

fs.writeFileSync('src/App.tsx', content);
