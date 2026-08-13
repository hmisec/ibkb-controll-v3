import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { UserSession } from '../types';

interface SecurityPinModalProps {
  isOpen: boolean;
  session: UserSession;
  onClose: () => void;
  onUpdateRole: (newRole: UserSession['userRole'], newName: string) => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  session,
  onClose,
  onUpdateRole,
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<UserSession['userRole']>(session.userRole);
  const [userName, setUserName] = useState(session.userName);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'ADMIN' && pin && pin !== '1234') {
      setPinError('Hatalı Yönetici PIN Kodu! (Varsayılan PIN: 1234)');
      return;
    }

    onUpdateRole(selectedRole, userName);
    onClose();
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

          {selectedRole === 'ADMIN' && (
            <div>
              <label className="block text-slate-500 font-black text-xs uppercase tracking-wider mb-1">
                Yönetici Doğrulama PIN Kodu (Simülasyon PIN: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                placeholder="4 Haneli PIN"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-black tracking-widest text-center focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
              {pinError && <p className="text-red-600 text-xs mt-1 font-bold">{pinError}</p>}
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs space-y-1">
            <div className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              VERİ GİZLİLİĞİ GÜVENCESİ:
            </div>
            <p className="font-medium text-slate-600">
              Gümrük beyannameleri, vergi numaraları ve banka İBKB tutarları şifrelenmiş yerel depolama ve güvenli sunucu proxysi ile korunmaktadır.
            </p>
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
              <span>GÜVENLİ OTURUMU GÜNCELLE</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
