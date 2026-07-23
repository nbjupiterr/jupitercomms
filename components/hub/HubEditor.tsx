"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { AvailabilityEditor } from "@/components/hub/AvailabilityEditor";
import { GalleryEditor } from "@/components/hub/GalleryEditor";
import { PriceTablesEditor } from "@/components/hub/PriceTablesEditor";
import { TosEditor } from "@/components/hub/TosEditor";
import { SocialsEditor } from "@/components/hub/SocialsEditor";
import { PublicQueueKanban } from "@/components/client/PublicQueueKanban";
import type { PublicQueueItem } from "@/components/client/types";
import { normalizePriceTables, type NamedPriceTable } from "@/lib/price-tables";
import type { Tables } from "@/lib/supabase/database.types";

type HubTab = "availability" | "gallery" | "prices" | "tos" | "queue" | "contact";

const TABS: { id: HubTab; label: string }[] = [
  { id: "availability", label: "Availability" },
  { id: "gallery", label: "Gallery" },
  { id: "prices", label: "Prices" },
  { id: "tos", label: "TOS" },
  { id: "queue", label: "Queue" },
  { id: "contact", label: "Contact" },
];

type Profile = Tables<"artist_profiles">;
type GalleryItem = Tables<"gallery_items">;
type SocialLink = Tables<"social_links">;

export function HubEditor({
  profile,
  initialGallery,
  initialSocials,
  queuePreview,
}: {
  profile: Profile;
  displayName?: string;
  initialGallery: GalleryItem[];
  initialSocials: SocialLink[];
  queuePreview: PublicQueueItem[];
}) {
  const [tab, setTab] = useState<HubTab>("gallery");
  const [status, setStatus] = useState(profile.availability_status);
  const [message, setMessage] = useState(profile.availability_message ?? "");
  const [tos, setTos] = useState(profile.tos_markdown ?? "");
  const [email, setEmail] = useState(profile.contact_email ?? "");
  const [priceTables, setPriceTables] = useState<NamedPriceTable[]>(() =>
    normalizePriceTables(profile.price_tables, profile.price_table, profile.additionals_table)
  );
  const [gallery, setGallery] = useState(initialGallery);
  const [socials, setSocials] = useState(initialSocials);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queueUrl = useMemo(() => {
    if (typeof window === "undefined") return `/queue/${profile.public_queue_token}`;
    return `${window.location.origin}/queue/${profile.public_queue_token}`;
  }, [profile.public_queue_token]);

  const saveProfileFields = async () => {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("artist_profiles")
      .update({
        availability_status: status,
        availability_message: message || null,
        tos_markdown: tos || null,
        contact_email: email || null,
        price_tables: priceTables,
        price_table: priceTables[0]
          ? { columns: priceTables[0].columns, rows: priceTables[0].rows }
          : { columns: ["Type", "Price"], rows: [] },
        additionals_table: priceTables[1]
          ? { columns: priceTables[1].columns, rows: priceTables[1].rows }
          : { columns: ["Additional", "Price"], rows: [] },
      })
      .eq("user_id", profile.user_id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-navy">Hub</h1>
          <p className="text-text-secondary mt-1 text-sm leading-relaxed max-w-xl">
            Edit what clients see on your public page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(queueUrl)}
            className="btn-ghost text-sm"
          >
            Copy client link
          </button>
          <a
            href={queueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            Preview
          </a>
        </div>
      </header>

      <PanelTabs tabs={TABS} active={tab} onChange={setTab} />

      <section className="glass rounded-2xl p-5 sm:p-6 min-h-[320px]">
        {tab === "availability" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-navy">Availability</h2>
            <AvailabilityEditor
              status={status}
              message={message}
              onStatusChange={setStatus}
              onMessageChange={setMessage}
            />
          </div>
        )}

        {tab === "gallery" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-navy">Gallery</h2>
            <GalleryEditor items={gallery} onChange={setGallery} />
          </div>
        )}

        {tab === "prices" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-navy">Prices</h2>
            <p className="text-xs text-text-muted -mt-1">
              Add as many tables as you need — rename or delete each one.
            </p>
            <PriceTablesEditor tables={priceTables} onChange={setPriceTables} />
          </div>
        )}

        {tab === "tos" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-navy">Terms of service</h2>
            <TosEditor value={tos} onChange={setTos} />
          </div>
        )}

        {tab === "queue" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-navy">Queue (client view)</h2>
              <Link href="/dashboard/queue" className="text-xs text-accent-dim underline underline-offset-2">
                Manage in Queue
              </Link>
            </div>
            <PublicQueueKanban
              queue={queuePreview}
              columns={profile.kanban_columns}
              tatMin={profile.tat_min_days}
              tatMax={profile.tat_max_days}
            />
          </div>
        )}

        {tab === "contact" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-navy">Contact & socials</h2>
            <p className="text-xs text-text-muted -mt-2">
              Shown under your availability message on the client page.
            </p>
            <SocialsEditor
              links={socials}
              contactEmail={email}
              onLinksChange={setSocials}
              onEmailChange={setEmail}
            />
          </div>
        )}
      </section>

      {(tab === "availability" || tab === "prices" || tab === "tos" || tab === "contact") && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void saveProfileFields()}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {savedAt && <span className="text-xs text-text-muted">Saved {savedAt}</span>}
          {error && <span className="text-xs text-error">{error}</span>}
        </div>
      )}
    </div>
  );
}
