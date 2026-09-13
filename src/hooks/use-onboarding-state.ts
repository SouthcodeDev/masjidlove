"use client";

import { useCallback, useState } from "react";
import {
  defaultOnboardingState,
  type OnboardingState,
} from "@/types";

const STORAGE_KEY = "masjidlove.onboarding";

function read(): OnboardingState {
  if (typeof window === "undefined") return defaultOnboardingState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOnboardingState;
    return { ...defaultOnboardingState, ...JSON.parse(raw) };
  } catch {
    return defaultOnboardingState;
  }
}

/**
 * Onboarding flow state until auth exists. Persisted to localStorage so a
 * refresh mid-flow keeps what the user entered. Replaced by the session
 * when Supabase arrives.
 */
export function useOnboardingState(): [
  OnboardingState,
  (update: Partial<OnboardingState>) => void,
] {
  const [state, setState] = useState<OnboardingState>(read);

  const update = useCallback(
    (patch: Partial<OnboardingState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Private mode etc. — the flow still works for the session.
        }
        return next;
      });
    },
    []
  );

  return [state, update];
}
