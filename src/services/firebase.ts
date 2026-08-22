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

export const COLLECTIONS = {
  USERS: 'dayflow_users',
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVE: 'dayflow_leave_requests',
  PAYROLL: 'dayflow_payrolls',
  NOTIFICATIONS: 'dayflow_notifications',
  ACTIVITY: 'dayflow_activity_logs',
};
