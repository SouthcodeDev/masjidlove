"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import { OnboardingScreen } from "@/components/onboarding/screen";
import { LinkButton } from "@/components/onboarding/link-button";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { IconApple, IconGoogle, BrandHeart } from "@/components/icons";

export default function LogInPage() {
  const router = useRouter();
  const [, update] = useOnboardingState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    update({ email });
    router.push("/role");
  }

  return (
    <OnboardingScreen back backHref="/">
      <div className="flex flex-1 flex-col gap-8 px-6">
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="text-accent">
            <BrandHeart size={64} />
          </span>
          <Typography.Heading level={2}>Welcome back</Typography.Heading>
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-5"
          aria-label="Log in"
        >
          <TextField
            name="email"
            type="email"
            isRequired
            value={email}
            onChange={setEmail}
            className="flex flex-col gap-2"
          >
            <Label>Email address</Label>
            <Input placeholder="you@example.com" autoComplete="email" />
          </TextField>

          <div className="flex flex-col gap-2">
            <TextField
              name="password"
              isRequired
              value={password}
              onChange={setPassword}
              className="relative flex flex-col gap-2"
            >
              <Label>Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-[38px]"
                onPress={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </TextField>
            <div className="flex justify-end">
              <Link
                href="/verify-email"
                className="text-base font-medium text-link no-underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Log in
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-separator" />
          <span className="text-sm text-muted">or</span>
          <div className="h-px flex-1 bg-separator" />
        </div>

        <div className="flex gap-3">
          {/* Social log-in is a mock until auth exists — continues to the
              same next step as the password path. */}
          <LinkButton
            href="/role"
            variant="outline"
            fullWidth
            className="h-[52px] flex-1"
          >
            <IconGoogle size={20} />
            Google
          </LinkButton>
          <LinkButton
            href="/role"
            variant="outline"
            fullWidth
            className="h-[52px] flex-1"
          >
            <IconApple size={20} />
            Apple
          </LinkButton>
        </div>

        <Typography.Paragraph size="sm" className="flex justify-center gap-1.5">
          <span className="text-muted">New here?</span>
          <Link
            href="/create-account"
            className="font-semibold text-link no-underline"
          >
            Create an account
          </Link>
        </Typography.Paragraph>
      </div>
    </OnboardingScreen>
  );
}
