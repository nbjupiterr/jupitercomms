import { NextResponse } from "next/server";

export const revalidate = 86400; // daily

type ErApiResponse = {
  result: string;
  base_code?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
};

/** Proxy + cache mid-market rates (USD base). Attribution: exchangerate-api.com */
export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates" },
        { status: 502 }
      );
    }
    const data = (await res.json()) as ErApiResponse;
    if (data.result !== "success" || !data.rates) {
      return NextResponse.json(
        { error: "Exchange rate provider error" },
        { status: 502 }
      );
    }
    return NextResponse.json({
      base: data.base_code ?? "USD",
      rates: data.rates,
      updatedAt: data.time_last_update_utc ?? null,
      provider: "https://www.exchangerate-api.com",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 502 }
    );
  }
}
