"use client";

import type { PriceTable } from "@/lib/supabase/database.types";

const emptyTable = (): PriceTable => ({ columns: ["Type", "Price"], rows: [] });

export function normalizePriceTable(value: unknown): PriceTable {
  if (!value || typeof value !== "object") return emptyTable();
  const v = value as Partial<PriceTable>;
  const columns = Array.isArray(v.columns) && v.columns.length
    ? v.columns.map((c) => String(c || ""))
    : ["Type", "Price"];
  const rows = Array.isArray(v.rows)
    ? v.rows.map((row) => {
        const cells = Array.isArray(row) ? row.map((c) => String(c ?? "")) : [];
        while (cells.length < columns.length) cells.push("");
        return cells.slice(0, columns.length);
      })
    : [];
  return { columns, rows };
}

export function PriceTableEditor({
  value,
  onChange,
}: {
  value: PriceTable;
  onChange: (next: PriceTable) => void;
}) {
  const table = normalizePriceTable(value);

  const setColumn = (index: number, text: string) => {
    const columns = [...table.columns];
    columns[index] = text;
    onChange({ ...table, columns });
  };

  const setCell = (row: number, col: number, text: string) => {
    const rows = table.rows.map((r) => [...r]);
    rows[row][col] = text;
    onChange({ ...table, rows });
  };

  const addColumn = () => {
    const columns = [...table.columns, `Col ${table.columns.length + 1}`];
    const rows = table.rows.map((r) => [...r, ""]);
    onChange({ columns, rows });
  };

  const removeColumn = (index: number) => {
    if (table.columns.length <= 1) return;
    const columns = table.columns.filter((_, i) => i !== index);
    const rows = table.rows.map((r) => r.filter((_, i) => i !== index));
    onChange({ columns, rows });
  };

  const addRow = () => {
    onChange({
      ...table,
      rows: [...table.rows, table.columns.map(() => "")],
    });
  };

  const removeRow = (index: number) => {
    onChange({
      ...table,
      rows: table.rows.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[320px] text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              {table.columns.map((col, ci) => (
                <th key={ci} className="p-1 align-bottom">
                  <div className="flex flex-col gap-1">
                    <input
                      value={col}
                      onChange={(e) => setColumn(ci, e.target.value)}
                      className="field-input text-xs font-semibold"
                      aria-label={`Column ${ci + 1} name`}
                    />
                    {table.columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(ci)}
                        className="text-[10px] text-text-muted hover:text-error self-start"
                      >
                        Remove col
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="field-input text-sm"
                      aria-label={`Row ${ri + 1} column ${ci + 1}`}
                    />
                  </td>
                ))}
                <td className="p-1 align-middle">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    className="text-[11px] text-text-muted hover:text-error"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addRow} className="btn-ghost text-sm">
          Add row
        </button>
        <button type="button" onClick={addColumn} className="btn-ghost text-sm">
          Add column
        </button>
      </div>
    </div>
  );
}
