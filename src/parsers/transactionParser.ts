/**
 * Utility parser for Transaction IDs (TrxID / TxnID) and References across MFS providers.
 * Extracts exact casing, alphanumeric string, or numeric IDs without alterations.
 */

export interface ParsedTransaction {
  transactionId: string;
  reference?: string | null;
}

/**
 * Extracts Transaction ID (TrxID / TxnID / TxnId)
 */
export function extractTransactionId(sms: string): string | null {
  // bKash: TrxID DI5276PLJY at 05/09/2026
  // Nagad: TxnID: 75XVTPVI
  // Rocket: TxnId:6910652291
  // Multi/Custom: TrxID MULTI_A123 / TxnID: MULTI_B123
  const match = sms.match(/(?:TrxID|TxnID|TxnId|Trx\s*Id|Txn\s*Id)\s*[:\s]\s*([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1].trim().replace(/[.,;:]+$/, '');
  }

  // Generic fallback if labeled "ID:" or "Transaction ID:"
  const fallbackMatch = sms.match(/(?:Transaction\s*ID|TXN\s*#)\s*[:\s]\s*([a-zA-Z0-9_-]+)/i);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1].trim().replace(/[.,;:]+$/, '');
  }

  return null;
}

/**
 * Extracts reference code if available (commonly found in Nagad, e.g. "Ref: 2")
 */
export function extractReference(sms: string): string | null {
  const match = sms.match(/(?:Ref|Reference)\s*:\s*([^\r\n,;]+)/i);
  if (match && match[1]) {
    const trimmed = match[1].trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}
