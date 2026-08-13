import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { UserSession } from '../types';

interface SecurityPinModalProps {
  isOpen: boolean;
  session: UserSession;
  appLockEnabled: boolean;
  appPassword: string;
  onClose: () => void;
  onUpdateRole: (newRole: UserSession['userRole'], newName: string) => void;
  onUpdateSecurityConfig: (enabled: boolean, newPassword: string) => void;
  onLockAppNow: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  session,
  appLockEnabled,
  appPassword,
  onClose,
  onUpdateRole,
  onUpdateSecurityConfig,
  onLockAppNow,
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<UserSession['userRole']>(session.userRole);
  const [userName, setUserName] = useState(session.userName);
  const [enableLock, setEnableLock] = useState(appLockEnabled);
  const [newPass, setNewPass] = useState(appPassword || '1234');
  const [confirmPass, setConfirmPass] = useState(appPassword || '1234');
  const [passError, setPassError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setSuccessMsg('');

    if (enableLock) {
      if (!newPass || newPass.trim().length < 3) {
        setPassError('Şifre en az 3 karakter veya rakam olmalıdır.');
        return;
      }
      if (newPass !== confirmPass) {
        setPassError('Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.');
        return;
      }
    }

    onUpdateRole(selectedRole, userName);
    onUpdateSecurityConfig(enableLock, newPass);
    setSuccessMsg('Güvenlik ayarları ve giriş şifresi başarıyla kaydedildi.');

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full text-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">GÜVENLİ ARAYÜZ & ROL ERİŞİMİ</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Veri güvenliği ve kullanıcı yetkilendirme modülü</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Kullanıcı Adı ve Unvan
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
              Erişim Rolü Seçin
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none"
            >
              <option value="ADMIN">Sistem Yöneticisi (Tam Yetki)</option>
              <option value="EXPORT_SPECIALIST">Dış Ticaret Uzmanı (İBKB / Beyanname Girme)</option>
              <option value="ACCOUNTANT">Muhasebe Operatörü (Ödeme & Dekont İzleme)</option>
              <option value="AUDITOR">Mevzuat Denetçisi (Sadece Okuma)</option>
            </select>
          </div>

          {/* Toggle App Lock on Entry */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900 uppercase text-xs flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>SİSTEME GİRİŞTE ŞİFRE ZORUNLULUĞU</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Uygulama her açıldığında kilit ekranının gelmesini sağlar.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enableLock}
                  onChange={(e) => setEnableLock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {enableLock && (
              <div className="pt-2 border-t border-slate-200 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-slate-600 font-bold text-[11px] uppercase mb-1">
                    Yeni Sistem Giriş Şifresi / PIN
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Şifrenizi giriniz..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-[11px] uppercase mb-1">
                    Şifre Tekrar Onay
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Şifreyi tekrar giriniz..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {passError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-xs">
              {passError}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs">
              {successMsg}
            </div>
          )}

          <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="text-[11px] text-indigo-900 font-medium">
              Ekranı hemen kilitlemek mi istiyorsunuz?
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockAppNow();
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-extrabold text-[11px] uppercase rounded-xl transition shadow-xs flex items-center gap-1 shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sert Kilitle</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition border border-slate-200"
            >
              İPTAL
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center space-x-1.5 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>KAYDET & GÜNCELLE</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
