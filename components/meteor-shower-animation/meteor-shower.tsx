"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Meteor {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
  tail: { x: number; y: number }[];
  tailLength: number;
  headColor: string;
  tailStart: string;
  tailMiddle: string;
  tailEnd: string;
}

const COS = Math.cos(Math.PI / 4);
const SIN = Math.sin(Math.PI / 4);

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

function createMeteor(width: number, height: number): Meteor {
  const positionFactor = Math.random();
  let x: number;
  let y: number;

  if (positionFactor < 0.25) {
    x = -20;
    y = height * Math.random() * 0.7;
  } else if (positionFactor < 0.5) {
    x = width * Math.random();
    y = -20;
  } else if (positionFactor < 0.75) {
    x = width + 20;
    y = height * Math.random() * 0.7;
  } else {
    x = width * 0.3 + Math.random() * width * 0.4;
    y = -20;
  }

  const opacity = 0.35 + Math.random() * 0.25;

  return {
    x,
    y,
    size: 1 + Math.random() * 10,
    speed: 3,
    angle: Math.PI / 4,
    opacity,
    tail: [],
    tailLength: 15,
    // Softer light-theme meteors
    headColor: rgba(160, 168, 178, opacity),
    tailStart: rgba(160, 168, 178, opacity),
    tailMiddle: rgba(175, 182, 190, opacity * 0.75),
    tailEnd: rgba(190, 194, 200, opacity * 0.08),
  };
}

export default function MeteorShower({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const meteorsRef = useRef<Meteor[]>([]);
  const animationRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let resizeTimer = 0;
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateDimensions, 120);
    };

    updateDimensions();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0 || !mounted) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Cap DPR for cheaper fills on retina without looking soft.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(dimensions.width * dpr);
    canvas.height = Math.floor(dimensions.height * dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    meteorsRef.current = Array.from({ length: 5 }, () =>
      createMeteor(dimensions.width, dimensions.height)
    );

    let running = true;

    const animate = () => {
      if (!running) return;

      if (document.hidden) {
        return;
      }

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const meteors = meteorsRef.current;
      for (let index = 0; index < meteors.length; index++) {
        const meteor = meteors[index];
        meteor.x += COS * meteor.speed;
        meteor.y += SIN * meteor.speed;

        meteor.tail.unshift({ x: meteor.x, y: meteor.y });
        if (meteor.tail.length > meteor.tailLength) {
          meteor.tail.pop();
        }

        if (meteor.tail.length > 1) {
          const head = meteor.tail[0];
          const end = meteor.tail[meteor.tail.length - 1];
          const gradient = ctx.createLinearGradient(head.x, head.y, end.x, end.y);
          gradient.addColorStop(0, meteor.tailStart);
          gradient.addColorStop(0.3, meteor.tailMiddle);
          gradient.addColorStop(1, meteor.tailEnd);

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = meteor.size;
          ctx.moveTo(head.x, head.y);
          for (let i = 1; i < meteor.tail.length; i++) {
            ctx.lineTo(meteor.tail[i].x, meteor.tail[i].y);
          }
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = meteor.headColor;
        ctx.fill();

        if (
          meteor.y > dimensions.height ||
          meteor.x < -50 ||
          meteor.x > dimensions.width + 50
        ) {
          meteors[index] = createMeteor(dimensions.width, dimensions.height);
        }
      }

      if (Math.random() < 0.02 && meteors.length < 12) {
        meteors.push(createMeteor(dimensions.width, dimensions.height));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      if (!running) return;
      if (document.hidden) {
        cancelAnimationFrame(animationRef.current);
        return;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("visibilitychange", onVisibility);
    animate();

    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [dimensions, mounted]);

  if (!mounted) {
    return <div className={cn("relative w-full overflow-hidden", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{ display: dimensions.width > 0 ? "block" : "none" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
