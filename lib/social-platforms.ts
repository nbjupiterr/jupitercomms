import {
  ArtStationIcon,
  BlueskyIcon,
  type BrandIcon,
  CarrdIcon,
  DeviantArtIcon,
  DiscordIcon,
  InstagramIcon,
  KofiIcon,
  LinkIcon,
  MailIcon,
  PatreonIcon,
  TelegramIcon,
  TikTokIcon,
  TumblrIcon,
  TwitchIcon,
  VgenIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons/BrandIcons";

export type SocialPlatform = {
  id: string;
  label: string;
  Icon: BrandIcon;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, placeholder: "https://instagram.com/…" },
  { id: "twitter", label: "X / Twitter", Icon: XIcon, placeholder: "https://x.com/…" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, placeholder: "https://tiktok.com/@…" },
  { id: "bluesky", label: "Bluesky", Icon: BlueskyIcon, placeholder: "https://bsky.app/profile/…" },
  { id: "discord", label: "Discord", Icon: DiscordIcon, placeholder: "https://discord.gg/…" },
  { id: "tumblr", label: "Tumblr", Icon: TumblrIcon, placeholder: "https://….tumblr.com" },
  { id: "vgen", label: "VGen", Icon: VgenIcon, placeholder: "https://vgen.co/…" },
  { id: "kofi", label: "Ko-fi", Icon: KofiIcon, placeholder: "https://ko-fi.com/…" },
  { id: "patreon", label: "Patreon", Icon: PatreonIcon, placeholder: "https://patreon.com/…" },
  { id: "carrd", label: "Carrd", Icon: CarrdIcon, placeholder: "https://….carrd.co" },
  { id: "deviantart", label: "DeviantArt", Icon: DeviantArtIcon, placeholder: "https://www.deviantart.com/…" },
  { id: "artstation", label: "ArtStation", Icon: ArtStationIcon, placeholder: "https://www.artstation.com/…" },
  { id: "youtube", label: "YouTube", Icon: YouTubeIcon, placeholder: "https://youtube.com/@…" },
  { id: "twitch", label: "Twitch", Icon: TwitchIcon, placeholder: "https://twitch.tv/…" },
  { id: "telegram", label: "Telegram", Icon: TelegramIcon, placeholder: "https://t.me/…" },
  { id: "email", label: "Email", Icon: MailIcon, placeholder: "you@example.com" },
  { id: "other", label: "Other", Icon: LinkIcon, placeholder: "https://…" },
];

export function getPlatform(id: string): SocialPlatform {
  return SOCIAL_PLATFORMS.find((p) => p.id === id) ?? {
    id: "other",
    label: "Link",
    Icon: LinkIcon,
    placeholder: "https://…",
  };
}

/** True for http(s) links and mailto: only — blocks javascript: and other schemes. */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol === "mailto:") {
      return Boolean(url.pathname) && !url.pathname.toLowerCase().includes("javascript:");
    }
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeSocialHref(platform: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (platform === "email" || (trimmed.includes("@") && !trimmed.includes("://"))) {
    const mailto = trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
    return isSafeHref(mailto) ? mailto : "";
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return isSafeHref(withScheme) ? withScheme : "";
}
