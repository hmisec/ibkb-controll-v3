import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AppLockScreenProps {
  companyName: string;
  userRole: string;
  userName: string;
  storedPassword: string;
  onUnlock: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  companyName,
  userRole,
  userName,
  storedPassword,
  onUnlock,
}) => {
  const [inputPass, setInputPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetPass = storedPassword || '1234';

    if (inputPass === targetPass) {
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg(`Hatalı Giriş Şifresi! Lütfen tekrar deneyiniz. (Varsayılan PIN: ${targetPass})`);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleFillDemo = () => {
    const targetPass = storedPassword || '1234';
    setInputPass(targetPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white transition-all duration-200 ${
        isShaking ? 'animate-bounce' : ''
      }`}>
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-800 text-center relative">
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-3">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="flex items-center justify-center space-x-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              İBKB & İHRACAT TAKİP SİSTEMİ
            </h2>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{companyName || 'GLOBAL EXPORT & LOGISTICS INT. LTD. ŞTİ.'}</span>
          </p>

          <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KORUMALI OTURUM ERİŞİM KİLİDİ</span>
          </div>

        </div>

        {/* Lock Form */}
        <form onSubmit={handleUnlock} className="p-6 sm:p-8 space-y-5">
          
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight">GÜVENLİ GİRİŞ</h3>
            <p className="text-xs text-slate-400 font-medium">
              Arayüze erişmek için belirlenen güvenlik şifrenizi giriniz.
            </p>
          </div>

          {/* Current User Info */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Aktif Kullanıcı</div>
              <div className="font-black text-white">{userName || 'Ahmet Yılmaz'}</div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-black text-[10px] rounded-lg uppercase">
              {userRole || 'Sistem Yöneticisi'}
            </span>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Erişim Şifresi / PIN Kodu
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>

              <input
                type={showPass ? 'text' : 'password'}
                autoFocus
                value={inputPass}
                onChange={(e) => {
                  setInputPass(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Şifre veya PIN giriniz..."
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl pl-11 pr-11 py-3 text-white font-mono font-bold tracking-widest text-sm focus:outline-none transition shadow-inner"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <Unlock className="w-4 h-4" />
              <span>GİRİŞ YAP & KİLİDİ AÇ</span>
            </button>

            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              <span>Demo Varsayılan Şifreyi Doldur (1234)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security Assurance footer */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL Şifrelenmiş Cihaz İçi Yerel Güvenlik Katmanı</span>
          </div>

        </form>

      </div>
    </div>
  );
};
