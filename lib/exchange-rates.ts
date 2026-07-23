/** Rates keyed by currency code, relative to `base` (units of currency per 1 base). */
export type RateTable = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string | null;
};

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number | null {
  const src = from.toUpperCase();
  const dst = to.toUpperCase();
  if (src === dst) return amount;
  const fromRate = rates[src];
  const toRate = rates[dst];
  if (fromRate == null || toRate == null || fromRate === 0) return null;
  // rates are vs the same base (e.g. USD): amount_in_base = amount / fromRate
  return (amount / fromRate) * toRate;
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
