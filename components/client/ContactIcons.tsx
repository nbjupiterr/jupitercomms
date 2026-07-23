import { getPlatform } from "@/lib/social-platforms";
import type { PublicSocial } from "@/components/client/types";

export function ContactIcons({
  socials,
  contactEmail,
}: {
  socials: PublicSocial[];
  contactEmail: string | null;
}) {
  if (socials.length === 0 && !contactEmail) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2.5">
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
              className="w-10 h-10 rounded-full border border-glass-border bg-bg-card flex items-center justify-center text-navy hover:border-navy/40 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            aria-label="Email"
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
