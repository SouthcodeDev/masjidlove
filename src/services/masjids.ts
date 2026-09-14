import type { Masjid } from "@/types";

// Mock data until Supabase exists (SETUP.md §10). Real Cape Town masjids,
// per the spec's own content. Distances and times are illustrative.

const MASJIDS: Masjid[] = [
  {
    id: "masjidul-quds",
    name: "Masjidul Quds",
    area: "Gatesville",
    distanceKm: 0.65,
    walkMinutes: 8,
    eventsThisWeek: 3,
    todayJamaat: {
      fajr: "05:42",
      dhuhr: "13:15",
      asr: "16:30",
      maghrib: "18:22",
      isha: "19:40",
    },
    timeChange: {
      prayer: "Dhuhr",
      deltaMinutes: 15,
      note: "Changed this week · Jumuʿah 12:30, Afrikaans",
    },
  },
  {
    id: "habibia",
    name: "Habibia Masjid",
    area: "Rylands",
    distanceKm: 1.1,
    walkMinutes: 14,
    eventsThisWeek: 1,
    address: "129 Belgravia Rd, Rylands, 7764",
    phone: "021 637 8892",
    todayJamaat: {
      fajr: "05:45",
      dhuhr: "13:20",
      asr: "16:35",
      maghrib: "18:24",
      isha: "19:45",
    },
    timeChange: {
      prayer: "Dhuhr",
      deltaMinutes: 15,
      note: "Changed this week · Jumuʿah 12:30, Afrikaans",
    },
  },
  {
    id: "masjidus-sunni",
    name: "Masjidus Sunni",
    area: "Rylands",
    distanceKm: 1.4,
    walkMinutes: 17,
    eventsThisWeek: 2,
    todayJamaat: {
      fajr: "05:42",
      dhuhr: "13:15",
      asr: "16:30",
      maghrib: "18:24",
      isha: "19:40",
    },
  },
  {
    id: "zeenatul-islam",
    name: "Zeenatul Islam Masjid",
    area: "District Six",
    distanceKm: 4.6,
    eventsThisWeek: 0,
  },
  {
    id: "masjidul-jamiah",
    name: "Masjidul Jamiah",
    area: "Mowbray",
    distanceKm: 5.2,
    eventsThisWeek: 0,
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

/** "8 min walk" or "4.6 km · drive" */
export function formatTravel(masjid: Masjid): string {
  if (masjid.walkMinutes !== undefined) {
    return `${masjid.walkMinutes} min walk`;
  }
  return `${formatDistance(masjid.distanceKm)} · drive`;
}
