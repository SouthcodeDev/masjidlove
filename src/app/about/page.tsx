"use client";

import Link from "next/link";

export default function About() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="text-center">
        Skeleton route. Proves client-side navigation between two routes.
      </p>
      <Link href="/" className="min-h-[44px] leading-[44px] underline">
        Back home
      </Link>
    </main>
  );
}
