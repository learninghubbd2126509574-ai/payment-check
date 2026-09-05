import { RawParsedData } from '../types';
import { extractPaymentAmount, extractFee, extractBalance } from './amountParser';
import { extractBkashPhone, extractLast3Digits } from './phoneParser';
import { extractTransactionId } from './transactionParser';
import { extractDateTime } from './dateTimeParser';

/**
 * Parser for Upay (UCB Fintech) SMS formats.
 * Example:
 * "You have received Tk 500.00 from 01923456789. Fee Tk 0.00. Balance Tk 3,500.00. TrxID UP81239102 at 05/09/2026 19:40."
 */
export function parseUpay(rawSms: string): RawParsedData | null {
  const sms = rawSms.trim();

  let type: 'received' | 'cash_in' = 'received';
  if (/cash\s*in/i.test(sms)) {
    type = 'cash_in';
  }

  const amount = extractPaymentAmount(sms);
  if (amount === null || isNaN(amount)) {
    return null;
  }

  let phoneData = extractBkashPhone(sms);
  if (!phoneData) {
    const match = sms.match(/(?:from|sender)\s*[:\s]?\s*([0-9]{11})/i) || sms.match(/\b(01[3-9]\d{8})\b/);
    if (match && match[1]) {
      phoneData = {
        phoneNumber: match[1],
        last3Digits: extractLast3Digits(match[1]),
      };
    }
  }

  if (!phoneData) {
    return null;
  }

  const transactionId = extractTransactionId(sms);
  if (!transactionId) {
    return null;
  }

  const dateTime = extractDateTime(sms);
  if (!dateTime) {
    return null;
  }

  const fee = extractFee(sms);
  const balance = extractBalance(sms);

  return {
    provider: 'Upay',
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
