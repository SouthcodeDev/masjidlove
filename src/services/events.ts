import type { Event } from "@/types";

// Mock data until Supabase exists (SETUP.md §10).

const EVENTS: Event[] = [
  {
    id: "tafsir-yusuf",
    title: "Tafsīr of Sūrah Yūsuf",
    date: "2026-09-10",
    time: "19:45",
    masjidId: "masjidul-quds",
  },
  {
    id: "soup-kitchen",
    title: "Soup kitchen — packing day",
    date: "2026-09-12",
    time: "09:00",
    masjidId: "masjidus-sunni",
  },
];

export function listEvents(): Event[] {
  return EVENTS;
}
