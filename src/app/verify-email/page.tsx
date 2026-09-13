"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Link,
  Typography,
} from "@heroui/react";
import { OnboardingScreen } from "@/components/onboarding/screen";
import { useOnboardingState } from "@/hooks/use-onboarding-state";
import { IconMail } from "@/components/icons";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state] = useOnboardingState();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(
      () => setSecondsLeft((s) => s - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const complete = code.length === OTP_LENGTH;

  function resend() {
    setSecondsLeft(RESEND_SECONDS);
  }

  return (
    <OnboardingScreen back backHref="/create-account">
      <div className="flex flex-1 flex-col gap-8 px-6">
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-accent">
            <IconMail size={40} />
          </span>
          <Typography.Heading level={2}>Check your email</Typography.Heading>
          <Typography.Paragraph className="text-muted">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {state.email || "your email"}
            </span>
            . Enter it below.
          </Typography.Paragraph>
        </div>

        <div className="flex flex-col gap-4">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={code}
            onChange={(v: string) => {
              setCode(v);
              if (v.length === OTP_LENGTH) {
                // Mock verification: any complete code proceeds.
                router.push("/role");
              }
            }}
            aria-label="6-digit verification code"
            autoFocus
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="flex flex-col gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isDisabled={!complete}
              onPress={() => router.push("/role")}
            >
              Verify
            </Button>
            <Typography.Paragraph
              size="sm"
              className="flex items-center gap-1.5"
            >
              <span className="text-muted">Didn’t get it?</span>
              {secondsLeft > 0 ? (
                <>
                  <span aria-disabled className="font-medium text-link opacity-50">
                    Send again
                  </span>
                  <span className="text-muted">
                    in {Math.floor(secondsLeft / 60)}:
                    {String(secondsLeft % 60).padStart(2, "0")}
                  </span>
                </>
              ) : (
                <Link
                  href="/verify-email"
                  onPress={resend}
                  className="font-medium text-link no-underline"
                >
                  Send again
                </Link>
              )}
            </Typography.Paragraph>
          </div>
        </div>
      </div>
    </OnboardingScreen>
  );
}
