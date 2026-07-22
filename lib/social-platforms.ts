import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Camera,
  ExternalLink,
  Gamepad2,
  Globe,
  Heart,
  Image,
  Link2,
  Mail,
  MessageCircle,
  Music2,
  Radio,
  Send,
  Share2,
  Users,
  Video,
} from "lucide-react";

export type SocialPlatform = {
  id: string;
  label: string;
  Icon: LucideIcon;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram", label: "Instagram", Icon: Camera, placeholder: "https://instagram.com/…" },
  { id: "twitter", label: "X / Twitter", Icon: AtSign, placeholder: "https://x.com/…" },
  { id: "tiktok", label: "TikTok", Icon: Music2, placeholder: "https://tiktok.com/@…" },
  { id: "bluesky", label: "Bluesky", Icon: Share2, placeholder: "https://bsky.app/profile/…" },
  { id: "discord", label: "Discord", Icon: Gamepad2, placeholder: "https://discord.gg/…" },
  { id: "tumblr", label: "Tumblr", Icon: Image, placeholder: "https://….tumblr.com" },
  { id: "vgen", label: "VGen", Icon: Users, placeholder: "https://vgen.co/…" },
  { id: "kofi", label: "Ko-fi", Icon: Heart, placeholder: "https://ko-fi.com/…" },
  { id: "patreon", label: "Patreon", Icon: Heart, placeholder: "https://patreon.com/…" },
  { id: "carrd", label: "Carrd", Icon: Globe, placeholder: "https://….carrd.co" },
  { id: "deviantart", label: "DeviantArt", Icon: Image, placeholder: "https://www.deviantart.com/…" },
  { id: "artstation", label: "ArtStation", Icon: Image, placeholder: "https://www.artstation.com/…" },
  { id: "youtube", label: "YouTube", Icon: Video, placeholder: "https://youtube.com/@…" },
  { id: "twitch", label: "Twitch", Icon: Radio, placeholder: "https://twitch.tv/…" },
  { id: "telegram", label: "Telegram", Icon: Send, placeholder: "https://t.me/…" },
  { id: "email", label: "Email", Icon: Mail, placeholder: "you@example.com" },
  { id: "other", label: "Other", Icon: ExternalLink, placeholder: "https://…" },
];

export function getPlatform(id: string): SocialPlatform {
  return SOCIAL_PLATFORMS.find((p) => p.id === id) ?? {
    id: "other",
    label: "Link",
    Icon: Link2,
    placeholder: "https://…",
  };
}

export function normalizeSocialHref(platform: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (platform === "email" || (trimmed.includes("@") && !trimmed.includes("://"))) {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
