const fs = require('fs');
let content = fs.readFileSync('src/components/CloudBackupModal.tsx', 'utf8');

const backupGrid = `
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectTarget('firebase')}
                className={\`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 \${
                  config.target === 'firebase'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-indigo-600" />
                  {config.target === 'firebase' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Firebase</div>
                  <div className="text-[10px] text-slate-500 font-medium">Bulut Veritabanı</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTarget('google_drive')}
                className={\`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 \${
                  config.target === 'google_drive'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  {config.target === 'google_drive' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Google Drive</div>
                  <div className="text-[10px] text-slate-500 font-medium">JSON Dosya Yedeği</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTarget('dropbox')}
                className={\`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 \${
                  config.target === 'dropbox'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  {config.target === 'dropbox' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Dropbox</div>
                  <div className="text-[10px] text-slate-500 font-medium">Otomatik Senkron</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleSelectTarget('syncthing')}
                className={\`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 \${
                  config.target === 'syncthing'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  {config.target === 'syncthing' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Syncthing</div>
                  <div className="text-[10px] text-slate-500 font-medium">P2P Klasör Yedeği</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTarget('both')}
                className={\`col-span-2 sm:col-span-2 p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-2 \${
                  config.target === 'both'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  {config.target === 'both' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-xs font-black">Tümü (Hibrit)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Maksimum Güvenlik</div>
                </div>
              </button>
            </div>
`;

content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-3 gap-2\.5">[\s\S]*?<\/div>\s*<\/div>\s*{\/\* Connected Cloud Services Cards \*\/}/m,
  backupGrid + '\\n          </div>\\n\\n          {/* Connected Cloud Services Cards */}'
);

fs.writeFileSync('src/components/CloudBackupModal.tsx', content);
console.log('Fixed Backup modal UI');
