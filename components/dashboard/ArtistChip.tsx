import Image from "next/image";

export function ArtistChip({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <Image
        src="/assets/icon.svg"
        alt=""
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-contain shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight text-navy truncate">{name}</p>
        <p className="text-[11px] text-text-muted">Artist</p>
      </div>
    </div>
  );
}
