import { UniversalPayment, DuplicateAttemptLog, UnknownSmsLog, ParseResult } from '../types';
import { parseMfsSms } from '../parsers';
import {
  subscribeToFirestorePayments,
  savePaymentToFirestore,
  deletePaymentFromFirestore,
  clearAllFirestorePayments,
  db,
  saveRawSmsToFirestore,
} from './firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  PAYMENTS: 'mfs_parsed_payments',
  DUPLICATES: 'mfs_duplicate_logs',
  RAW_LOGS: 'mfs_raw_sms_logs',
  INITIALIZED: 'mfs_seeded_v3',
};

// Default sample SMS items
export const SAMPLE_PROMPT_SMS = [
  {
    id: 'sample-bkash-recv',
    title: 'bKash Received (Tk 500)',
    sms: 'You have received Tk 500.00 from 01871146049. Fee Tk 0.00. Balance Tk 15,708.79. TrxID DI5276PLJY at 05/09/2026 21:01',
    expectedLast3: '049',
    expectedAmount: 500.0,
  },
  {
    id: 'sample-bkash-cashin',
    title: 'bKash Cash In (Tk 499)',
    sms: 'Cash In Tk 499.00 from 01897379152 successful. Fee Tk 0.00. Balance Tk 16,207.79. TrxID DI5876R1VG at 05/09/2026 21:02. Download App: https://bKa.sh/8app',
    expectedLast3: '152',
    expectedAmount: 499.0,
  },
  {
    id: 'sample-nagad-recv',
    title: 'Nagad Money Received (Tk 499)',
    sms: `Money Received.
Amount: Tk 499.00
Sender: 01816926823
Ref: 2
TxnID: 75XVTPVI
Balance: Tk 8781.58
05/09/2026 20:29`,
    expectedLast3: '823',
    expectedAmount: 499.0,
  },
  {
    id: 'sample-nagad-cashin',
    title: 'Nagad Cash In (Tk 599 Uddokta)',
    sms: `Cash In Received.
Amount: Tk 599.00
Uddokta: 01960080062
TxnID: 75X3V7DE
Balance: 2957.58
01/09/2026 22:12`,
    expectedLast3: '062',
    expectedAmount: 599.0,
  },
  {
    id: 'sample-rocket-recv',
    title: 'Rocket / NexusPay (***759)',
    sms: 'Tk499.00 received from A/C:***759 Fee:Tk0, Your A/C Balance: Tk1,015.79 TxnId:6910652291 Date:04-SEP-26 04:15:53 pm. Download https://bit.ly/nexuspay',
    expectedLast3: '759',
    expectedAmount: 499.0,
  },
  {
    id: 'sample-multi-1',
    title: 'Multi-Match Test: bKash (Tk 500, ends 123)',
    sms: 'You have received Tk 500.00 from 01711111123. Fee Tk 0.00. Balance Tk 18,208.79. TrxID MULTI_A123 at 05/09/2026 23:10',
    expectedLast3: '123',
    expectedAmount: 500.0,
  },
  {
    id: 'sample-multi-2',
    title: 'Multi-Match Test: Nagad (Tk 499, ends 123)',
    sms: `Money Received.
Amount: Tk 499.00
Sender: 01922222123
Ref: 99
TxnID: MULTI_B123
Balance: Tk 9100.00
05/09/2026 22:58`,
    expectedLast3: '123',
    expectedAmount: 499.0,
  },
];

class MfsStorageService {
  private payments: UniversalPayment[] = [];
  private duplicateLogs: DuplicateAttemptLog[] = [];
  private rawSmsLogs: UnknownSmsLog[] = [];
  private listeners: (() => void)[] = [];
  private isFirebaseConnected: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.initFirebaseRealtimeSync();
  }

  private loadFromStorage() {
    try {
      const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      const storedDuplicates = localStorage.getItem(STORAGE_KEYS.DUPLICATES);
      const storedRawLogs = localStorage.getItem(STORAGE_KEYS.RAW_LOGS);

      if (storedPayments) {
        this.payments = JSON.parse(storedPayments);
      }
      if (storedDuplicates) {
        this.duplicateLogs = JSON.parse(storedDuplicates);
      }
      if (storedRawLogs) {
        this.rawSmsLogs = JSON.parse(storedRawLogs);
      }

      // Initial seed if empty
      if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
        this.seedInitialSamples();
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (e) {
      console.error('Failed to load local database', e);
      this.seedInitialSamples();
    }
  }

  /**
   * Initializes real-time two-way synchronization with Firebase Firestore
   */
  private initFirebaseRealtimeSync() {
    try {
      // 1. Listen for real-time payments collection
      subscribeToFirestorePayments(
        (remotePayments) => {
          this.isFirebaseConnected = true;
          if (remotePayments && remotePayments.length > 0) {
            // Merge remote payments with local without duplicates
            const map = new Map<string, UniversalPayment>();
            // Keep remote as primary source of truth
            remotePayments.forEach((p) => {
              const key = (p.transactionId || p.id).toUpperCase();
              map.set(key, p);
            });
            // Also keep any local payments that haven't synced yet
            this.payments.forEach((p) => {
              const key = (p.transactionId || p.id).toUpperCase();
              if (!map.has(key)) {
                map.set(key, p);
                // Push local to remote
                savePaymentToFirestore(p).catch((err) =>
                  console.warn('Sync payment to firestore error:', err)
                );
              }
            });

            this.payments = Array.from(map.values()).sort(
              (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
            );
            this.saveToStorage(false); // save locally without re-notifying in loop
            this.notifyListeners();
          }
        },
        (err) => {
          console.warn('Firestore subscription error (will use offline local storage):', err);
        }
      );

      // 2. Listen for raw_sms collection from Android SMS Forwarder
      try {
        const rawSmsCol = collection(db, 'raw_sms');
        onSnapshot(rawSmsCol, (snap) => {
          this.isFirebaseConnected = true;
          snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const rawVal = data.sms || data.body || data.text || data.message;
              const smsText = typeof rawVal === 'string' ? rawVal : (rawVal?.stringValue || '');
              const isProcessed = data.processed === true || data.processed?.booleanValue === true;
              if (smsText && !isProcessed) {
                // Process this raw SMS from phone
                this.processIncomingSms(smsText);
                // Mark doc as processed in Firestore
                setDoc(change.doc.ref, { processed: true, processedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
              }
            }
          });
        });
      } catch (err) {
        console.warn('Raw SMS listener warning:', err);
      }
    } catch (e) {
      console.warn('Firebase setup deferred / offline:', e);
    }
  }

  private saveToStorage(notify = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
      localStorage.setItem(STORAGE_KEYS.DUPLICATES, JSON.stringify(this.duplicateLogs));
      localStorage.setItem(STORAGE_KEYS.RAW_LOGS, JSON.stringify(this.rawSmsLogs));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
    if (notify) {
      this.notifyListeners();
    }
  }

  public getIsFirebaseConnected(): boolean {
    return this.isFirebaseConnected;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  public seedInitialSamples() {
    this.payments = [];
    this.duplicateLogs = [];
    this.rawSmsLogs = [];

    // Parse all prompt samples into payments
    for (const sample of SAMPLE_PROMPT_SMS) {
      const res = parseMfsSms(sample.sms);
      if (res.success && res.payment) {
        this.payments.push(res.payment);
        // Also save to Firestore
        savePaymentToFirestore(res.payment).catch(() => {});
      }
    }

    this.saveToStorage();
  }

  public getPayments(): UniversalPayment[] {
    return [...this.payments];
  }

  public getDuplicateLogs(): DuplicateAttemptLog[] {
    return [...this.duplicateLogs];
  }

  public getRawSmsLogs(): UnknownSmsLog[] {
    return [...this.rawSmsLogs];
  }

  /**
   * Process incoming SMS through the full pipeline:
   * Parse -> Validate -> Duplicate Check -> Store in LocalStorage & Firestore
   */
  public processIncomingSms(rawSms: string): ParseResult {
    const parseResult = parseMfsSms(rawSms);

    if (!parseResult.success) {
      // Log unknown or failed parse to raw_sms_logs
      if (parseResult.rawLog) {
        this.rawSmsLogs.unshift(parseResult.rawLog);
        this.saveToStorage();
        saveRawSmsToFirestore(parseResult.rawLog).catch(() => {});
      }
      return parseResult;
    }

    const newPayment = parseResult.payment!;

    // Duplicate Protection: Transaction ID must be treated as primary unique identifier
    const existingIndex = this.payments.findIndex(
      (p) => p.transactionId.toLowerCase() === newPayment.transactionId.toLowerCase()
    );

    if (existingIndex !== -1) {
      const duplicateLog: DuplicateAttemptLog = {
        id: `DUP-${Date.now()}`,
        transactionId: newPayment.transactionId,
        provider: newPayment.provider,
        amount: newPayment.amount,
        rawSms,
        attemptedAt: new Date().toISOString(),
        reason: `Transaction ID '${newPayment.transactionId}' already recorded in payments on ${this.payments[existingIndex].receivedAt}.`,
      };

      this.duplicateLogs.unshift(duplicateLog);
      this.saveToStorage();

      return {
        ...parseResult,
        success: false,
        duplicate: true,
        error: `DUPLICATE PAYMENT REJECTED: Transaction ID ${newPayment.transactionId} already exists in the database. Logged to duplicate attempts.`,
      };
    }

    // Step 6. Passed duplicate check, insert new payment locally and in Firestore
    this.payments.unshift(newPayment);
    this.saveToStorage();

    // Persist directly to Firebase Firestore
    savePaymentToFirestore(newPayment).catch((err) => {
      console.warn('Failed to push payment to Firestore (saved in localStorage):', err);
    });

    return {
      ...parseResult,
      pipelineSteps: [
        ...(parseResult.pipelineSteps || []),
        {
          step: '6. Duplicate Protection Check (PASSED)',
          detail: `Transaction ID '${newPayment.transactionId}' is unique. No prior records found.`,
          data: { transactionId: newPayment.transactionId, isUnique: true },
        },
        {
          step: '7. Cloud Database Persistence',
          detail: 'Payment securely synced to Firebase Firestore & local storage.',
          data: newPayment,
        },
      ],
    };
  }

  /**
   * Search for payments matching the given last 3 digits.
   * String comparison: "049" === "049", preserves leading zeroes!
   */
  public searchByLast3Digits(last3Digits: string, expectedAmount?: number): UniversalPayment[] {
    const query = String(last3Digits).trim();
    if (!query) return [];

    let matches = this.payments.filter((p) => p.last3Digits === query);

    if (expectedAmount !== undefined && !isNaN(expectedAmount) && expectedAmount > 0) {
      const amountMatches = matches.filter((p) => Math.abs(p.amount - expectedAmount) < 0.01);
      if (amountMatches.length > 0) {
        const otherMatches = matches.filter((p) => Math.abs(p.amount - expectedAmount) >= 0.01);
        matches = [...amountMatches, ...otherMatches];
      }
    }

    // Sort newest first
    return matches.sort((a, b) => {
      const dateA = a.timestamp || new Date(a.receivedAt).getTime();
      const dateB = b.timestamp || new Date(b.receivedAt).getTime();
      return dateB - dateA;
    });
  }

  public deletePayment(id: string) {
    this.payments = this.payments.filter((p) => p.id !== id && p.transactionId !== id);
    this.saveToStorage();
    deletePaymentFromFirestore(id).catch((err) => {
      console.warn('Failed to delete from Firestore:', err);
    });
  }

  public clearAll() {
    this.payments = [];
    this.duplicateLogs = [];
    this.rawSmsLogs = [];
    this.saveToStorage();
    clearAllFirestorePayments().catch((err) => {
      console.warn('Failed to clear Firestore:', err);
    });
  }
}

export const mfsStorage = new MfsStorageService();
