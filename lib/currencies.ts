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
