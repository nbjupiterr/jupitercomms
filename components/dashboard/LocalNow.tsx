"use client";

import { useEffect, useState } from "react";

function formatNow(date: Date) {
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { day, time };
}

export function LocalNow() {
  const [now, setNow] = useState(() => formatNow(new Date()));

  useEffect(() => {
    const tick = () => setNow(formatNow(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="text-[10px] text-text-muted font-mono shrink-0 text-right leading-tight">
      <span className="block">{now.day}</span>
      <span className="block">{now.time}</span>
    </span>
  );
}
