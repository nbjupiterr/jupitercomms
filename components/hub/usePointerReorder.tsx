"use client";

import { useCallback, useRef, useState } from "react";

/** Touch + mouse reorder via a grip handle (HTML5 drag is unreliable on iOS/iPad). */
export function usePointerReorder(onReorder: (from: number, to: number) => void) {
  const fromRef = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const setOver = (index: number | null) => {
    overRef.current = index;
    setOverIndex(index);
  };

  const bindHandle = useCallback(
    (index: number) => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        fromRef.current = index;
        setActiveIndex(index);
        setOver(index);
      },
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        if (fromRef.current == null) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const node = el?.closest("[data-reorder-index]") as HTMLElement | null;
        if (!node) return;
        const to = Number(node.dataset.reorderIndex);
        if (Number.isFinite(to) && to !== overRef.current) setOver(to);
      },
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
        const from = fromRef.current;
        const to = overRef.current;
        fromRef.current = null;
        setActiveIndex(null);
        setOver(null);
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
        if (from != null && to != null && from !== to) onReorder(from, to);
      },
      onPointerCancel: () => {
        fromRef.current = null;
        setActiveIndex(null);
        setOver(null);
      },
    }),
    [onReorder]
  );

  return { activeIndex, overIndex, bindHandle };
}
