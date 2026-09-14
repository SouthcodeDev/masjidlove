"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@heroui/react";

/**
 * GAPS composition: a Button that navigates. The web library has no
 * LinkButton primitive (see DESIGN.md §3 for the native one), so this
 * composes Button with the Next router. Client-side only — never a
 * document load.
 */
export function LinkButton({
  href,
  ...props
}: ButtonProps & { href: string }) {
  const router = useRouter();
  return <Button {...props} onPress={() => router.push(href)} />;
}
