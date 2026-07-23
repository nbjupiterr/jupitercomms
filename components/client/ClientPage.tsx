"use client";

import Image from "next/image";
import { useState } from "react";
import { BrandMark, StorysetCredit } from "@/components/Brand";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { PublicQueueKanban } from "@/components/client/PublicQueueKanban";
import { ContactIcons } from "@/components/client/ContactIcons";
import { renderSimpleMarkdown } from "@/lib/markdown";
import { galleryPublicUrl } from "@/lib/gallery";
import { normalizePriceTables } from "@/lib/price-tables";
import {
  availabilityDetailLine,
  countUsedSlots,
  countWaitlisted,
  parseSlotSettings,
  resolveAvailability,
} from "@/lib/availability";
import type {
  PublicArtist,
  PublicGalleryItem,
  PublicQueueItem,
  PublicSocial,
} from "@/components/client/types";

export type {
  PublicArtist,
  PublicGalleryItem,
  PublicQueueItem,
  PublicSocial,
} from "@/components/client/types";

type ClientTab = "gallery" | "prices" | "tos" | "queue";

const TABS: { id: ClientTab; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "prices", label: "Prices" },
  { id: "tos", label: "TOS" },
  { id: "queue", label: "Queue" },
];

const AVAILABILITY_LABEL: Record<string, string> = {
  open: "Open for commissions",
  limited: "Limited slots",
  waitlist: "Waitlist only",
  closed: "Closed",
  unavailable: "Temporarily unavailable",
};

export function ClientPage({
  artist,
  gallery,
  socials,
  queue,
}: {
  artist: PublicArtist;
  gallery: PublicGalleryItem[];
  socials: PublicSocial[];
  queue: PublicQueueItem[];
}) {
  const [tab, setTab] = useState<ClientTab>("gallery");
  const priceTables = normalizePriceTables(
    artist.price_tables,
    artist.price_table,
    artist.additionals_table
  );
  const hasPrices = priceTables.some((t) => t.rows.length > 0);

  const availabilitySnap = resolveAvailability(
    parseSlotSettings({
      available_slots: artist.available_slots,
      limited_threshold: artist.limited_threshold,
      waitlist_capacity: artist.waitlist_capacity,
      availability_override: artist.availability_override,
    }),
    countUsedSlots(queue.map((q) => q.status)),
    countWaitlisted(queue.map((q) => q.status)),
    artist.availability_status
  );
  const statusKey = availabilitySnap.status;
  const detailLine = availabilityDetailLine(availabilitySnap);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <header className="text-center">
          <div className="flex justify-center mb-4">
            <BrandMark href="/" size="sm" />
          </div>
          <Image
            src="/assets/icon.svg"
            alt=""
            width={56}
            height={56}
            className="w-12 h-12 mx-auto mb-2 rounded-full object-contain"
          />
          <h1 className="text-xl font-semibold tracking-tight text-navy">{artist.artist_name}</h1>
          {statusKey && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="status-badge bg-navy-soft text-navy inline-block">
                Status: {AVAILABILITY_LABEL[statusKey] ?? statusKey}
              </span>
              {detailLine && (
                <p className="text-xs text-text-muted font-medium tracking-tight">{detailLine}</p>
              )}
            </div>
          )}
          {artist.availability_message && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              {artist.availability_message}
            </p>
          )}
        </header>

        <ContactIcons socials={socials} contactEmail={artist.contact_email} />

        <PanelTabs tabs={TABS} active={tab} onChange={setTab} align="center" />

        <article className="glass-strong rounded-2xl p-5 sm:p-6 min-h-[280px]">
          {tab === "gallery" && (
            gallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Image
                  src="/assets/outer-space-pana.svg"
                  alt=""
                  width={140}
                  height={140}
                  className="w-28 h-28 mb-3 opacity-90"
                />
                <p className="text-sm text-text-secondary">No samples yet.</p>
              </div>
            ) : (
              <ul className="columns-2 gap-2.5 [column-fill:_balance]">
                {gallery.map((item) => (
                  <li key={item.id} className="break-inside-avoid mb-2.5">
                    <Image
                      src={galleryPublicUrl(item.storage_path)}
                      alt={item.caption || "Sample work"}
                      width={640}
                      height={640}
                      sizes="(max-width:640px) 45vw, 240px"
                      className="w-full h-auto rounded-xl bg-bg-secondary object-contain"
                      loading="lazy"
                    />
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "prices" && (
            !hasPrices ? (
              <p className="text-sm text-text-secondary text-center py-8">Prices coming soon.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {priceTables.map((table) => (
                  <div
                    key={table.id}
                    className="rounded-xl border border-glass-border bg-bg-secondary/40 overflow-hidden"
                  >
                    <h3 className="text-xs font-semibold tracking-tight text-navy text-center uppercase px-3 py-2.5 border-b border-glass-border">
                      {table.title}
                    </h3>
                    {table.rows.length === 0 ? (
                      <p className="text-sm text-text-secondary px-3 py-3">Empty table.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr>
                              {table.columns.map((col, i) => (
                                <th
                                  key={i}
                                  className={`text-left text-xs uppercase tracking-wide text-text-muted font-semibold px-3 py-2 border-b border-glass-border ${
                                    i > 0 ? "border-l border-glass-border" : ""
                                  }`}
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, ri) => (
                              <tr
                                key={ri}
                                className="border-b border-glass-border/70 last:border-b-0"
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className={`px-3 py-2.5 text-navy align-top ${
                                      ci > 0 ? "border-l border-glass-border" : ""
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "tos" && (
            artist.tos_markdown?.trim() ? (
              renderSimpleMarkdown(artist.tos_markdown)
            ) : (
              <p className="text-sm text-text-secondary text-center py-8">No terms posted yet.</p>
            )
          )}

          {tab === "queue" && (
            <PublicQueueKanban
              queue={queue}
              columns={artist.kanban_columns}
              tatMin={artist.tat_min_days}
              tatMax={artist.tat_max_days}
            />
          )}
        </article>

        <StorysetCredit className="text-center" />
      </div>
    </div>
  );
}
