/**
 * Normalizes Kenyan mobile numbers to 254XXXXXXXXX standard format
 */
export function normalizeKenyanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return `254${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 9) {
    return `254${cleaned}`;
  }
  return cleaned;
}

/**
 * Validates that a string matches the normalized 254XXXXXXXXX standard format
 */
export function isValidKenyanPhoneNumber(phone: string): boolean {
  const normalized = normalizeKenyanPhoneNumber(phone);
  return /^254[17]\d{8}$/.test(normalized);
}
