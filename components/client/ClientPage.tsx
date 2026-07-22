"use client";

import Image from "next/image";
import { useState } from "react";
import { BrandMark, StorysetCredit } from "@/components/Brand";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { renderSimpleMarkdown } from "@/lib/markdown";
import { galleryPublicUrl } from "@/lib/gallery";
import { getPlatform } from "@/lib/social-platforms";
import { normalizePriceTable } from "@/components/hub/PriceTableEditor";
import type { PriceTable } from "@/lib/supabase/database.types";

type ClientTab = "gallery" | "prices" | "tos" | "queue" | "contact";

const TABS: { id: ClientTab; label: string }[] = [
  { id: "gallery", label: "Gallery" },
  { id: "prices", label: "Prices" },
  { id: "tos", label: "TOS" },
  { id: "queue", label: "Queue" },
  { id: "contact", label: "Contact" },
];

const AVAILABILITY_LABEL: Record<string, string> = {
  open: "Open for commissions",
  limited: "Limited slots",
  waitlist: "Waitlist only",
  closed: "Closed",
  unavailable: "Temporarily unavailable",
};

const GROUPS: { status: string; label: string }[] = [
  { status: "in_progress", label: "In Progress" },
  { status: "queued", label: "In Queue" },
  { status: "waitlisted", label: "Waitlist" },
];

export type PublicArtist = {
  artist_name: string;
  availability_status: string;
  availability_message: string | null;
  tos_markdown: string | null;
  contact_email: string | null;
  price_table: PriceTable | unknown;
};

export type PublicGalleryItem = {
  id: string;
  storage_path: string;
  caption: string | null;
};

export type PublicSocial = {
  id: string;
  platform: string;
  url: string;
};

export type PublicQueueItem = {
  client_name: string;
  is_current: boolean;
  progress_percentage: number;
  stage_name: string | null;
  queue_position: number;
  status: string;
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
  const priceTable = normalizePriceTable(artist.price_table);

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
          {artist.availability_status && (
            <span className="status-badge bg-navy-soft text-navy inline-block mt-2">
              {AVAILABILITY_LABEL[artist.availability_status] ?? artist.availability_status}
            </span>
          )}
          {artist.availability_message && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              {artist.availability_message}
            </p>
          )}
        </header>

        <PanelTabs tabs={TABS} active={tab} onChange={setTab} />

        <article className="glass-strong rounded-2xl p-5 sm:p-6 min-h-[280px]">
          {tab === "gallery" && (
            gallery.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">No samples yet.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2.5">
                {gallery.map((item) => (
                  <li key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-bg-secondary">
                    <Image
                      src={galleryPublicUrl(item.storage_path)}
                      alt={item.caption || "Sample work"}
                      fill
                      sizes="(max-width:640px) 45vw, 240px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "prices" && (
            priceTable.rows.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">Prices coming soon.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {priceTable.columns.map((col, i) => (
                        <th
                          key={i}
                          className="text-left text-xs uppercase tracking-wide text-text-muted font-semibold pb-2 pr-3 border-b border-glass-border"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {priceTable.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-glass-border/70 last:border-0">
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2.5 pr-3 text-navy align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === "tos" && (
            artist.tos_markdown?.trim() ? (
              <div className="text-sm text-text-secondary">
                {renderSimpleMarkdown(artist.tos_markdown)}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-8">No terms posted yet.</p>
            )
          )}

          {tab === "queue" && (
            queue.length === 0 ? (
              <div className="text-center py-6">
                <Image
                  src="/assets/solar-system-amico.svg"
                  alt=""
                  width={140}
                  height={140}
                  className="w-24 h-24 mx-auto mb-3 opacity-90"
                />
                <p className="text-sm text-text-secondary">Queue is empty right now.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {GROUPS.map((group) => {
                  const groupItems = queue.filter((it) => it.status === group.status);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group.status}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                          {group.label}
                        </h3>
                        <span className="text-[10px] font-mono text-text-muted">{groupItems.length}</span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {groupItems.map((item) => (
                          <li
                            key={`${item.queue_position}-${item.client_name}`}
                            className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ${
                              item.is_current ? "bg-[#3a3d3a] text-white" : "glass"
                            }`}
                          >
                            <span
                              className={`text-sm font-mono w-6 shrink-0 mt-0.5 ${
                                item.is_current ? "text-white/70" : "text-text-muted"
                              }`}
                            >
                              #{item.queue_position}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-medium truncate ${item.is_current ? "text-white" : "text-navy"}`}>
                                  {item.client_name}
                                </span>
                                {item.stage_name && (
                                  <span className={`text-[10px] shrink-0 ${item.is_current ? "text-white/70" : "text-text-muted"}`}>
                                    {item.stage_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${item.is_current ? "bg-white/25" : "bg-navy-soft"}`}>
                                  <div
                                    className={`h-full rounded-full ${item.is_current ? "bg-white" : "bg-navy"}`}
                                    style={{ width: `${item.progress_percentage}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-mono shrink-0 ${item.is_current ? "text-white/80" : "text-text-muted"}`}>
                                  {item.progress_percentage}%
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "contact" && (
            <div className="flex flex-col items-center gap-5 py-4">
              {(socials.length > 0 || artist.contact_email) ? (
                <>
                  <div className="flex flex-wrap justify-center gap-3">
                    {socials.map((link) => {
                      const meta = getPlatform(link.platform);
                      const Icon = meta.Icon;
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={meta.label}
                          className="w-11 h-11 rounded-full border border-glass-border bg-bg-card flex items-center justify-center text-navy hover:border-navy/40 transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                    {artist.contact_email && (
                      <a
                        href={`mailto:${artist.contact_email}`}
                        aria-label="Email"
                        className="w-11 h-11 rounded-full border border-glass-border bg-bg-card flex items-center justify-center text-navy hover:border-navy/40 transition-colors"
                      >
                        {(() => {
                          const Icon = getPlatform("email").Icon;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </a>
                    )}
                  </div>
                  {artist.contact_email && (
                    <p className="text-xs text-text-muted text-center">{artist.contact_email}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-secondary text-center py-6">No contact links yet.</p>
              )}
            </div>
          )}
        </article>

        <StorysetCredit className="text-center" />
      </div>
    </div>
  );
}
