import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_API_KEY
);

const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const db = app ? getFirestore(app) : null;

export const DEFAULT_ORG_ID = 'org_dayflow';

export const getOrgCollectionPath = (orgId: string = DEFAULT_ORG_ID, collectionName: string) => {
  return `organizations/${orgId}/${collectionName}`;
};

export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave_requests',
  PAYROLL: 'payrolls',
  NOTIFICATIONS: 'notifications',
  ACTIVITY: 'audit_logs',
};
