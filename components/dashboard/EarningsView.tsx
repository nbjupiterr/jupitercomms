"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";
import { convertAmount, formatMoney } from "@/lib/exchange-rates";
import type { Tables } from "@/lib/supabase/database.types";

type Entry = Tables<"earnings_entries">;

type RangePreset = "day" | "week" | "month" | "year" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function rangeForPreset(preset: RangePreset): { from: Date; to: Date } {
  const now = new Date();
  const to = endOfDay(now);
  if (preset === "day") return { from: startOfDay(now), to };
  if (preset === "week") {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to };
  }
  if (preset === "month") {
    const from = startOfDay(now);
    from.setDate(1);
    return { from, to };
  }
  if (preset === "year") {
    const from = startOfDay(now);
    from.setMonth(0, 1);
    return { from, to };
  }
  return { from: startOfDay(now), to };
}

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EarningsView({ initialEntries }: { initialEntries: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const currencies = useMemo(() => {
    const used = new Set(entries.map((e) => e.currency || DEFAULT_CURRENCY));
    const rest = CURRENCIES.filter((c) => !used.has(c));
    const usedOrdered = CURRENCIES.filter((c) => used.has(c));
    const extras = [...used].filter((c) => !(CURRENCIES as readonly string[]).includes(c));
    return [...usedOrdered, ...extras, ...rest];
  }, [entries]);

  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    if (currencies.length && !currencies.includes(currency)) {
      setCurrency(currencies.includes(DEFAULT_CURRENCY) ? DEFAULT_CURRENCY : currencies[0]);
    }
  }, [currencies, currency]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const res = await fetch("/api/exchange-rates");
        const data = (await res.json()) as {
          rates?: Record<string, number>;
          updatedAt?: string | null;
          error?: string;
        };
        if (!res.ok || !data.rates) {
          throw new Error(data.error || "Could not load rates");
        }
        if (!cancelled) {
          setRates(data.rates);
          setRatesUpdatedAt(data.updatedAt ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setRates(null);
          setRatesError(err instanceof Error ? err.message : "Could not load rates");
        }
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const [preset, setPreset] = useState<RangePreset>("month");
  const initial = rangeForPreset("month");
  const [fromDate, setFromDate] = useState(toInputDate(initial.from));
  const [toDate, setToDate] = useState(toInputDate(initial.to));

  const applyPreset = (next: RangePreset) => {
    setPreset(next);
    if (next === "custom") return;
    const { from, to } = rangeForPreset(next);
    setFromDate(toInputDate(from));
    setToDate(toInputDate(to));
  };

  const filtered = useMemo(() => {
    const from = startOfDay(new Date(fromDate + "T00:00:00"));
    const to = endOfDay(new Date(toDate + "T00:00:00"));
    return entries.filter((e) => {
      const when = new Date(e.occurred_at);
      return when >= from && when <= to;
    });
  }, [entries, fromDate, toDate]);

  const rows = useMemo(() => {
    return filtered.map((entry) => {
      const source = entry.currency || DEFAULT_CURRENCY;
      const original = Number(entry.amount) || 0;
      const converted =
        rates != null ? convertAmount(original, source, currency, rates) : null;
      return { entry, source, original, converted };
    });
  }, [filtered, rates, currency]);

  const convertible = rows.filter((r) => r.converted != null);
  const skipped = rows.length - convertible.length;

  const total = convertible.reduce((sum, r) => sum + (r.converted ?? 0), 0);
  const completedTotal = convertible
    .filter((r) => r.entry.kind === "completed")
    .reduce((sum, r) => sum + (r.converted ?? 0), 0);
  const pendingTotal = convertible
    .filter((r) => r.entry.kind === "pending")
    .reduce((sum, r) => sum + (r.converted ?? 0), 0);

  const money = (n: number) => formatMoney(n, currency);

  const removeEntry = async (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("earnings_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setConfirmId(null);
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Earnings</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed max-w-xl">
          A lasting ledger of priced work. Clearing the queue keeps these rows — delete them here
          only when you want them gone.
        </p>
      </header>

      <section className="glass-strong rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["day", "Day"],
              ["week", "Week"],
              ["month", "Month"],
              ["year", "Year"],
              ["custom", "Range"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                preset === id
                  ? "bg-navy text-white border-navy"
                  : "bg-bg-card text-text-secondary border-glass-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPreset("custom");
                setFromDate(e.target.value);
              }}
              className="field-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPreset("custom");
                setToDate(e.target.value);
              }}
              className="field-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">Display currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="field-input"
            >
              {(currencies.length ? currencies : [...CURRENCIES]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          {ratesLoading ? (
            "Loading live exchange rates…"
          ) : ratesError ? (
            `Rates unavailable (${ratesError}). Totals need rates to convert.`
          ) : (
            <>
              Converted with mid-market rates
              {ratesUpdatedAt ? ` · updated ${ratesUpdatedAt}` : ""}. Rates by{" "}
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                ExchangeRate-API
              </a>
              .
            </>
          )}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="glass-strong rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
          <p className="text-2xl font-semibold tracking-tight text-navy mt-1">
            {ratesLoading ? "…" : money(total)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {convertible.length} entries
            {skipped > 0 ? ` · ${skipped} skipped` : ""}
          </p>
        </article>
        <article className="glass-strong rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-semibold tracking-tight text-navy mt-1">
            {ratesLoading ? "…" : money(completedTotal)}
          </p>
        </article>
        <article className="glass-strong rounded-2xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-semibold tracking-tight text-navy mt-1">
            {ratesLoading ? "…" : money(pendingTotal)}
          </p>
          <p className="text-xs text-text-muted mt-1">Still open when recorded</p>
        </article>
      </div>

      <section className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-glass-border">
          <h2 className="text-sm font-semibold text-navy">Breakdown</h2>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">
            No earnings in this range yet.
          </p>
        ) : (
          <ul className="divide-y divide-glass-border">
            {rows
              .slice()
              .sort((a, b) => b.entry.occurred_at.localeCompare(a.entry.occurred_at))
              .map(({ entry, source, original, converted }) => (
                <li
                  key={entry.id}
                  className="px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy truncate">{entry.title}</p>
                    <p className="text-[11px] text-text-muted">
                      {entry.client_name} · {entry.kind} ·{" "}
                      {new Date(entry.occurred_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {!entry.commission_id && <> · archived</>}
                      {source !== currency && (
                        <> · {formatMoney(original, source)}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-navy tabular-nums text-right">
                      {converted == null ? "—" : money(converted)}
                    </span>
                    {confirmId === entry.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void removeEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-[11px] font-medium text-white bg-error px-2 py-1 rounded-lg"
                          aria-label="Confirm delete"
                        >
                          {deletingId === entry.id ? "…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="text-[11px] text-text-muted px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void removeEntry(entry.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                        aria-label={`Delete ${entry.title}`}
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
