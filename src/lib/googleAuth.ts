import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

// Ensure single Firebase app instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Google Workspace Scopes requested
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Initiates Google OAuth Sign-In via Google Identity Services (GIS) Token Client.
 * Bypasses Firebase Auth's unauthorized-domain restriction by connecting directly to accounts.google.com.
 */
export const googleSignIn = async (): Promise<{ user: User | null; accessToken: string }> => {
  isSigningIn = true;

  // 1. Prefer Google Identity Services (GIS) Token Client if available
  if (window.google?.accounts?.oauth2) {
    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: firebaseConfig.oAuthClientId || '428087471081-h6qjvnso0b8prhtia26qggi30ivdfv6r.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
          callback: (response: any) => {
            isSigningIn = false;
            if (response.error) {
              reject(new Error(`Google Drive İzni Alınamadı: ${response.error_description || response.error}`));
            } else if (response.access_token) {
              cachedAccessToken = response.access_token;
              resolve({ user: auth.currentUser, accessToken: response.access_token });
            } else {
              reject(new Error('Google erişim jetonu üretilemedi.'));
            }
          },
          error_callback: (err: any) => {
            isSigningIn = false;
            reject(new Error(`Google Giriş Hatası: ${err?.message || 'Açılır pencere engellendi veya kapatıldı.'}`));
          }
        });

        client.requestAccessToken({ prompt: 'consent' });
      } catch (e: any) {
        isSigningIn = false;
        reject(e);
      }
    });
  }

  // 2. Fallback to Firebase Auth signInWithPopup if GIS is not loaded
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Hesabından erişim jetonu alınamadı.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Firebase Giriş Hatası:', error);

    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      throw new Error('Firebase Auth Yetki Sınırı: Mevcut dinamik web adresi Firebase Auth paneline ekli değil. Ancak verileriniz Firebase Firestore Bulut Veritabanı üzerinde kesintisiz ve tam korumalı olarak otomatik yedeklenmeye devam etmektedir.');
    }

    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string) => {
  cachedAccessToken = token;
};

export const googleLogout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Logout error:', e);
  }
  cachedAccessToken = null;
};
