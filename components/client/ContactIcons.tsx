import { getPlatform, isSafeHref } from "@/lib/social-platforms";
import type { PublicSocial } from "@/components/client/types";

export function ContactIcons({
  socials,
  contactEmail,
}: {
  socials: PublicSocial[];
  contactEmail: string | null;
}) {
  const safeSocials = socials.filter((link) => isSafeHref(link.url));
  const safeEmail =
    contactEmail && isSafeHref(`mailto:${contactEmail.replace(/^mailto:/i, "")}`)
      ? contactEmail.replace(/^mailto:/i, "")
      : null;

  if (safeSocials.length === 0 && !safeEmail) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2.5">
        {safeSocials.map((link) => {
          const meta = getPlatform(link.platform);
          const Icon = meta.Icon;
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={meta.label}
              title={meta.label}
              className="w-10 h-10 rounded-full border border-glass-border bg-bg-card flex items-center justify-center text-navy hover:border-navy/40 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
        {safeEmail && (
          <a
            href={`mailto:${safeEmail}`}
            aria-label="Email"
            title="Email"
            className="w-10 h-10 rounded-full border border-glass-border bg-bg-card flex items-center justify-center text-navy hover:border-navy/40 transition-colors"
          >
            {(() => {
              const Icon = getPlatform("email").Icon;
              return <Icon className="w-4 h-4" />;
            })()}
          </a>
        )}
      </div>
    </div>
  );
}
