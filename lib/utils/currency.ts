/**
 * Formats a number to Kenyan Shillings display (e.g. 1500 -> "1,500 KES")
 */
export function formatKes(amount: number): string {
  return `${amount.toLocaleString("en-KE")} KES`;
}
