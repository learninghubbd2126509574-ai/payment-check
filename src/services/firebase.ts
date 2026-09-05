import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { UniversalPayment, RawSmsLog } from '../types';
import defaultConfig from '../../firebase-applet-config.json';

// Build Firebase config using environment variables with fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
};

const databaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  (defaultConfig as any).firestoreDatabaseId ||
  undefined;

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization warning:', err);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { app, db, firebaseConfig, databaseId };

// Firestore collection references
const PAYMENTS_COLLECTION = 'payments';
const RAW_SMS_COLLECTION = 'raw_sms';

/**
 * Subscribe to real-time payments from Firestore
 */
export function subscribeToFirestorePayments(
  callback: (payments: UniversalPayment[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, PAYMENTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const paymentsList: UniversalPayment[] = [];
        snapshot.forEach((docSnap) => {
          paymentsList.push(docSnap.data() as UniversalPayment);
        });
        // Sort descending by timestamp / date
        paymentsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        callback(paymentsList);
      },
      (error) => {
        console.error('Firestore payments subscription error:', error);
        onError?.(error);
      }
    );
  } catch (err) {
    console.error('Error attaching Firestore payments listener:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Save or update payment in Firestore
 */
export async function savePaymentToFirestore(payment: UniversalPayment): Promise<void> {
  const docId = payment.id || payment.transactionId;
  if (!docId) return;
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, docId);
    await setDoc(paymentRef, payment, { merge: true });
  } catch (err) {
    console.error('Failed to save payment to Firestore:', err);
    throw err;
  }
}

/**
 * Delete a payment from Firestore
 */
export async function deletePaymentFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PAYMENTS_COLLECTION, id));
  } catch (err) {
    console.error('Failed to delete payment from Firestore:', err);
    throw err;
  }
}

/**
 * Clear all payments from Firestore (Used by Admin All-Clear)
 */
export async function clearAllFirestorePayments(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PAYMENTS_COLLECTION));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.error('Failed to clear payments in Firestore:', err);
    throw err;
  }
}

/**
 * Save incoming raw SMS directly to Firestore
 */
export async function saveRawSmsToFirestore(rawLog: RawSmsLog): Promise<void> {
  try {
    const docRef = doc(db, RAW_SMS_COLLECTION, rawLog.id);
    await setDoc(docRef, rawLog, { merge: true });
  } catch (err) {
    console.error('Failed to save raw SMS to Firestore:', err);
    throw err;
  }
}
