"use client";

import { useRouter } from "next/navigation";
import { IconBack } from "@/components/icons";

/**
 * Back button on a translucent plate, for screens with a photo hero
 * (14, 17). GAPS: composed from the spec — no library component.
 */
export function HeroBack() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => router.back()}
      className="absolute left-3 top-3.5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/[0.94] text-foreground shadow-[var(--surface-shadow)]"
    >
      <IconBack size={24} />
    </button>
  );
}
