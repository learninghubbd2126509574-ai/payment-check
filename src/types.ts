export type Provider = 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Unknown';

export type PaymentType =
  | 'received'
  | 'cash_in'
  | 'money_received'
  | 'cash_in_received'
  | 'unknown';

export interface RawParsedData {
  provider: Provider;
  type: PaymentType;
  amount: number;
  phoneNumber: string;
  last3Digits: string;
  transactionId: string;
  reference?: string | null;
  date: string;
  time: string;
  fee?: number | null;
  balance?: number | null;
}

export interface UniversalPayment {
  id: string;
  provider: Provider;
  paymentType: PaymentType;
  amount: number;
  phoneNumber: string;
  last3Digits: string;
  transactionId: string;
  reference: string | null;
  date: string;
  time: string;
  rawSms: string;
  receivedAt: string;
  timestamp?: number;
  status: 'received';
  fee?: number | null;
  balance?: number | null;
}

export interface DuplicateAttemptLog {
  id: string;
  transactionId: string;
  provider: Provider;
  amount: number;
  rawSms: string;
  attemptedAt: string;
  reason: string;
}

export interface UnknownSmsLog {
  id: string;
  parseStatus: 'unknown';
  rawSms: string;
  receivedAt: string;
  detectedHint?: string;
}

export type RawSmsLog = UnknownSmsLog;

export interface ParseResult {
  success: boolean;
  error?: string;
  provider?: Provider;
  payment?: UniversalPayment;
  duplicate?: boolean;
  rawLog?: UnknownSmsLog;
  pipelineSteps?: {
    step: string;
    detail: string;
    data?: unknown;
  }[];
}
