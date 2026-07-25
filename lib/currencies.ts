/** Supported commission / earnings currencies (ISO 4217). PHP listed first. */
export const CURRENCIES = [
  "PHP",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "SGD",
  "MYR",
  "THB",
  "IDR",
  "KRW",
  "CNY",
  "HKD",
  "TWD",
  "INR",
  "NZD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "MXN",
  "BRL",
  "AED",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "PHP";

function formatMoneyAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** e.g. `PHP 1200 (+PHP 300 tip)` or `PHP 1200` when tip is empty/0. */
export function formatCommissionMoney(
  price: number | null | undefined,
  tip: number | null | undefined,
  currency: string | null | undefined
): string {
  const cur = currency?.trim() || DEFAULT_CURRENCY;
  if (price == null) return "—";
  const base = `${cur} ${formatMoneyAmount(price)}`;
  if (tip == null || tip <= 0) return base;
  return `${base} (+${cur} ${formatMoneyAmount(tip)} tip)`;
}
