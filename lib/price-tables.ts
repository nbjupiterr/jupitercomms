import type { PriceTable } from "@/lib/supabase/database.types";
import { normalizePriceTable } from "@/components/hub/PriceTableEditor";

export type NamedPriceTable = PriceTable & {
  id: string;
  title: string;
};

export function normalizePriceTables(
  value: unknown,
  fallbackPrice?: unknown,
  fallbackAdditionals?: unknown
): NamedPriceTable[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((raw, i) => {
      const item = (raw ?? {}) as Partial<NamedPriceTable>;
      const table = normalizePriceTable(item);
      return {
        id: String(item.id || `table-${i}`),
        title: String(item.title || `Table ${i + 1}`),
        columns: table.columns,
        rows: table.rows,
      };
    });
  }

  const tables: NamedPriceTable[] = [
    {
      id: "prices",
      title: "Prices",
      ...normalizePriceTable(fallbackPrice),
    },
  ];
  const additionals = normalizePriceTable(fallbackAdditionals);
  if (additionals.rows.length > 0) {
    tables.push({ id: "additionals", title: "Additionals", ...additionals });
  }
  return tables;
}

export function newPriceTable(title = "New table"): NamedPriceTable {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `table-${Date.now()}`,
    title,
    columns: ["Type", "Price"],
    rows: [["", ""]],
  };
}
