import Image from "next/image";
import { BrandMark, StorysetCredit } from "@/components/Brand";
import { ClientPage } from "@/components/client/ClientPage";
import type { PublicArtist, PublicGalleryItem, PublicQueueItem, PublicSocial } from "@/components/client/types";
import { getPublicPageData } from "@/lib/public-page-data";

export function clientPageDescription(artistName?: string | null) {
  const name = artistName?.trim();
  if (!name) {
    return "View commission prices, terms, availability, and queue status.";
  }
  return `Commission info for ${name} — prices, terms, availability, and queue status.`;
}

type ArtistRow = NonNullable<Awaited<ReturnType<typeof getPublicPageData>>["artist"]>;

export function toPublicArtist(artist: ArtistRow): PublicArtist {
  return {
    artist_name: artist.artist_name,
    availability_status: artist.availability_status,
    availability_message: artist.availability_message,
    tos_markdown: artist.tos_markdown ?? null,
    contact_email: artist.contact_email ?? null,
    price_table: artist.price_table,
    additionals_table: artist.additionals_table,
    price_tables: artist.price_tables,
    prices_description: artist.prices_description ?? null,
    kanban_columns: artist.kanban_columns,
    available_slots: artist.available_slots ?? null,
    limited_threshold: artist.limited_threshold ?? null,
    waitlist_capacity: artist.waitlist_capacity ?? null,
    availability_override: artist.availability_override ?? null,
  };
}

export function PublicClientNotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <BrandMark href="/" />
      </div>
      <div className="glass-strong rounded-2xl p-8 text-center max-w-sm w-full">
        <Image
          src="/assets/outer-space-rafiki.svg"
          alt=""
          width={140}
          height={140}
          className="w-28 h-28 mx-auto mb-4"
        />
        <h1 className="text-xl font-semibold tracking-tight mb-2 text-navy">Link not found</h1>
        <p className="text-text-secondary text-sm leading-relaxed">
          This queue link is invalid or has been disabled by the artist.
        </p>
      </div>
      <StorysetCredit className="mt-6" />
    </div>
  );
}

export function PublicClientPageView({
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
  return (
    <ClientPage
      artist={artist}
      gallery={gallery}
      socials={socials}
      queue={queue}
    />
  );
}
