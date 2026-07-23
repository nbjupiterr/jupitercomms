"use client";

import { PriceTableEditor } from "@/components/hub/PriceTableEditor";
import { newPriceTable, type NamedPriceTable } from "@/lib/price-tables";

export function PriceTablesEditor({
  tables,
  onChange,
}: {
  tables: NamedPriceTable[];
  onChange: (next: NamedPriceTable[]) => void;
}) {
  const update = (index: number, patch: Partial<NamedPriceTable>) => {
    onChange(tables.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const remove = (index: number) => {
    if (tables.length <= 1) return;
    onChange(tables.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      {tables.map((table, index) => (
        <div
          key={table.id}
          className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <input
              value={table.title}
              onChange={(e) => update(index, { title: e.target.value })}
              className="field-input text-sm font-semibold flex-1"
              aria-label="Table title"
            />
            {tables.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-xs text-text-muted hover:text-error shrink-0"
              >
                Delete table
              </button>
            )}
          </div>
          <PriceTableEditor
            value={table}
            onChange={(next) => update(index, { columns: next.columns, rows: next.rows })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...tables, newPriceTable(`Table ${tables.length + 1}`)])}
        className="btn-ghost text-sm self-start"
      >
        Add another table
      </button>
    </div>
  );
}
