/**
 * Utility parser for Date and Time across MFS providers.
 * Supports:
 * - DD/MM/YYYY HH:mm (bKash, Nagad)
 * - DD-MMM-YY HH:mm:ss am/pm (Rocket: e.g. 04-SEP-26 04:15:53 pm)
 * - Date: labels and "at" separators
 */

export interface ParsedDateTime {
  date: string;
  time: string;
}

export function extractDateTime(sms: string): ParsedDateTime | null {
  // 1. Rocket format: Date:04-SEP-26 04:15:53 pm
  const rocketMatch = sms.match(/Date\s*:\s*(\d{2}-[A-Za-z]{3}-\d{2,4})\s+([\d:]+\s*(?:am|pm)?)/i);
  if (rocketMatch && rocketMatch[1] && rocketMatch[2]) {
    return {
      date: rocketMatch[1].trim(),
      time: rocketMatch[2].trim(),
    };
  }

  // 2. bKash format: at 05/09/2026 21:01
  const bkashMatch = sms.match(/at\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)/i);
  if (bkashMatch && bkashMatch[1] && bkashMatch[2]) {
    return {
      date: bkashMatch[1].trim(),
      time: bkashMatch[2].trim(),
    };
  }

  // 3. Nagad format: standalone line or end with 05/09/2026 20:29
  const nagadMatch = sms.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)/);
  if (nagadMatch && nagadMatch[1] && nagadMatch[2]) {
    return {
      date: nagadMatch[1].trim(),
      time: nagadMatch[2].trim(),
    };
  }

  // 4. ISO or dash date fallback: 2026-09-05 21:01
  const isoMatch = sms.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}(?::\d{2})?)/);
  if (isoMatch && isoMatch[1] && isoMatch[2]) {
    return {
      date: isoMatch[1].trim(),
      time: isoMatch[2].trim(),
    };
  }

  return null;
}
