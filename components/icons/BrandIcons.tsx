import type { ReactElement, SVGProps } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siInstagram,
  siX,
  siTiktok,
  siBluesky,
  siDiscord,
  siTumblr,
  siKofi,
  siPatreon,
  siDeviantart,
  siArtstation,
  siYoutube,
  siTwitch,
  siTelegram,
} from "simple-icons";

export type BrandIcon = (props: SVGProps<SVGSVGElement>) => ReactElement;

function fromSimple(icon: SimpleIcon): BrandIcon {
  return function BrandSvg({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden {...props}>
        <path d={icon.path} />
      </svg>
    );
  };
}

function local(path: string): BrandIcon {
  return function BrandSvg({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden {...props}>
        <path d={path} />
      </svg>
    );
  };
}

export const InstagramIcon = fromSimple(siInstagram);
export const XIcon = fromSimple(siX);
export const TikTokIcon = fromSimple(siTiktok);
export const BlueskyIcon = fromSimple(siBluesky);
export const DiscordIcon = fromSimple(siDiscord);
export const TumblrIcon = fromSimple(siTumblr);
export const KofiIcon = fromSimple(siKofi);
export const PatreonIcon = fromSimple(siPatreon);
export const DeviantArtIcon = fromSimple(siDeviantart);
export const ArtStationIcon = fromSimple(siArtstation);
export const YouTubeIcon = fromSimple(siYoutube);
export const TwitchIcon = fromSimple(siTwitch);
export const TelegramIcon = fromSimple(siTelegram);

/** Stylized V — VGen is not in Simple Icons. */
export const VgenIcon = local("M4.5 4h4.2L12 14.2 15.3 4h4.2L13.6 20h-3.2L4.5 4z");
export const CarrdIcon = local("M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 4v2h12V8H6zm0 4v2h8v-2H6z");
export const MailIcon = local("M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z");
export const LinkIcon = local("M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z");
