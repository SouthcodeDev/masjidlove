"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, Chip } from "@heroui/react";
import { TabBar } from "@/components/app/tab-bar";
import { useUserState } from "@/hooks/use-user-state";
import { initialsOf, type Event, type Rsvp } from "@/types";
import { formatTravel, getMasjid } from "@/services/masjids";
import { listEvents } from "@/services/events";
import { IconBell, IconCheck, IconChevronRight, IconClock } from "@/components/icons";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function eventDateLabel(event: Event): string {
  const date = new Date(`${event.date}T00:00:00`);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function HomeEventCard({ event, myRsvp }: { event: Event; myRsvp?: Rsvp }) {
  const masjid = getMasjid(event.masjidId);
  const rsvp = myRsvp;
  return (
    <Link
      href={`/events/${event.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--surface-shadow)] active:bg-default"
    >
      <div className="relative h-[106px] bg-default" aria-hidden />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-center gap-2">
          <Chip
            variant="secondary"
            className="bg-accent-soft text-[12.5px] font-semibold text-accent-soft-foreground"
          >
            {eventDateLabel(event)} · {event.time}
          </Chip>
          {event.kind && (
            <span className="text-[12.5px] text-muted">{event.kind}</span>
          )}
        </div>
        <div className="text-[16.5px] font-semibold leading-tight">
          {event.title}
        </div>
        <div className="text-[13px] text-muted">
          {masjid?.name}, {masjid?.area} · {masjid && formatTravel(masjid)}
        </div>
        <div className="flex items-center gap-2.5 pt-0.5">
          {rsvp === "going" ? (
            <Chip
              variant="secondary"
              className="gap-1 bg-accent-soft px-2.5 py-1.5 text-[13px] font-semibold text-accent-soft-foreground"
            >
              <IconCheck size={15} />
              Going
            </Chip>
          ) : (
            <span className="rounded-[9px] bg-default px-2.5 py-1.5 text-[13px] font-semibold text-default-foreground">
              RSVP
            </span>
          )}
          <span className="text-[13px] text-muted">
            {event.goingCount} going
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [state] = useUserState();
  const firstName = state.name.split(" ")[0] || "there";
  const initials = initialsOf(state.name) || "ML";

  const homeMasjidId = state.followedMasjidIds[0] ?? "masjidul-quds";
  const masjid = getMasjid(homeMasjidId);

  const events = listEvents().slice(0, 2);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4 pt-1">
        <header className="flex items-center gap-3">
          <Avatar className="h-11 w-11 flex-none">
            <AvatarFallback className="text-[15px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-[13px] text-muted">Asalamu Alaykum</span>
            <span className="text-[19px] font-semibold tracking-[-0.01em]">
              {firstName}
            </span>
          </div>
          <Link
            href="/home"
            aria-label="Notifications — nothing new yet"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground"
          >
            <IconBell size={24} />
            {/* Badge dot — shown while events are unread; mock */}
            <span className="absolute right-[9px] top-[9px] h-[9px] w-[9px] rounded-full border-2 border-background bg-accent" />
          </Link>
        </header>

        <section
          aria-label="Next salah"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3"
        >
          <span className="flex-none text-muted">
            <IconClock size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-[15.5px]">
              <span className="font-semibold">Dhuhr 13:15</span>
              <span className="text-muted"> · in 1 h 42 m</span>
            </span>
            <span className="text-[13px] text-muted">
              {masjid?.name} · {masjid && formatTravel(masjid)}
            </span>
          </div>
          <Link
            href={`/masjid/${homeMasjidId}/jamaat`}
            className="flex items-center gap-0.5 text-[13.5px] font-medium text-accent"
          >
            All times
            <IconChevronRight size={16} />
          </Link>
        </section>

        <section aria-label="This week near you" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[19px] font-semibold tracking-[-0.01em]">
              This week near you
            </span>
            <Link
              href="/events"
              className="text-[13.5px] font-medium text-accent"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <HomeEventCard
                key={event.id}
                event={event}
                myRsvp={state.rsvps[event.id]}
              />
            ))}
          </div>
        </section>
      </main>
      <TabBar active="home" />
    </div>
  );
}
