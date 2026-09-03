"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import GoToShortcut from "@/components/GoToShortcut";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/login-attempts", label: "Login Attempts" },
];

export default function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <GoToShortcut keys={["g", "h"]} href="/" />
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex gap-4 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "font-semibold"
                    : "text-gray-500 transition-opacity hover:opacity-60"
                }
              >
                {item.label}
              </NextLink>
            );
          })}
        </nav>

        <form action={logout}>
          <button className="rounded-full border border-gray-400 px-3 py-1 text-sm transition-opacity hover:opacity-60">
            Log out
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}
