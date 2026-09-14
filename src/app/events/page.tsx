"use client";

import { useRouter } from "next/navigation";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { TabBar } from "@/components/app/tab-bar";
import { useUserState } from "@/hooks/use-user-state";
import { listEvents } from "@/services/events";
import { getMasjid } from "@/services/masjids";
import type { Event, Rsvp } from "@/types";
import {
  IconCheck,
  IconQuestion,
  IconX,
} from "@/components/icons";

const FILTERS = ["Upcoming", "Going", "Past"] as const;

function RSVPBadge({ rsvp }: { rsvp?: Rsvp }) {
  if (rsvp === "going") {
    return (
      <span className="flex items-center gap-1 rounded-lg bg-accent-soft px-2 py-1 text-[12.5px] font-semibold text-accent-soft-foreground">
        <IconCheck size={14} />
        Going
      </span>
    );
  }
  if (rsvp === "maybe") {
    return (
      <span className="flex items-center gap-1 rounded-lg bg-warning-soft px-2 py-1 text-[12.5px] font-semibold text-warning-soft-foreground">
        <IconQuestion size={14} />
        Maybe
      </span>
    );
  }
  if (rsvp === "cant-go") {
    return (
      <span className="flex items-center gap-1 rounded-lg bg-default px-2 py-1 text-[12.5px] font-medium text-muted">
        <IconX size={14} />
        Can’t go
      </span>
    );
  }
  return (
    <span className="rounded-lg border border-accent px-2.5 py-1 text-[12.5px] font-semibold text-accent">
      RSVP
    </span>
  );
}

function EventRow({ event, myRsvp }: { event: Event; myRsvp?: Rsvp }) {
  const router = useRouter();
  const masjid = getMasjid(event.masjidId);
  const date = new Date(`${event.date}T00:00:00`);
  const going = myRsvp === "going";

  return (
    <button
      type="button"
      onClick={() => router.push(`/events/${event.id}`)}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-background p-3.5 text-start shadow-[var(--surface-shadow)] active:bg-default"
    >
      <span
        className={`flex h-14 w-[52px] flex-none flex-col items-center justify-center rounded-xl ${
          going ? "bg-accent-soft" : "bg-default"
        }`}
      >
        <span
          className={`text-[11.5px] font-semibold ${
            going ? "text-accent-soft-foreground" : "text-muted"
          }`}
        >
          {date
            .toLocaleDateString("en-ZA", { weekday: "short" })
            .toUpperCase()}
        </span>
        <span
          className={`text-[22px] font-bold leading-tight ${
            going ? "text-accent-soft-foreground" : ""
          }`}
        >
          {date.getDate()}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="text-base font-semibold leading-tight">
          {event.title}
        </span>
        <span className="text-[13px] text-muted">
          {event.time} · {masjid?.name}
        </span>
        <span className="flex items-center gap-2">
          <RSVPBadge rsvp={myRsvp} />
          <span className="text-[12.5px] text-muted">
            {myRsvp === "maybe"
              ? `${event.goingCount} going · ${event.maybeCount} maybe`
              : `${event.goingCount} going${
                  myRsvp ? "" : " · Open to all"
                }`}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function EventsPage() {
  const [state] = useUserState();
  const events = listEvents();

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-1">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Events</h1>
          <span className="text-[13px] text-muted">
            {state.followedMasjidIds.length || 4} masjids
          </span>
        </div>

        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          defaultSelectedKeys={new Set(["Upcoming"])}
          aria-label="Event filters"
          className="flex gap-2 self-start"
        >
          {FILTERS.map((filter) => (
            <ToggleButton
              key={filter}
              id={filter}
              variant="default"
              className="min-h-[44px] rounded-xl px-3.5 text-sm font-medium data-[selected=true]:bg-accent data-[selected=true]:font-semibold data-[selected=true]:text-accent-foreground"
            >
              {filter}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <h2 className="pl-0.5 text-[13.5px] font-medium text-muted">
          This week
        </h2>
        <div className="flex flex-col gap-3">
          {events.slice(0, 3).map((event) => (
            <EventRow
              key={event.id}
              event={event}
              myRsvp={state.rsvps[event.id]}
            />
          ))}
        </div>

        <h2 className="pl-0.5 text-[13.5px] font-medium text-muted">
          Next week
        </h2>
        <EventRow event={events[3]} myRsvp={state.rsvps[events[3].id]} />
      </main>
      <TabBar active="events" />
    </div>
  );
}
