"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">MasjidLuv</h1>
      <Button>Get started</Button>
      <Link href="/about" className="min-h-[44px] leading-[44px] underline">
        About
      </Link>
    </main>
  );
}
