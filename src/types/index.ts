export type Masjid = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  eventsThisWeek?: number;
};

export type Event = {
  id: string;
  title: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  /** 24h time, e.g. "19:45" */
  time: string;
  masjidId: string;
};

export type OnboardingRole = "community" | "admin";

export type NotificationPreferences = {
  newEvents: boolean;
  eventReminders: boolean;
  jamaatChanges: boolean;
  dailySalah: boolean;
  reminderLead: "30min" | "1hour" | "morning";
};

export type OnboardingState = {
  name: string;
  email: string;
  role: OnboardingRole | null;
  area: string;
  followedMasjidIds: string[];
  notifications: NotificationPreferences;
};

export const defaultOnboardingState: OnboardingState = {
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
};
