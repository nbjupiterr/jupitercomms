"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/Brand";

const navItems = [
  { href: "/dashboard", label: "Hub" },
  { href: "/dashboard/queue", label: "Queue" },
  { href: "/dashboard/workflow", label: "Workflow" },
  { href: "/dashboard/availability", label: "Availability" },
  { href: "/dashboard/settings", label: "Settings" },
];

export const Sidebar = ({ user: _user }: { user: User }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-xl px-3 py-2 text-sm font-medium text-navy shadow-sm"
        aria-label="Open menu"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 bg-navy/35 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-full lg:w-56 bg-bg-card/95 backdrop-blur-xl border-r border-glass-border flex flex-col
          transform transition-transform duration-200
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <BrandMark />
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-sm text-text-secondary hover:text-navy"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <nav className="flex-1 px-3 pb-4 flex flex-col gap-1">
          {navItems.map(({ href, label }, i) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 45}ms` }}
                className={`
                  animate-nav-in
                  px-3 py-2.5 rounded-xl text-sm tracking-tight transition-all duration-200 hover:translate-x-1
                  ${active
                    ? "bg-honey-soft text-navy font-semibold"
                    : "text-text-secondary hover:text-navy hover:bg-navy-soft"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mb-4 flex flex-col items-center text-center">
          <Image
            src="/assets/outer-space-cuate.svg"
            alt=""
            width={180}
            height={180}
            className="w-36 h-36"
          />
          <p className="text-sm font-semibold tracking-tight text-navy mt-1">New commission</p>
          <p className="text-xs text-text-muted leading-relaxed mt-1 mb-3">
            Add a piece and drop it into your queue.
          </p>
          <Link
            href="/dashboard/commissions/new"
            onClick={() => setOpen(false)}
            className="btn-primary text-xs w-full text-center"
          >
            Create
          </Link>
        </div>

        <div className="border-t border-glass-border px-4 py-4">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-text-muted hover:text-error transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};
