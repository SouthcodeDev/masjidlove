"use client";

import { Typography } from "@heroui/react";
import { LinkButton } from "@/components/onboarding/link-button";
import { BrandHeart } from "@/components/icons";

/** Brand wave — art from the spec, shipped as a single SVG. */
function BrandWave() {
  return (
    <svg
      viewBox="0 0 393 90"
      className="block h-[90px] w-full flex-none"
      aria-hidden
    >
      <path
        d="M0 62 C 80 6 150 78 236 56 C 310 37 360 14 393 26"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function WelcomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center pb-6 text-accent">
          <BrandHeart size={150} />
        </div>
        <BrandWave />
        <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-2">
          <Typography.Heading level={1}>MasjidLove</Typography.Heading>
          <Typography.Paragraph className="max-w-[300px] text-center text-muted">
            Events and salah for the masjids around you, kept current by the
            masjids themselves.
          </Typography.Paragraph>
        </div>
      </div>
      <footer className="flex flex-col gap-3 px-6 pb-8">
        <LinkButton href="/continue-with" variant="primary" size="lg" fullWidth>
          Sign up
        </LinkButton>
        <LinkButton
          href="/log-in"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Log in
        </LinkButton>
      </footer>
    </div>
  );
}
