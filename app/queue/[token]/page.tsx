import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BrandMark, StorysetCredit } from "@/components/Brand";
import { ClientPage } from "@/components/client/ClientPage";
import type { PriceTable } from "@/lib/supabase/database.types";

export default async function PublicQueuePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const [
    { data: artistRows },
    { data: queue },
    { data: gallery },
    { data: socials },
  ] = await Promise.all([
    supabase.rpc("get_public_artist", { p_token: token }),
    supabase.rpc("get_public_queue", { p_token: token }),
    supabase.rpc("get_public_gallery", { p_token: token }),
    supabase.rpc("get_public_socials", { p_token: token }),
  ]);

  const artist = artistRows?.[0];

  if (!artist) {
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

  return (
    <ClientPage
      artist={{
        artist_name: artist.artist_name,
        availability_status: artist.availability_status,
        availability_message: artist.availability_message,
        tos_markdown: artist.tos_markdown ?? null,
        contact_email: artist.contact_email ?? null,
        price_table: (artist.price_table ?? { columns: ["Type", "Price"], rows: [] }) as PriceTable,
      }}
      gallery={gallery ?? []}
      socials={socials ?? []}
      queue={queue ?? []}
    />
  );
}
