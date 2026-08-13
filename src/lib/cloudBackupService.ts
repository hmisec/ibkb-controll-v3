import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, getAccessToken } from './googleAuth';
import { Declaration, AuditLog, UserSession } from '../types';

export interface BackupState {
  declarations: Declaration[];
  auditLogs: AuditLog[];
  session?: UserSession;
  updatedAt: string;
  backupCount: number;
  version: string;
}

export interface CloudBackupConfig {
  autoBackupEnabled: boolean;
  target: 'firebase' | 'google_drive' | 'both';
  lastBackupTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastError: string | null;
  totalBackupsCount: number;
}

export interface BackupLogEntry {
  id: string;
  timestamp: string;
  declarationCount: number;
  target: string;
  status: 'SUCCESS' | 'FAILED';
  details: string;
}

const CONFIG_KEY = 'ibkb_cloud_backup_config_v1';
const HISTORY_KEY = 'ibkb_cloud_backup_history_v1';

export const getStoredBackupConfig = (): CloudBackupConfig => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Config okuma hatası:', e);
    }
  }
  return {
    autoBackupEnabled: true,
    target: 'both',
    lastBackupTime: null,
    status: 'idle',
    lastError: null,
    totalBackupsCount: 0,
  };
};

export const saveStoredBackupConfig = (config: CloudBackupConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const getBackupHistory = (): BackupLogEntry[] => {
  const saved = localStorage.getItem(HISTORY_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('History okuma hatası:', e);
    }
  }
  return [];
};

export const addBackupHistoryEntry = (entry: Omit<BackupLogEntry, 'id'>) => {
  const history = getBackupHistory();
  const newEntry: BackupLogEntry = {
    ...entry,
    id: 'log_' + Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, 30); // Keep last 30
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Saves state snapshot to Firebase Firestore
 */
export const saveToFirebaseFirestore = async (backupPayload: BackupState): Promise<void> => {
  try {
    const docRef = doc(db, 'ibkb_backups', 'latest_backup');
    await setDoc(docRef, {
      ...backupPayload,
      serverTimestamp: serverTimestamp(),
    });

    // Also push to historical collection
    const historyColRef = collection(db, 'ibkb_backup_history');
    await addDoc(historyColRef, {
      timestamp: backupPayload.updatedAt,
      declarationCount: backupPayload.declarations.length,
      auditLogCount: backupPayload.auditLogs.length,
      serverTimestamp: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Firebase Firestore Yedekleme Hatası:', error);
    throw new Error(error?.message || 'Firebase Firestore sunucusuna erişilemedi.');
  }
};

/**
 * Searches for existing backup file on Google Drive
 */
const findGoogleDriveBackupFile = async (accessToken: string): Promise<string | null> => {
  const query = encodeURIComponent("name = 'ibkb_declarations_backup.json' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Google Drive dosya arama başarısız.');
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
};

/**
 * Saves state snapshot to Google Drive
 */
export const saveToGoogleDrive = async (accessToken: string, backupPayload: BackupState): Promise<string> => {
  const fileContent = JSON.stringify(backupPayload, null, 2);
  const existingFileId = await findGoogleDriveBackupFile(accessToken);

  if (existingFileId) {
    // Update existing file
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const response = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive güncellenemedi: ${errText}`);
    }

    return existingFileId;
  } else {
    // Create new file with metadata
    const metadata = {
      name: 'ibkb_declarations_backup.json',
      mimeType: 'application/json',
      description: 'TCMB İhracat & İBKB Takip Sistemi Otomatik Bulut Yedekleme Dosyası',
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([fileContent], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive dosya oluşturulamadı: ${errText}`);
    }

    const result = await response.json();
    return result.id;
  }
};

/**
 * Restores state snapshot from Firebase Firestore
 */
export const restoreFromFirebaseFirestore = async (): Promise<BackupState | null> => {
  try {
    const docRef = doc(db, 'ibkb_backups', 'latest_backup');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as BackupState;
      return data;
    }
    return null;
  } catch (error: any) {
    console.error('Firebase Restore Hatası:', error);
    throw new Error(error?.message || 'Firebase bulut yedeklemesi bulunamadı.');
  }
};

/**
 * Restores state snapshot from Google Drive
 */
export const restoreFromGoogleDrive = async (accessToken: string): Promise<BackupState | null> => {
  const fileId = await findGoogleDriveBackupFile(accessToken);
  if (!fileId) {
    throw new Error('Google Drive hesabınızda "ibkb_declarations_backup.json" yedek dosyası bulunamadı.');
  }

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Google Drive yedek dosyası indirilemedi.');
  }

  const data = await response.json();
  return data as BackupState;
};

/**
 * Core Orchestrator Function to execute Cloud Backup
 */
export const performCloudBackup = async (
  declarations: Declaration[],
  auditLogs: AuditLog[],
  session?: UserSession,
  customTarget?: 'firebase' | 'google_drive' | 'both'
): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const config = getStoredBackupConfig();
  const target = customTarget || config.target;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const payload: BackupState = {
    declarations,
    auditLogs,
    session,
    updatedAt: nowStr,
    backupCount: config.totalBackupsCount + 1,
    version: '2026.1',
  };

  let firebaseSuccess = false;
  let googleDriveSuccess = false;
  const errors: string[] = [];

  // 1. Firebase Firestore Backup
  if (target === 'firebase' || target === 'both') {
    try {
      await saveToFirebaseFirestore(payload);
      firebaseSuccess = true;
    } catch (e: any) {
      errors.push(`Firebase: ${e.message}`);
    }
  }

  // 2. Google Drive Backup
  if (target === 'google_drive' || target === 'both') {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        await saveToGoogleDrive(accessToken, payload);
        googleDriveSuccess = true;
      } else {
        // If not logged in with Google OAuth, try to save locally/alert
        if (target === 'google_drive') {
          errors.push('Google Drive: Google oturumu açık değil.');
        }
      }
    } catch (e: any) {
      errors.push(`Google Drive: ${e.message}`);
    }
  }

  const totalSuccess = firebaseSuccess || googleDriveSuccess;
  const updatedCount = config.totalBackupsCount + (totalSuccess ? 1 : 0);

  const newConfig: CloudBackupConfig = {
    ...config,
    lastBackupTime: totalSuccess ? nowStr : config.lastBackupTime,
    status: totalSuccess ? 'success' : 'error',
    lastError: errors.length > 0 ? errors.join(' | ') : null,
    totalBackupsCount: updatedCount,
  };
  saveStoredBackupConfig(newConfig);

  // Record History
  const targetLabel = target === 'both' ? 'Firebase + Google Drive' : target === 'firebase' ? 'Firebase' : 'Google Drive';
  addBackupHistoryEntry({
    timestamp: nowStr,
    declarationCount: declarations.length,
    target: targetLabel,
    status: totalSuccess ? 'SUCCESS' : 'FAILED',
    details: totalSuccess 
      ? `${declarations.length} beyanname buluta başarıyla eşitlendi.`
      : errors.join(', '),
  });

  if (totalSuccess) {
    return {
      success: true,
      message: `Otomatik bulut yedekleme tamamlandı (${targetLabel}).`,
      timestamp: nowStr,
    };
  } else {
    return {
      success: false,
      message: errors.join(' | ') || 'Yedekleme başarısız oldu.',
      timestamp: nowStr,
    };
  }
};
