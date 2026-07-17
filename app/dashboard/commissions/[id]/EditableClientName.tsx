"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EditableClientName({
  commissionId,
  clientName,
}: {
  commissionId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(clientName);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === clientName) {
      setValue(clientName);
      setEditing(false);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    await supabase.from("commissions").update({ client_name: trimmed }).eq("id", commissionId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-text-secondary text-sm">Client:</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(clientName);
              setEditing(false);
            }
          }}
          disabled={saving}
          className="field-input text-sm py-1 px-2 w-48"
          aria-label="Client name"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group text-text-secondary text-sm mt-1 inline-flex items-center gap-1.5 hover:text-navy transition-colors"
    >
      Client: {clientName}
      <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
        Edit
      </span>
    </button>
  );
}
