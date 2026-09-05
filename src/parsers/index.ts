import { detectProvider } from './providerDetector';
import { parseBkash } from './bkashParser';
import { parseNagad } from './nagadParser';
import { parseRocket } from './rocketParser';
import { parseUpay } from './upayParser';
import { RawParsedData, UniversalPayment, UnknownSmsLog, ParseResult } from '../types';

export { detectProvider } from './providerDetector';
export { parseBkash } from './bkashParser';
export { parseNagad } from './nagadParser';
export { parseRocket } from './rocketParser';
export { parseUpay } from './upayParser';
export { extractPaymentAmount, extractFee, extractBalance } from './amountParser';
export { extractLast3Digits, extractBkashPhone, extractNagadPhone, extractRocketPhone } from './phoneParser';
export { extractTransactionId, extractReference } from './transactionParser';
export { extractDateTime } from './dateTimeParser';

/**
 * Normalizes provider-specific raw data into the Universal Payment Schema.
 */
export function normalizePayment(
  raw: RawParsedData,
  rawSms: string,
  timestamp: string = new Date().toISOString()
): UniversalPayment {
  return {
    id: raw.transactionId || `PAY-${Date.now()}`,
    provider: raw.provider,
    paymentType: raw.type,
    amount: Number(raw.amount.toFixed(2)),
    phoneNumber: String(raw.phoneNumber),
    last3Digits: String(raw.last3Digits),
    transactionId: String(raw.transactionId),
    reference: raw.reference ?? null,
    date: String(raw.date),
    time: String(raw.time),
    rawSms,
    receivedAt: timestamp,
    status: 'received',
    fee: raw.fee ?? null,
    balance: raw.balance ?? null,
  };
}

/**
 * Validates normalized payment data against strict integrity rules.
 */
export function validatePayment(payment: UniversalPayment): { valid: boolean; reason?: string } {
  if (!payment.amount || isNaN(payment.amount) || payment.amount <= 0) {
    return { valid: false, reason: 'Invalid or non-positive amount' };
  }
  if (!payment.phoneNumber || payment.phoneNumber.trim().length < 3) {
    return { valid: false, reason: 'Missing or malformed phone/account number' };
  }
  if (!payment.last3Digits || payment.last3Digits.length !== 3) {
    return { valid: false, reason: 'last3Digits must be exactly 3 characters' };
  }
  if (!payment.transactionId || payment.transactionId.trim().length === 0) {
    return { valid: false, reason: 'Missing transaction ID' };
  }
  if (!payment.date || !payment.time) {
    return { valid: false, reason: 'Missing date or time specification' };
  }
  return { valid: true };
}

/**
 * Main parser entry point executing the step-by-step pipeline:
 * 1. Raw SMS
 * 2. Provider Detection
 * 3. Provider-specific Parser
 * 4. Normalize Data
 * 5. Validate Data
 */
export function parseMfsSms(rawSms: string): ParseResult {
  const trimmed = rawSms.trim();
  const steps: { step: string; detail: string; data?: unknown }[] = [];

  steps.push({
    step: '1. Raw SMS Received',
    detail: `Input length: ${trimmed.length} characters`,
    data: trimmed,
  });

  if (!trimmed) {
    return {
      success: false,
      error: 'Empty SMS received',
      pipelineSteps: steps,
    };
  }

  // Step 2: Provider Detection
  const provider = detectProvider(trimmed);
  steps.push({
    step: '2. Provider Detection',
    detail: `Identified provider: ${provider}`,
    data: { provider },
  });

  if (provider === 'Unknown') {
    const unknownLog: UnknownSmsLog = {
      id: `UNK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      parseStatus: 'unknown',
      rawSms: trimmed,
      receivedAt: new Date().toISOString(),
      detectedHint: 'Could not match known signatures for bKash, Nagad, Rocket, or Upay',
    };

    steps.push({
      step: 'Parser Aborted',
      detail: 'Message routed to raw_sms_logs for future parser improvements.',
      data: unknownLog,
    });

    return {
      success: false,
      error: 'Unsupported or unknown SMS format. Logged to raw_sms_logs.',
      provider: 'Unknown',
      rawLog: unknownLog,
      pipelineSteps: steps,
    };
  }

  // Step 3: Provider-Specific Parser
  let parsedRaw: RawParsedData | null = null;
  switch (provider) {
    case 'bKash':
      parsedRaw = parseBkash(trimmed);
      break;
    case 'Nagad':
      parsedRaw = parseNagad(trimmed);
      break;
    case 'Rocket':
      parsedRaw = parseRocket(trimmed);
      break;
    case 'Upay':
      parsedRaw = parseUpay(trimmed);
      break;
  }

  if (!parsedRaw) {
    const unknownLog: UnknownSmsLog = {
      id: `UNK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      parseStatus: 'unknown',
      rawSms: trimmed,
      receivedAt: new Date().toISOString(),
      detectedHint: `Identified as ${provider} candidate but failed syntactic parsing`,
    };

    steps.push({
      step: `3. ${provider} Parser Execution`,
      detail: `Parser failed to extract required fields (amount/phone/TrxID/date).`,
      data: unknownLog,
    });

    return {
      success: false,
      error: `Failed to extract complete payment details from ${provider} SMS. Logged to raw_sms_logs.`,
      provider,
      rawLog: unknownLog,
      pipelineSteps: steps,
    };
  }

  steps.push({
    step: `3. ${provider} Parser Execution`,
    detail: `Successfully extracted: TrxID=${parsedRaw.transactionId}, Amount=৳${parsedRaw.amount}, Phone=${parsedRaw.phoneNumber}, Last3=${parsedRaw.last3Digits}`,
    data: parsedRaw,
  });

  // Step 4: Normalize Data
  const normalized = normalizePayment(parsedRaw, trimmed);
  steps.push({
    step: '4. Data Normalization',
    detail: 'Standardized into Universal Parsed Payment Schema',
    data: normalized,
  });

  // Step 5: Validate Data
  const validation = validatePayment(normalized);
  if (!validation.valid) {
    steps.push({
      step: '5. Data Validation Failed',
      detail: validation.reason || 'Integrity check failed',
      data: validation,
    });

    return {
      success: false,
      error: `Validation error: ${validation.reason}`,
      provider,
      pipelineSteps: steps,
    };
  }

  steps.push({
    step: '5. Data Validation Passed',
    detail: 'Amount, Phone, TransactionID, and Last3Digits verified strictly.',
    data: { valid: true },
  });

  return {
    success: true,
    provider,
    payment: normalized,
    pipelineSteps: steps,
  };
}
