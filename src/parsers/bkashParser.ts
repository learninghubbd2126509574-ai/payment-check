import { RawParsedData } from '../types';
import { extractPaymentAmount, extractFee, extractBalance } from './amountParser';
import { extractBkashPhone, extractLast3Digits } from './phoneParser';
import { extractTransactionId } from './transactionParser';
import { extractDateTime } from './dateTimeParser';

/**
 * Parser specifically designed for bKash SMS formats:
 * 1. Customer Received:
 *    "You have received Tk 500.00 from 01871146049. Fee Tk 0.00. Balance Tk 15,708.79. TrxID DI5276PLJY at 05/09/2026 21:01"
 * 2. Cash In:
 *    "Cash In Tk 499.00 from 01897379152 successful. Fee Tk 0.00. Balance Tk 16,207.79. TrxID DI5876R1VG at 05/09/2026 21:02. Download App: https://bKa.sh/8app"
 */
export function parseBkash(rawSms: string): RawParsedData | null {
  const sms = rawSms.trim();

  // Determine type: 'cash_in' vs 'received'
  let type: 'cash_in' | 'received' = 'received';
  if (/^Cash\s+In/i.test(sms) || /Cash\s+In\s+Tk/i.test(sms)) {
    type = 'cash_in';
  } else if (/received/i.test(sms)) {
    type = 'received';
  }

  // Amount extraction
  const amount = extractPaymentAmount(sms);
  if (amount === null || isNaN(amount)) {
    return null;
  }

  // Phone number extraction
  let phoneData = extractBkashPhone(sms);
  if (!phoneData) {
    // Fallback: look for 11 digits BD phone
    const fallbackMatch = sms.match(/from\s+([0-9]{11})/i) || sms.match(/\b(01[3-9]\d{8})\b/);
    if (fallbackMatch && fallbackMatch[1]) {
      phoneData = {
        phoneNumber: fallbackMatch[1],
        last3Digits: extractLast3Digits(fallbackMatch[1]),
      };
    }
  }

  if (!phoneData) {
    return null;
  }

  // Transaction ID
  const transactionId = extractTransactionId(sms);
  if (!transactionId) {
    return null;
  }

  // Date and Time
  const dateTime = extractDateTime(sms);
  if (!dateTime) {
    return null;
  }

  const fee = extractFee(sms);
  const balance = extractBalance(sms);

  return {
    provider: 'bKash',
    type,
    amount,
    phoneNumber: phoneData.phoneNumber,
    last3Digits: phoneData.last3Digits,
    transactionId,
    reference: null,
    date: dateTime.date,
    time: dateTime.time,
    fee,
    balance,
  };
}
