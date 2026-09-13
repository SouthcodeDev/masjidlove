import type { Masjid } from "@/types";

// Mock data until Supabase exists (SETUP.md §10). Real Cape Town masjids,
// per the spec's own content. Distances are illustrative.

const MASJIDS: Masjid[] = [
  {
    id: "masjidul-quds",
    name: "Masjidul Quds",
    area: "Gatesville",
    distanceKm: 0.65,
    eventsThisWeek: 3,
  },
  {
    id: "habibia",
    name: "Habibia Masjid",
    area: "Rylands",
    distanceKm: 1.1,
    eventsThisWeek: 1,
  },
  {
    id: "masjidus-sunni",
    name: "Masjidus Sunni",
    area: "Rylands",
    distanceKm: 1.4,
    eventsThisWeek: 2,
  },
  {
    id: "zeenatul-islam",
    name: "Zeenatul Islam Masjid",
    area: "District Six",
    distanceKm: 4.6,
  },
  {
    id: "masjidul-jamiah",
    name: "Masjidul Jamiah",
    area: "Mowbray",
    distanceKm: 5.2,
  },
];

export function listMasjids(): Masjid[] {
  return MASJIDS;
}

export function getMasjid(id: string): Masjid | undefined {
  return MASJIDS.find((m) => m.id === id);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
