const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// We need to keep only the primary color overrides in the themes, and avoid touching slate/white/black.
// We can also let 'dark' mode use standard Tailwind slate colors.

// We will recreate the themes section in index.css

const themes = `
[data-theme="ocean"] {
  --color-indigo-50: #eff6ff;
  --color-indigo-100: #dbeafe;
  --color-indigo-200: #bfdbfe;
  --color-indigo-300: #93c5fd;
  --color-indigo-400: #60a5fa;
  --color-indigo-500: #3b82f6;
  --color-indigo-600: #2563eb;
  --color-indigo-700: #1d4ed8;
  --color-indigo-800: #1e40af;
  --color-indigo-900: #1e3a8a;
  --color-indigo-950: #172554;
}
[data-theme="ocean-dark"] {
  --color-indigo-50: #eff6ff;
  --color-indigo-100: #dbeafe;
  --color-indigo-200: #bfdbfe;
  --color-indigo-300: #93c5fd;
  --color-indigo-400: #60a5fa;
  --color-indigo-500: #3b82f6;
  --color-indigo-600: #2563eb;
  --color-indigo-700: #1d4ed8;
  --color-indigo-800: #1e40af;
  --color-indigo-900: #1e3a8a;
  --color-indigo-950: #172554;
}
[data-theme="emerald"] {
  --color-indigo-50: #ecfdf5;
  --color-indigo-100: #d1fae5;
  --color-indigo-200: #a7f3d0;
  --color-indigo-300: #6ee7b7;
  --color-indigo-400: #34d399;
  --color-indigo-500: #10b981;
  --color-indigo-600: #059669;
  --color-indigo-700: #047857;
  --color-indigo-800: #065f46;
  --color-indigo-900: #064e3b;
  --color-indigo-950: #022c22;
}
[data-theme="emerald-dark"] {
  --color-indigo-50: #ecfdf5;
  --color-indigo-100: #d1fae5;
  --color-indigo-200: #a7f3d0;
  --color-indigo-300: #6ee7b7;
  --color-indigo-400: #34d399;
  --color-indigo-500: #10b981;
  --color-indigo-600: #059669;
  --color-indigo-700: #047857;
  --color-indigo-800: #065f46;
  --color-indigo-900: #064e3b;
  --color-indigo-950: #022c22;
}
[data-theme="rose"] {
  --color-indigo-50: #fff1f2;
  --color-indigo-100: #ffe4e6;
  --color-indigo-200: #fecdd3;
  --color-indigo-300: #fda4af;
  --color-indigo-400: #fb7185;
  --color-indigo-500: #f43f5e;
  --color-indigo-600: #e11d48;  
  --color-indigo-700: #be123c;
  --color-indigo-800: #9f1239;
  --color-indigo-900: #881337;
  --color-indigo-950: #4c0519;
}
[data-theme="rose-dark"] {
  --color-indigo-50: #fff1f2;
  --color-indigo-100: #ffe4e6;
  --color-indigo-200: #fecdd3;
  --color-indigo-300: #fda4af;
  --color-indigo-400: #fb7185;
  --color-indigo-500: #f43f5e;
  --color-indigo-600: #e11d48;  
  --color-indigo-700: #be123c;
  --color-indigo-800: #9f1239;
  --color-indigo-900: #881337;
  --color-indigo-950: #4c0519;
}
`;

// remove all existing [data-theme] blocks
css = css.replace(/\\[data-theme=".*?"\\]\\s*\\{[\\s\\S]*?\\}/g, '');
css += themes;
fs.writeFileSync('src/index.css', css);
console.log('Fixed index.css');
