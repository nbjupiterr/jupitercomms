import Image from "next/image";
import Link from "next/link";

// Storyset free license requires visible attribution for the illustrations used.
export function StorysetCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-text-muted ${className}`}>
      <a
        href="https://storyset.com/cute"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-accent-dim transition-colors"
      >
        Cute illustrations by Storyset
      </a>
    </p>
  );
}

export function BrandMark({ href = "/", size = "md" }: { href?: string; size?: "sm" | "md" }) {
  const logoHeight = size === "sm" ? 44 : 62;
  const textSize = size === "sm" ? "text-sm" : "text-xl";
  return (
    <Link href={href} className="inline-flex items-center tracking-tight">
      <Image
        src="/assets/orbitlogo.png"
        alt="Orbit"
        width={logoHeight * 2.4}
        height={logoHeight}
        className="h-[var(--logo-h)] w-auto max-w-none object-contain -my-3"
        style={{ "--logo-h": `${logoHeight}px`, width: "auto", height: `${logoHeight}px` } as React.CSSProperties}
        priority
      />
      <span className={`font-normal text-text-muted ${textSize} -ml-1`}>by Jupiter</span>
    </Link>
  );
}
