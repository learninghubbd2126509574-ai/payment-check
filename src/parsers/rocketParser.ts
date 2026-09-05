import { RawParsedData } from '../types';
import { extractPaymentAmount, extractFee, extractBalance } from './amountParser';
import { extractRocketPhone } from './phoneParser';
import { extractTransactionId } from './transactionParser';
import { extractDateTime } from './dateTimeParser';

/**
 * Parser specifically designed for DBBL Rocket / NexusPay SMS formats:
 * "Tk499.00 received from A/C:***759 Fee:Tk0, Your A/C Balance: Tk1,015.79 TxnId:6910652291 Date:04-SEP-26 04:15:53 pm. Download https://bit.ly/nexuspay"
 */
export function parseRocket(rawSms: string): RawParsedData | null {
  const sms = rawSms.trim();

  // Type
  let type: 'received' | 'cash_in' = 'received';
  if (/cash\s*in/i.test(sms)) {
    type = 'cash_in';
  }

  // Amount
  const amount = extractPaymentAmount(sms);
  if (amount === null || isNaN(amount)) {
    return null;
  }

  // Phone / Account number (e.g. ***759)
  const phoneData = extractRocketPhone(sms);
  if (!phoneData) {
    return null;
  }

  // Transaction ID (e.g. 6910652291)
  const transactionId = extractTransactionId(sms);
  if (!transactionId) {
    return null;
  }

  // Date and Time (e.g. Date:04-SEP-26 04:15:53 pm)
  const dateTime = extractDateTime(sms);
  if (!dateTime) {
    return null;
  }

  const fee = extractFee(sms);
  const balance = extractBalance(sms);

  return {
    provider: 'Rocket',
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
