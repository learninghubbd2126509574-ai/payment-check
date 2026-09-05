import { RawParsedData } from '../types';
import { extractPaymentAmount, extractFee, extractBalance } from './amountParser';
import { extractNagadPhone } from './phoneParser';
import { extractTransactionId, extractReference } from './transactionParser';
import { extractDateTime } from './dateTimeParser';

/**
 * Parser specifically designed for Nagad SMS formats:
 * 1. Money Received:
 *    Money Received.
 *    Amount: Tk 499.00
 *    Sender: 01816926823
 *    Ref: 2
 *    TxnID: 75XVTPVI
 *    Balance: Tk 8781.58
 *    05/09/2026 20:29
 *
 * 2. Cash In Received:
 *    Cash In Received.
 *    Amount: Tk 599.00
 *    Uddokta: 01960080062
 *    TxnID: 75X3V7DE
 *    Balance: 2957.58
 *    01/09/2026 22:12
 */
export function parseNagad(rawSms: string): RawParsedData | null {
  const sms = rawSms.trim();

  // Determine type: 'cash_in_received' vs 'money_received'
  let type: 'cash_in_received' | 'money_received' = 'money_received';
  if (/Cash\s*In(?:\s*Received)?/i.test(sms) || /Uddokta:/i.test(sms)) {
    type = 'cash_in_received';
  } else if (/Money\s*Received/i.test(sms)) {
    type = 'money_received';
  }

  // Amount extraction
  const amount = extractPaymentAmount(sms);
  if (amount === null || isNaN(amount)) {
    return null;
  }

  // Phone number (Sender: or Uddokta:)
  const phoneData = extractNagadPhone(sms);
  if (!phoneData) {
    return null;
  }

  // Transaction ID
  const transactionId = extractTransactionId(sms);
  if (!transactionId) {
    return null;
  }

  // Reference (e.g. Ref: 2)
  const reference = extractReference(sms);

  // Date and Time
  const dateTime = extractDateTime(sms);
  if (!dateTime) {
    return null;
  }

  const fee = extractFee(sms);
  const balance = extractBalance(sms);

  return {
    provider: 'Nagad',
    type,
    amount,
    phoneNumber: phoneData.phoneNumber,
    last3Digits: phoneData.last3Digits,
    transactionId,
    reference,
    date: dateTime.date,
    time: dateTime.time,
    fee,
    balance,
  };
}
