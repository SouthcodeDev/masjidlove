"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Description,
  Label,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { OnboardingScreen } from "@/components/onboarding/screen";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import type { NotificationPreferences } from "@/types";

const LEAD_OPTIONS: { value: NotificationPreferences["reminderLead"]; label: string }[] = [
  { value: "30min", label: "30 min" },
  { value: "1hour", label: "1 hour" },
  { value: "morning", label: "Morning of" },
];

function NotificationRow({
  label,
  description,
  isSelected,
  onChange,
}: {
  label: string;
  description: string;
  isSelected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} className="flex p-4">
      <Switch.Content className="flex w-full items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Label className="text-base font-medium">{label}</Label>
          <Description className="text-sm leading-snug">
            {description}
          </Description>
        </div>
        <Switch.Control className="shrink-0">
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [state, update] = useOnboardingState();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    state.notifications
  );

  function set<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    update({ notifications: prefs });
    router.push("/all-set");
  }

  return (
    <OnboardingScreen
      back
      backHref="/follow-masjids"
      footer={
        <Button variant="primary" size="lg" fullWidth onPress={save}>
          Save and continue
        </Button>
      }
    >
      <div className="flex flex-1 flex-col gap-7 px-4 pt-2">
        <div className="flex flex-col gap-2 px-2">
          <Typography.Heading level={2}>
            What should we tell you?
          </Typography.Heading>
          <Typography.Paragraph className="text-muted">
            Change any of this later in Profile.
          </Typography.Paragraph>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
          <NotificationRow
            label="New events"
            description="When a masjid you follow posts something"
            isSelected={prefs.newEvents}
            onChange={(v) => set("newEvents", v)}
          />
          <div className="ml-4 h-px bg-separator" />
          <NotificationRow
            label="Event reminders"
            description="A nudge before something you’re going to"
            isSelected={prefs.eventReminders}
            onChange={(v) => set("eventReminders", v)}
          />
          <div className="ml-4 h-px bg-separator" />
          <NotificationRow
            label="Jamaat time changes"
            description="Only when a time actually moves"
            isSelected={prefs.jamaatChanges}
            onChange={(v) => set("jamaatChanges", v)}
          />
          <div className="ml-4 h-px bg-separator" />
          <NotificationRow
            label="Daily salah reminders"
            description="Five a day — off unless you want them"
            isSelected={prefs.dailySalah}
            onChange={(v) => set("dailySalah", v)}
          />
        </div>

        <div className="flex flex-col gap-2.5 px-1">
          <Typography.Paragraph
            size="xs"
            className="pl-0.5 font-medium text-muted"
          >
            Remind me before an event
          </Typography.Paragraph>
          <ToggleButtonGroup
            selectedKeys={new Set([prefs.reminderLead])}
            onSelectionChange={(keys) => {
              const key = Array.from(keys as Set<string>)[0];
              if (key) set("reminderLead", key as NotificationPreferences["reminderLead"]);
            }}
            selectionMode="single"
            aria-label="Remind me before an event"
            className="flex gap-2"
          >
            {LEAD_OPTIONS.map((option) => {
              const selected = prefs.reminderLead === option.value;
              return (
                <ToggleButton
                  key={option.value}
                  id={option.value}
                  variant="default"
                  className={`h-[44px] flex-1 rounded-xl px-3.5 text-sm font-medium ${
                    selected ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  {option.label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </div>
      </div>
    </OnboardingScreen>
  );
}
