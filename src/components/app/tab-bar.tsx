"use client";

import Link from "next/link";
import {
  IconCalendar,
  IconHome,
  IconMapPin,
  IconUser,
} from "@/components/icons";

const TABS = [
  { href: "/home", label: "Home", Icon: IconHome },
  { href: "/explore", label: "Explore", Icon: IconMapPin },
  { href: "/events", label: "Events", Icon: IconCalendar },
  { href: "/profile", label: "Profile", Icon: IconUser },
] as const;

/**
 * Bottom tab bar. GAPS: the router owns nav chrome — the library has no
 * tab bar. Plain icon + label, active state = --accent, no pill, no FAB.
 * Profile has no screen yet; it renders as a disabled tab.
 */
export function TabBar({ active }: { active: "home" | "explore" | "events" | "profile" }) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 flex flex-none border-t border-separator bg-background pt-2"
    >
      {TABS.map(({ href, label, Icon }) => {
        const isActive = href === `/${active}`;
        if (active === "profile") {
          return (
            <span
              key={href}
              aria-disabled
              className="flex h-[62px] flex-1 cursor-not-allowed flex-col items-center justify-center gap-[3px] text-muted opacity-50"
            >
              <Icon size={24} />
              <span className="text-[11.5px]">{label}</span>
            </span>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-[62px] flex-1 flex-col items-center justify-center gap-[3px] ${
              isActive ? "font-semibold text-accent" : "text-muted"
            }`}
          >
            <Icon size={24} />
            <span className="text-[11.5px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
