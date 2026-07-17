import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BrandMark, StorysetCredit } from "@/components/Brand";

const GROUPS: { status: string; label: string }[] = [
  { status: "in_progress", label: "In Progress" },
  { status: "queued", label: "In Queue" },
  { status: "waitlisted", label: "Waitlist" },
];

const AVAILABILITY_LABEL: Record<string, string> = {
  open: "Open for commissions",
  limited: "Limited slots",
  waitlist: "Waitlist only",
  closed: "Closed",
  unavailable: "Temporarily unavailable",
};

// Public page - no auth required. Shows client names in queue order, never contact info.
export default async function PublicQueuePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const [{ data: queue }, { data: artistRows }] = await Promise.all([
    supabase.rpc("get_public_queue", { p_token: token }),
    supabase.rpc("get_public_artist", { p_token: token }),
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

  const items = queue ?? [];

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-4">
        <header className="text-center mb-2">
          <div className="flex justify-center mb-4">
            <BrandMark href="/" size="sm" />
          </div>
          <p className="text-sm text-text-muted mb-2 mt-4">Commission queue for</p>
          <Image
            src="/assets/icon.svg"
            alt=""
            width={56}
            height={56}
            className="w-12 h-12 mx-auto mb-2 rounded-full object-contain"
          />
          <h1 className="text-lg font-semibold tracking-tight text-navy">{artist.artist_name}</h1>
          {artist.availability_status && (
            <span className="status-badge bg-navy-soft text-navy inline-block mt-2">
              {AVAILABILITY_LABEL[artist.availability_status] ?? artist.availability_status}
            </span>
          )}
        </header>

        <article className="glass-strong rounded-2xl p-6 flex flex-col gap-5">
          {items.length === 0 ? (
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
            GROUPS.map((group) => {
              const groupItems = items.filter((it) => it.status === group.status);
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
                              <span
                                className={`text-[10px] shrink-0 ${
                                  item.is_current ? "text-white/70" : "text-text-muted"
                                }`}
                              >
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
            })
          )}
        </article>

        {artist.availability_message && (
          <p className="text-center text-sm text-text-secondary leading-relaxed">
            {artist.availability_message}
          </p>
        )}

        <StorysetCredit className="text-center" />
      </div>
    </div>
  );
}
