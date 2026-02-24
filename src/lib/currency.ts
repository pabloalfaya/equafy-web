/**
 * Project currency: symbol and formatting for display.
 * Used across dashboard, contribution modal, pie chart, etc.
 */

export const CURRENCIES = [
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", locale: "es-MX" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const byCode = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrencySymbol(currencyCode: string): string {
  return byCode.get(currencyCode as CurrencyCode)?.symbol ?? "€";
}

export function getCurrencyLocale(currencyCode: string): string {
  return byCode.get(currencyCode as CurrencyCode)?.locale ?? "de-DE";
}

/** Format a number as money with the project's currency symbol (no decimals for JPY, 2 otherwise). */
export function formatCurrency(
  amount: number,
  currencyCode: string = "EUR",
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  const cur = byCode.get(currencyCode as CurrencyCode) ?? byCode.get("EUR")!;
  const isWhole = currencyCode === "JPY";
  const formatted = amount.toLocaleString(cur.locale, {
    minimumFractionDigits: isWhole ? 0 : options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: isWhole ? 0 : options?.maximumFractionDigits ?? 2,
  });
  return cur.symbol === "CHF" ? `CHF ${formatted}` : `${cur.symbol}${formatted}`;
}

/** Short label for inputs, e.g. "Value (€)" */
export function getCurrencyLabel(currencyCode: string): string {
  const s = getCurrencySymbol(currencyCode);
  return s === "CHF" ? "Value (CHF)" : `Value (${s})`;
}
