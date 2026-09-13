"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconBack } from "@/components/icons";

/**
 * Shared onboarding screen scaffold: 44px back header with optional step
 * label, flexible content, sticky footer. Padding is 24px per the spec.
 */
export function OnboardingScreen({
  back,
  backHref,
  step,
  children,
  footer,
}: {
  back?: boolean;
  backHref?: string;
  step?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      {back && (
        <header className="flex h-11 flex-none items-center justify-between px-4">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-xl text-foreground active:bg-default"
            >
              <IconBack />
            </Link>
          ) : (
            <span className="h-11 w-11" />
          )}
          {step && (
            <span className="pr-2 text-base font-medium text-muted">
              {step}
            </span>
          )}
        </header>
      )}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer && (
        <footer className="sticky bottom-0 bg-background px-6 pb-8 pt-2">
          {footer}
        </footer>
      )}
    </div>
  );
}
