"use client";

type Tab<T extends string> = { id: T; label: string };

export function PanelTabs<T extends string>({
  tabs,
  active,
  onChange,
  align = "start",
}: {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Client view centers tabs; Hub stays start-aligned. */
  align?: "start" | "center";
}) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className={`flex flex-wrap gap-1.5 ${align === "center" ? "justify-center" : "justify-start"}`}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`
              px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-tight
              transition-colors border
              ${selected
                ? "bg-navy text-white border-navy"
                : "bg-bg-card/80 text-text-secondary border-glass-border hover:text-navy hover:border-navy/30"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
