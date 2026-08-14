const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  "import { EmailRemindersModal } from './components/EmailRemindersModal';",
  "import { EmailRemindersModal } from './components/EmailRemindersModal';\nimport { AgendaModal } from './components/AgendaModal';"
);

appContent = appContent.replace(
  "const [isEmailRemindersOpen, setIsEmailRemindersOpen] = useState(false);",
  "const [isEmailRemindersOpen, setIsEmailRemindersOpen] = useState(false);\n  const [isAgendaOpen, setIsAgendaOpen] = useState(false);"
);

appContent = appContent.replace(
  "onOpenEmailReminders={() => setIsEmailRemindersOpen(true)}",
  "onOpenEmailReminders={() => setIsEmailRemindersOpen(true)}\n        onOpenAgenda={() => setIsAgendaOpen(true)}"
);

appContent = appContent.replace(
  "{/* Email Reminders Modal */}",
  "{/* Agenda Modal */}\n      <AgendaModal\n        isOpen={isAgendaOpen}\n        onClose={() => setIsAgendaOpen(false)}\n        declarations={declarations}\n      />\n\n      {/* Email Reminders Modal */}"
);

fs.writeFileSync('src/App.tsx', appContent);

let headerContent = fs.readFileSync('src/components/Header.tsx', 'utf8');

headerContent = headerContent.replace(
  "import {\n  ShieldAlert,",
  "import {\n  CalendarDays,\n  ShieldAlert,"
);

headerContent = headerContent.replace(
  "onOpenEmailReminders: () => void;",
  "onOpenEmailReminders: () => void;\n  onOpenAgenda: () => void;"
);

headerContent = headerContent.replace(
  "onOpenEmailReminders,",
  "onOpenEmailReminders,\n  onOpenAgenda,"
);

headerContent = headerContent.replace(
  "{/* Email Reminders Button */}",
  "{/* Agenda Button */}\n            <button\n              onClick={onOpenAgenda}\n              className=\"flex items-center space-x-1.5 bg-fuchsia-50 dark:bg-fuchsia-950/80 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-200 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 transition-colors\"\n              title=\"Kapanma Süreleri Ajandası\"\n            >\n              <CalendarDays className=\"w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400\" />\n              <span className=\"hidden sm:inline\">AJANDA</span>\n            </button>\n\n            {/* Email Reminders Button */}"
);

fs.writeFileSync('src/components/Header.tsx', headerContent);
