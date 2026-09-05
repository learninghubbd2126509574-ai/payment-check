/**
 * Utility parser for amounts in Bangladeshi MFS SMS formats.
 * Prevents confusion between payment Amount, Fee, and Balance.
 */

export interface ParsedFinancials {
  amount: number | null;
  fee?: number | null;
  balance?: number | null;
}

/**
 * Clean and convert amount string like "15,708.79" or "499.00" to a number
 */
export function cleanAmount(val: string): number {
  const sanitized = val.replace(/,/g, '').trim();
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}

/**
 * Extracts the fee from SMS if present
 */
export function extractFee(sms: string): number | null {
  // Matches "Fee Tk 0.00", "Fee: Tk 0", "Fee:Tk0", "Fee Tk0.00"
  const feeMatch = sms.match(/Fee(?:\s*:)?\s*(?:Tk\.?|৳)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (feeMatch && feeMatch[1]) {
    return cleanAmount(feeMatch[1]);
  }
  return null;
}

/**
 * Extracts the balance from SMS if present
 */
export function extractBalance(sms: string): number | null {
  // Matches "Balance Tk 15,708.79", "Balance: Tk 8781.58", "Balance: 2957.58", "Your A/C Balance: Tk1,015.79"
  const balanceMatch = sms.match(/(?:Your\s+A\/C\s+)?Balance(?:\s*:)?\s*(?:Tk\.?|৳)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (balanceMatch && balanceMatch[1]) {
    return cleanAmount(balanceMatch[1]);
  }
  return null;
}

/**
 * Extracts the primary transaction/payment amount from SMS.
 * Prioritizes patterns like:
 * - "You have received Tk 500.00"
 * - "Cash In Tk 499.00"
 * - "Amount: Tk 499.00"
 * - "Amount: 599.00"
 * - "Tk499.00 received" or "Tk 499.00 received"
 */
export function extractPaymentAmount(sms: string): number | null {
  // 1. Check explicit "Amount: Tk 499.00" or "Amount: 599.00" (Nagad / Upay)
  const explicitAmountMatch = sms.match(/Amount\s*:\s*(?:Tk\.?|৳)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (explicitAmountMatch && explicitAmountMatch[1]) {
    return cleanAmount(explicitAmountMatch[1]);
  }

  // 2. Check bKash "You have received Tk 500.00" or "received Tk 500.00"
  const receivedTkMatch = sms.match(/received\s+(?:Tk\.?|৳)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (receivedTkMatch && receivedTkMatch[1]) {
    return cleanAmount(receivedTkMatch[1]);
  }

  // 3. Check Rocket "Tk499.00 received" or "Tk 500.00 received"
  const tkReceivedMatch = sms.match(/(?:Tk\.?|৳)\s*([\d,]+(?:\.\d{1,2})?)\s+received/i);
  if (tkReceivedMatch && tkReceivedMatch[1]) {
    return cleanAmount(tkReceivedMatch[1]);
  }

  // 4. Check bKash "Cash In Tk 499.00"
  const cashInMatch = sms.match(/Cash\s+In\s+(?:Tk\.?|৳)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (cashInMatch && cashInMatch[1]) {
    return cleanAmount(cashInMatch[1]);
  }

  // 5. Fallback generic leading Tk amount if not preceded by Fee or Balance
  const genericMatch = sms.match(/^(?:.*?)(?:Tk\.?|৳)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (genericMatch && genericMatch[1]) {
    return cleanAmount(genericMatch[1]);
  }

  return null;
}
