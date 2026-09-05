# SETUP.md

How this repository gets built from empty. Ordered, with a pass/fail gate after every step.

**Read `AGENTS.md` first.** This file says what to build; `AGENTS.md` says how to work here.
Where they disagree, `AGENTS.md` wins.

### Who runs this

One agent session on one machine (macOS), start to finish. Ameer then clones and runs §9 to
prove the repo works on Windows. Do not run §1–§8 twice on two machines.

### How to run it

Work top to bottom. **Each step has a gate. If a gate fails, stop and report — do not
continue, and do not work around it.** A step that "mostly worked" is a failed step.

Record the actual output of every command. Exit codes go in the report as observed, not as
expected. If a command's output differs from what this document predicts, the document is
wrong: say so.

### Definition of done

A deployed URL that installs to a phone home screen, opens without browser chrome, renders
a styled HeroUI component, and navigates between two routes without a page load. Nothing
more. Everything else is a later task.

---

## 0. Preconditions

Confirm before starting. Report the actual versions.

- [ ] Node 20 or later — `node -v`
- [ ] npm 10 or later — `npm -v`
- [ ] git — `git --version`
- [ ] A GitHub repo exists (this one) and you have push access
- [ ] A Vercel account exists

If Node is older than 20, stop. HeroUI v3 needs React 19, which needs a current Node.

---

## 1. Clear the repository

The existing Expo project is being removed deliberately, not migrated. Nothing in it carries
over.

**Tag the old state first** so it stays recoverable:

```bash
git tag expo-archive
git push origin expo-archive
```

Then remove everything except `.git`:

```bash
find . -maxdepth 1 ! -name '.' ! -name '.git' -exec rm -rf {} +
git add -A
git commit -m "Remove Expo project; repo is now a Next.js web app"
```

**Gate:** `ls -a` shows only `.` , `..` and `.git`. `git log` shows the commit.

---

## 2. Scaffold Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults for anything this command prompts for that isn't in the flags above, and
**record what it chose** — the prompt set changes between versions. If a flag is rejected,
run `npx create-next-app@latest --help` and adapt rather than guessing.

Then verify what actually got installed, because two of these are load-bearing:

- [ ] `tailwindcss` is **v4** in `package.json`. If `src/app/globals.css` contains
      `@tailwind base;` rather than `@import "tailwindcss";`, it scaffolded v3 — **stop and
      report.** Do not upgrade it by hand.
- [ ] `react` is **19 or later**. HeroUI v3 requires it.

**Gate:** `npm run dev` serves the default page. `npm run build` exits 0. `npm run lint`
exits 0.

---

## 3. Pin the toolchain

Ameer is on Windows; version drift between machines is the most likely source of a wasted
afternoon.

- Add to `package.json`: `"packageManager": "npm@<your exact npm version>"` and
  `"engines": { "node": ">=20" }`
- Create `.nvmrc` containing your exact Node version
- Commit `package-lock.json`

**Gate:** `npm ci` completes cleanly from the committed lockfile.

---

## 4. HeroUI

Two steps. That is genuinely all of it in v3.

```bash
npm i @heroui/styles @heroui/react
```

Then in `src/app/globals.css` — **order matters, `tailwindcss` first**:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

> **Do not add a provider.** HeroUI v3 needs no `HeroUIProvider` wrapper and no Tailwind
> plugin. If you are about to add either, you are working from v2 (`@nextui-org/react`)
> training data. Stop and re-read <https://heroui.com/en/docs/react/getting-started/quick-start>.

**Gate:** put a `<Button>` from `@heroui/react` on the home page. It renders *styled* — with
HeroUI's own background, radius and focus ring, not as a bare browser button. An unstyled
button means the CSS import didn't take.

**Optional but recommended:** HeroUI ships an MCP server, `llms.txt`, and Agent Skills for
coding agents. Wiring the MCP server into OpenCode will measurably improve component output
and is the cheapest quality win available here. See
<https://heroui.com/en/docs/react/getting-started/mcp-server>.

---

## 5. App shell

The rules in `AGENTS.md` → *PWA and app shell* become real here. Put them in
`src/app/globals.css` once, so no component ever solves them again.

- `dvh` units for full-height containers, never `vh`
- `overscroll-behavior: none` on the scroll container
- `-webkit-tap-highlight-color: transparent`
- `user-select: none` on interactive chrome only — never on content
- visible `:focus-visible` styling
- `@media (prefers-reduced-motion: reduce)` honoured

In `src/app/layout.tsx`, export `viewport` with `viewportFit: "cover"` and a theme colour.
**Do not set `maximumScale` or `userScalable: false`** — blocking zoom is an accessibility
failure, and it isn't what makes an app feel native.

Add a `@theme` block to `globals.css` with a comment marking it as unpopulated. **Do not
invent a palette.** Per `AGENTS.md`, colour and type are design decisions — they get raised,
not generated. HeroUI's defaults are fine until `docs/DESIGN.md` exists.

Wrap the app in a centred column that is 390px wide at the design viewport and capped on
desktop. This is the container, not a layout system.

**Gate:** at 390px the page fills the viewport with no double scrollbar and no rubber-band
overscroll. At desktop width the content is a centred column, not stretched.

---

## 6. PWA

Use Next's `manifest` file convention — `src/app/manifest.ts` returning
`MetadataRoute.Manifest`. It's a route convention, not a component, so it doesn't conflict
with the client-component rule.

Required fields: `name`, `short_name`, `start_url`, `display: "standalone"`,
`background_color`, `theme_color`, and icons at 192px, 512px, and a 512px `maskable`.

Separately, in `layout.tsx`'s `metadata`, set `appleWebApp` and an `apple-touch-icon` at
180px. **iOS ignores the manifest's icons** — without this you get a screenshot of the page
as the home screen icon, which looks broken in exactly the moment you're being judged.

Add a **minimal service worker** — Chrome's install criteria want one with a fetch handler.

> **No caching strategy. Deliberately.** A caching service worker during active development
> will serve you a stale bundle and cost an hour finding out why. The service worker exists
> to satisfy installability and nothing else. Offline support is a decision for later, if
> ever.

**Gate:** Lighthouse's installability check passes, **and** the app installs to a real
iPhone home screen and opens with no URL bar. Desktop devtools emulation does not prove
this — use a phone.

---

## 7. Prove the skeleton

One throwaway second route. Navigate to it from the home page using `next/link`.

**Gate:** the route change is client-side — no white flash, no document reload. Both pages
carry `"use client"`. Both render at 390px.

---

## 8. Deploy

Connect the GitHub repo to Vercel and deploy `main`. Confirm preview deployments are
generated for branches — a broken `main` must never be the only thing you can demo.

**Gate:** the production URL loads, the HeroUI button is styled, client-side nav works, and
the app installs from that URL on a phone. `npm run build` passing locally is not evidence
that the deploy works.

---

## 9. Clone verification — Ameer, Windows

The single cheapest outstanding risk, and it gates trusting anything above. Everything in
§1–§8 was verified on macOS only.

Fresh clone into a new directory, then:

| Command | Expected | Actual exit code | Notes |
|---|---|---|---|
| `npm ci` | Clean install from lockfile | | |
| `npm run dev` | Serves; page renders styled | | |
| `npm run build` | Exit 0 | | |
| `npm run lint` | Exit 0 | | |
| `npx tsc --noEmit` | Exit 0 | | |

Also confirm: `package-lock.json` shows **no diff** after `npm ci`. Lockfile churn across
machines is a recurring problem in this repo's history and needs catching now, not during a
timed build.

Report anything Windows-specific — path separators, line endings, script syntax. If
`package.json` scripts contain shell syntax that doesn't run on Windows, fix them to be
cross-platform.

---

## 10. Deliberately not done

Absent on purpose. **Do not add these, and do not report them as failures.** Each is its own
task with its own decisions.

- Supabase — no client, no auth, no session middleware, no schema, no migrations
- Mapbox
- TanStack Query or any data-fetching library
- Any route handler under `src/app/api/`
- Any model provider or AI capability
- A test runner
- A colour palette, type scale, or `docs/DESIGN.md`
- Any masjid-related feature, screen, or type
- Offline caching

`docs/ARCHITECTURE.md` and `docs/DATABASE.md` are also not created here. They describe layers
that don't exist yet.

---

## 11. Report

Report in this shape. Observed values only.

**Versions installed** — Node, npm, next, react, react-dom, typescript, tailwindcss,
@heroui/react, @heroui/styles. From `package.json` and the lockfile, not from memory.

**Gates** — every gate in §1–§8, each marked pass or fail, with the command output that
proves it.

**Deviations** — anything you did differently from this document, and why. Including flags
`create-next-app` rejected, prompts it asked that aren't listed here, and any place this
document was simply wrong.

**Not done** — restate §10, plus anything you were unable to complete. Say "I could not
verify this" rather than implying success.

**Then generate `AGENTS.md` Part B** using the checklist in that file. Every line must
correspond to a file or command output you actually observed. Write "unverified" rather
than guessing.

---

*This file is authoritative until Part B of `AGENTS.md` is generated. After that, the repo
is authoritative and this file is history.*
