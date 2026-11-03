"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string; locked?: boolean };

export function NavLinks({ items, lockedLabel }: { items: NavItem[]; lockedLabel: string }) {
  const pathname = usePathname();
  // Only the most specific matching item is active (e.g. /create/follow-up-coach, not also /create).
  const matches = items.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-4 text-lg font-semibold ${
                active ? "bg-brand-700 text-white" : "text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden className="text-2xl">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.locked ? (
                <span aria-label={lockedLabel} title={lockedLabel}>
                  🔒
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
