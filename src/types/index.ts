export type Masjid = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  /** Minutes on foot; undefined when it needs transport */
  walkMinutes?: number;
  eventsThisWeek?: number;
  address?: string;
  phone?: string;
  /** Today's five jamaat times, 24h */
  todayJamaat?: { fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string };
  /** Next jamaat's change note, e.g. "Dhuhr +15" */
  timeChange?: { prayer: string; deltaMinutes: number; note: string };
};

export type Rsvp = "going" | "maybe" | "cant-go";

export type Event = {
  id: string;
  title: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  /** 24h time, e.g. "19:45" */
  time: string;
  masjidId: string;
  /** e.g. "Weekly" or "Volunteers needed" */
  kind?: string;
  description?: string;
  /** When, second line */
  whenNote?: string;
  whereNote?: string;
  goingCount: number;
  maybeCount: number;
  /** What the user answered. Mock state until the backend exists. */
  myRsvp?: Rsvp;
};

export type OnboardingRole = "community" | "admin";

export type NotificationPreferences = {
  newEvents: boolean;
  eventReminders: boolean;
  jamaatChanges: boolean;
  dailySalah: boolean;
  reminderLead: "30min" | "1hour" | "morning";
};

export type UserState = {
  name: string;
  email: string;
  role: OnboardingRole | null;
  area: string;
  followedMasjidIds: string[];
  notifications: NotificationPreferences;
  /** Masjid ids bookmarked from Explore */
  savedMasjidIds: string[];
  /** Event RSVPs */
  rsvps: Record<string, Rsvp>;
  onboardingComplete: boolean;
};

export const defaultUserState: UserState = {
  name: "",
  email: "",
  role: null,
  area: "",
  followedMasjidIds: [],
  notifications: {
    newEvents: true,
    eventReminders: true,
    jamaatChanges: true,
    dailySalah: false,
    reminderLead: "1hour",
  },
  savedMasjidIds: [],
  rsvps: {},
  onboardingComplete: false,
};

/** "Yusuf Adams" → "YA" */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
