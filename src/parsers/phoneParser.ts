/**
 * Utility parser for sender/customer phone numbers and extracting the last 3 digits.
 * Accurately handles:
 * - Full Bangladeshi mobile numbers (e.g. 01871146049, 01816926823, 01960080062)
 * - Nagad "Sender:" and "Uddokta:" labels
 * - Rocket masked account format (e.g. ***759, A/C:***759)
 * - Strict preservation of leading zeroes (e.g., "049", "062") as strings.
 */

export interface ParsedPhone {
  phoneNumber: string;
  last3Digits: string;
}

/**
 * Extracts the last 3 digits from a phone number string, strictly preserving leading zeros.
 */
export function extractLast3Digits(phoneStr: string): string {
  if (!phoneStr) return '';
  // Extract all digits or masked trailing digits
  const cleanDigits = phoneStr.replace(/\D/g, '');
  if (cleanDigits.length >= 3) {
    return cleanDigits.slice(-3);
  }
  // If fewer digits (e.g. masked with 3 digits like ***759)
  const trailingMatch = phoneStr.match(/(\d{3})$/);
  if (trailingMatch) {
    return trailingMatch[1];
  }
  return cleanDigits;
}

/**
 * Finds phone number from bKash format:
 * "from 01871146049" or "from 01897379152"
 */
export function extractBkashPhone(sms: string): ParsedPhone | null {
  const match = sms.match(/from\s+([0-9]{11})/i);
  if (match && match[1]) {
    const phoneNumber = match[1];
    return {
      phoneNumber,
      last3Digits: extractLast3Digits(phoneNumber),
    };
  }
  return null;
}

/**
 * Finds phone number from Nagad format:
 * "Sender: 01816926823" or "Uddokta: 01960080062"
 */
export function extractNagadPhone(sms: string): ParsedPhone | null {
  // Check Sender: or Uddokta:
  const match = sms.match(/(?:Sender|Uddokta)\s*:\s*([0-9]{11})/i);
  if (match && match[1]) {
    const phoneNumber = match[1];
    return {
      phoneNumber,
      last3Digits: extractLast3Digits(phoneNumber),
    };
  }

  // Fallback: search for any 11-digit BD mobile number
  const genericMatch = sms.match(/\b(01[3-9]\d{8})\b/);
  if (genericMatch && genericMatch[1]) {
    const phoneNumber = genericMatch[1];
    return {
      phoneNumber,
      last3Digits: extractLast3Digits(phoneNumber),
    };
  }

  return null;
}

/**
 * Finds phone number from Rocket format:
 * "from A/C:***759" or "A/C:***759"
 * As per specification:
 * Rocket-এর ক্ষেত্রে sender/customer number masked থাকতে পারে: ***759
 * এক্ষেত্রে সম্পূর্ণ phone number অনুমান করা যাবে না।
 * শুধুমাত্র শেষ ৩ digit: 759 হিসেবে ব্যবহার করতে হবে।
 */
export function extractRocketPhone(sms: string): ParsedPhone | null {
  // Match A/C:***759 or A/C: ***759 or from A/C:***759
  const maskedMatch = sms.match(/A\/C\s*:\s*(\*{2,}\d{3}|\d{11,12}|\*{0,}\d{3,12})/i);
  if (maskedMatch && maskedMatch[1]) {
    const rawAc = maskedMatch[1].trim();
    return {
      phoneNumber: rawAc,
      last3Digits: extractLast3Digits(rawAc),
    };
  }

  // Generic masked phone match like ***759
  const genericMasked = sms.match(/(\*{2,}\d{3})/);
  if (genericMasked && genericMasked[1]) {
    const rawAc = genericMasked[1].trim();
    return {
      phoneNumber: rawAc,
      last3Digits: extractLast3Digits(rawAc),
    };
  }

  return null;
}

/**
 * Generic phone extractor
 */
export function extractGenericPhone(sms: string): ParsedPhone | null {
  const match = sms.match(/(?:from|sender|uddokta|a\/c)?\s*[:\s]?\s*(\*{0,3}\d{3,12})/i);
  if (match && match[1]) {
    const phoneNumber = match[1].trim();
    return {
      phoneNumber,
      last3Digits: extractLast3Digits(phoneNumber),
    };
  }
  return null;
}
