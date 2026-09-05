import { Provider } from '../types';

/**
 * Detects MFS provider based on distinctive keywords, markers, and SMS layout.
 */
export function detectProvider(sms: string): Provider {
  const text = sms.trim();

  // 1. Explicit mention check
  if (/bKash/i.test(text) || /bKa\.sh/i.test(text)) {
    return 'bKash';
  }
  if (/Nagad/i.test(text)) {
    return 'Nagad';
  }
  if (/Rocket/i.test(text) || /nexuspay/i.test(text) || /nexus\s*pay/i.test(text)) {
    return 'Rocket';
  }
  if (/Upay/i.test(text)) {
    return 'Upay';
  }

  // 2. Structural pattern matching when provider name is not explicitly mentioned:
  
  // bKash pattern:
  // "You have received Tk ... from ... Fee Tk ... Balance Tk ... TrxID ..."
  // "Cash In Tk ... from ... successful. Fee Tk ... Balance Tk ... TrxID ..."
  if (
    (/You have received Tk/i.test(text) || /Cash In Tk/i.test(text)) &&
    /TrxID/i.test(text) &&
    /Balance Tk/i.test(text)
  ) {
    return 'bKash';
  }

  // Nagad pattern:
  // "Money Received." or "Cash In Received." or "Sender:" / "Uddokta:" with "TxnID:"
  if (
    (/Money Received/i.test(text) || /Cash In Received/i.test(text) || /Uddokta:/i.test(text)) &&
    /TxnID/i.test(text)
  ) {
    return 'Nagad';
  }

  // Rocket pattern:
  // "Tk... received from A/C:***... Your A/C Balance: ... TxnId:..."
  if (
    /received from A\/C/i.test(text) ||
    (/A\/C:\s*\*{2,}/i.test(text) && /TxnId:/i.test(text)) ||
    (/Your A\/C Balance/i.test(text) && /TxnId:/i.test(text))
  ) {
    return 'Rocket';
  }

  // Upay fallback
  if (/Upay/i.test(text) || (/UCB/i.test(text) && /Trx/i.test(text))) {
    return 'Upay';
  }

  return 'Unknown';
}
