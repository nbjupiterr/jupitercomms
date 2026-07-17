import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark, StorysetCredit } from "@/components/Brand";

type AuthView = "login" | "signup" | "forgot";

const tabs: { view: AuthView; label: string; href: string }[] = [
  { view: "login", label: "Sign in", href: "/login" },
  { view: "signup", label: "Sign up", href: "/signup" },
];

export function AuthShell({
  active,
  title,
  subtitle,
  children,
}: {
  active: AuthView;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="h-[100dvh] overflow-hidden flex items-center justify-center p-4">
      <section className="w-full max-w-5xl h-[600px] max-h-[calc(100dvh-2rem)] glass-strong rounded-[2rem] overflow-hidden grid lg:grid-cols-[0.82fr_1.18fr] shadow-[0_24px_80px_rgba(30,30,30,0.1)]">
        <div className="bg-white/92 flex flex-col">
          <nav className="grid grid-cols-2 border-b border-glass-border" aria-label="Authentication">
            {tabs.map((tab) => (
              <Link
                key={tab.view}
                href={tab.href}
                className={`px-2 py-4 text-center text-xs sm:text-sm transition-colors ${
                  active === tab.view
                    ? "bg-white text-navy font-semibold"
                    : "bg-navy-soft/45 text-text-muted hover:text-navy"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 flex flex-col items-stretch justify-center px-6 py-6 sm:px-10 overflow-y-auto">
            <div key={active} className="w-full max-w-sm animate-auth-in">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-navy transition-colors mb-5"
              >
                <span aria-hidden="true">←</span> Back to home
              </Link>
              <div className="mt-1 flex justify-center">
                <BrandMark />
              </div>
              <div className="mt-3 mb-4">
                <h1 className="text-xl font-semibold tracking-tight text-navy">
                  {title}
                </h1>
                <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
          <StorysetCredit className="px-6 pb-6 lg:hidden" />
        </div>

        <div className="relative hidden lg:flex flex-col items-center justify-center px-10 py-12 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.9),rgba(234,234,231,.7)_45%,rgba(220,220,217,.5))]" />
          <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-navy/10 blur-3xl" />
          <div className="absolute left-8 top-8 h-64 w-64 rounded-full bg-navy/5 blur-3xl" />

          <div className="relative z-10 text-center">
            <p className="mb-4 text-sm font-semibold tracking-[0.12em] uppercase text-text-muted">
              Orbit by Jupiter
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-navy">
              Welcome to your creative orbit
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary leading-relaxed">
              One beautiful workspace for commissions, queues, and client updates.
            </p>
            <Image
              src="/assets/astronaut-suit-pana.svg"
              alt="Artist exploring outer space"
              width={400}
              height={400}
              priority
              className="mx-auto mt-4 w-full max-w-xs drop-shadow-[0_24px_28px_rgba(30,30,30,.1)]"
            />
          </div>

          <StorysetCredit className="relative z-10 mt-auto" />
        </div>
      </section>
    </main>
  );
}
