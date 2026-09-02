# STATUS.md — MasjidLuv / Places³ Engine

> **Project:** MasjidLuv (laboratory build for the Places³ engine)
> **Team:** Hishaam (macOS / iPhone) · Ameer (Windows / Android)
> **Last updated by an agent:** 2026-09-02
> **Last updated by a human:** _(set date when you edit this file)_

**Where the project stands and what to do next.** For *how* to work in this repo — the rules,
the layering, the repo inventory — read `AGENTS.md` first. This file is the state of play.

| Read this | For |
|---|---|
| `AGENTS.md` | The rules, and a verified inventory of what's in the repo |
| `docs/ARCHITECTURE.md` | Where code goes, what each layer may import, worked example |
| `docs/DATABASE.md` | Migration workflow, the RLS pattern, PostGIS conventions |
| **`STATUS.md`** (this file) | **Current status, what's next, open decisions** |

---

## 0. Standing instructions for agents

1. **Never write to the database.** No `supabase db push`, `db reset`, `db remote commit`,
   or any migration-applying command. Read-only inspection only. A human applies migrations.
2. **Never print secret values.** Report whether a key is *present* and correctly *prefixed* —
   never its value.
3. **Do not propose alternative technologies.** The stack in §6 is locked. Disagreements go
   in the report's Observations, then you move on.
4. **When verifying (§8): report, do not fix.** Record PASS / FAIL / SKIP and produce the
   report in §10. Repair only when a human asks after reading it.
5. **Treat a §2 "not yet" item as expected, not broken.** Only flag things §1 claims are done.
6. **Check §11 before reporting a finding.** Known-resolved issues are recorded there so you
   don't rediscover them every run.
7. **If this file disagrees with the repo, the repo wins.** Say so and fix the file.

---

## 1. Technical status — what actually works

Verified 2026-09-02 at commit `ed3fd7a`.

### Foundation — done

- [x] GitHub repo, both developers have access. `master` in sync with `origin/master`.
- [x] Expo SDK 57 scaffold, Expo Router, router root at **`src/app/`** (not `app/`)
- [x] TypeScript `strict: true`; `npm run typecheck` → **exit 0**
- [x] `npm run lint` → **exit 0** (the scaffold's `set-state-in-effect` error is fixed)
- [x] `npx expo-doctor` → **21/21 pass**
- [x] `npx expo export -p web` → **succeeds**, static rendering, 4 routes, output `dist/`
- [x] Fresh clones typecheck without running the dev server first (`types/expo.d.ts`, §11.1)
- [x] Git hygiene: bare `.env` is gitignored, `.env.example` committed with placeholders only,
      no secrets anywhere in history or worktree
- [x] npm pinned to 11.19.1 via `"packageManager"`; lockfile deterministic (§11.2)
- [x] Editor pinned to workspace TypeScript (`.vscode/settings.json`, §11.3)
- [x] `AGENTS.md` complete — Part A rules + Part B verified repo inventory
- [x] `docs/ARCHITECTURE.md` and `docs/DATABASE.md` written
- [x] OpenRouter org, funded pool, per-key spend limits, Auto Top-Up OFF
- [x] OpenCode + VS Code extension on both machines

**Both quality gates are green on a clean tree.** That is the finishing gate in `AGENTS.md`,
so a failure from here is something you caused.

### Not started — no code in the repo

- [ ] **Supabase: nothing.** No CLI, no `supabase/`, no client, no link, no schema, no RLS.
      A cloud project exists outside the repo; the repo is not connected to it.
- [ ] **`src/services/`** — the layering rule has no destination yet
- [ ] **Mapbox** — no dependency, no spike, unproven on every platform
- [ ] **TanStack Query** — not installed, no fetching pattern established
- [ ] **Supabase MCP** in OpenCode (`read_only=true`)
- [ ] **Vercel** — no project connected. The *build* works locally (above); the deploy path
      is untested and there's no `vercel.json` or `build` script.
- [ ] **Edge Functions** — `enrich-event` is named in `AGENTS.md`, not built
- [ ] **EAS builds** — profiles exist in `eas.json`, no build ever run
- [ ] Push notifications, background location, payments, ticketing

### Known debt

- The app is **still the `create-expo-app` scaffold**. `src/app/index.tsx` and `explore.tsx`
  are template demo screens; `hint-row.tsx`, `web-badge.tsx` and the `expo-logo`/`react-logo`
  assets are template decoration. Nothing masjid-related exists.
- `README.md` is untouched boilerplate.
- No test runner, so "exercise the functionality" means running the app.
- `NativeTabs` comes from `expo-router/unstable-native-tabs` — explicitly unstable.
- `_layout.tsx` and `app-tabs.tsx` bypass `useTheme()`. Don't copy it.
- **Ameer's machine is unverified.** Nothing in §1 has been confirmed on Windows/Android.

---

## 2. Product status — what exists for a user

**Nothing.** No login, no map, no masjid, no prayer times, no events. A user can open the app
and see two Expo template screens.

This is worth stating plainly because the technical status above looks advanced by comparison.
The foundation is real; the product is at zero.

### The product, as scoped

A community app for masjids: find a masjid, see jamaat times, see what's actually happening
there, RSVP. It is the laboratory for a larger real-world discovery platform, so the
*patterns* matter as much as the features.

### Phase 1 — the definition of done

Not "we installed Expo". Not "the homepage looks nice". This:

```
LOGIN → MAP → MOSQUE → PRAYER TIMES → EVENT → JOIN EVENT
```

Both phones, same codebase, same Supabase project, completing that entire flow — and a change
made on one device visible on the other.

### Out of scope unless explicitly requested

Messaging · feeds · comments · reviews · gamification · ticketing · check-ins · streaks ·
badges.

---

## 3. Open product decisions — these block schema

**A human must settle these. An agent must not resolve them by choosing a schema shape.**
Nothing here is blocked on code; it's blocked on a decision. The first migration
(`profiles` + auth + RLS) is generic and can proceed without them.

| # | Decision | Why it can't wait |
|---|---|---|
| 1 | **Where do prayer times come from** — calculated from coordinates, an external API, or entered by a masjid admin? | The biggest schema fork. Decides whether times are a table, a cache, or computed. Changing it later rewrites the core read path. |
| 2 | **Can a masjid have admins, and how does someone claim one?** | Defines the `memberships` shape and most RLS policies. |
| 3 | **Who may create an event** — any user, or only a masjid admin? | Defines the `insert` policy on `events`. |
| 4 | **Are events always attached to a masjid, or can they stand alone?** | Decides whether `events.masjid_id` is nullable — painful to change once rows exist. |
| 5 | **What does "join event" record?** | Row per attendee is the minimum. Capacity and waitlists are separate features — confirm they're out of scope for Phase 1. |
| 6 | **Is a masjid public before it's verified?** | Determines whether `select` is open or gated, i.e. whether seeding unverified data is safe. |
| 7 | **Auth method** — email link, OTP, password, social? | Affects the `profiles` trigger and onboarding. Pick one for Phase 1. |

`AGENTS.md` Part A separates **visibility of a record** from **visibility of a person's
participation in it**. Keep those as two policies; don't collapse them.

Also unresolved and cheap to defer: the **specialist model** in §6 is TBD — benchmark before
committing. Not blocking.

---

## 4. Next steps, in order

Each step assumes the previous one passed. Setup items 1–3 from earlier revisions
(Phase 0/4 fixes, `expo-doctor` warnings, `strict` TypeScript) are **done** — see §1.

### Immediate — cheap, and unblocks others

1. **Ameer pulls and runs `npm ci && npm run typecheck && npm run lint`.**
   Highest value per minute on this list. Every claim in §1 is verified on macOS only. The
   `types/expo.d.ts` fix exists *specifically* so his fresh clone typechecks — and that has
   never been tested. Same run confirms his npm is 11.19.1 so the lockfile stops drifting.
   Also confirm his repo and Metro shell share one filesystem (all WSL, or all Windows —
   never a Windows shell reaching into `\\wsl$\`).

### The real work

2. **Supabase CLI + link.** `npm i supabase --save-dev`, `npx supabase init`,
   `npx supabase link`. Skip local Docker; one shared cloud dev DB is fine at this stage.
   Turns on the §8 Phase 3 drift detector — currently the only defence against dashboard DDL.
3. **First migration by hand:** `profiles`, auth trigger, RLS. **Human-written, not
   agent-generated** — it's the template every later table copies. The pattern is in
   `docs/DATABASE.md` §5.
4. **Settle §3 decisions 1–4**, then write the domain migration (masjids, events,
   memberships) against them.
5. **Wire Supabase MCP into OpenCode**, `read_only=true`.
6. **Install TanStack Query** and establish the query-key and invalidation pattern once,
   deliberately, in one place. `docs/ARCHITECTURE.md` §5 has the intended shape.
7. **Vercel preview deploy green.** The build already works locally, so this is mostly
   wiring: build command `npx expo export -p web`, output `dist`. Do it before features — a
   demo that must run on a live URL shouldn't have an untested deploy path.
8. **Then** the Phase 1 vertical slice (§2).

### Run in parallel, starting now

9. **Timebox the Mapbox spike.** Markers, clustering, geolocation, reverse geocoding — on iOS
   **and** Android **and** web.

   > **Deliberate reordering.** Earlier revisions had this sixth. It's moved up and marked
   > parallel because it is the only remaining item that can **invalidate a locked
   > decision**: if Mapbox doesn't hold up under React Native Web, the options are to change
   > the Maps choice or drop web as a surface, and both are architectural. It's independent
   > of all the Supabase work, so running it early costs no sequencing. Discovering this
   > after auth, schema, services and hooks are built against it is expensive; discovering it
   > this week is nearly free.

---

## 5. Definition of "Phase 1 complete"

See §2. Restated here because it's the thing to measure against:

```
LOGIN → MAP → MOSQUE → PRAYER TIMES → EVENT → JOIN EVENT
```

Both phones, one codebase, one Supabase project, cross-device visibility.

---

## 6. Locked decisions (do not re-litigate)

| Layer | Choice |
|---|---|
| Framework | Expo + React Native + TypeScript + Expo Router |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, RLS) |
| Geo | PostGIS |
| Maps | Mapbox *(unvalidated on web — see §4.9)* |
| Web hosting | Vercel (via `expo export -p web`) |
| Mobile (dev) | Expo Go; development builds later, EAS for real builds |
| Agent environment | OpenCode + VS Code extension |
| Model gateway | OpenRouter (organisation account, shared credit pool) |
| Worker model | `z-ai/glm-5.3-flash` |
| Specialist model | TBD — benchmark before committing |
| Client data cache | TanStack Query *(not yet installed)* |
| Server cache | **None. Redis is explicitly excluded.** |
| Architecture rule | `UI → hooks → services → Supabase` |
| Schema changes | Migration files in git, applied by a human via CLI. **Never live DDL.** |
| Package manager | npm, pinned to 11.19.1 in `package.json` |

---

## 7. Out of scope — do not add

Flag it as a finding if any of these appear in the repo:

Redis · Firebase · Prisma · MongoDB · Kafka · Kubernetes · a second backend · a second auth
system · a separate web framework · a state-management library beyond React state +
TanStack Query · background location · geofencing · payment or ticketing infrastructure ·
an elaborate analytics stack · more than one test runner

> **Don't build complexity before the traffic requires it.**

---

## 8. Verification protocol

Run from the repository root, in order. Record each result. Report per §10.

> **Note on `grep`:** Hishaam's machine resolves `grep` to **ugrep**, not BSD/GNU grep.
> ugrep rejects some regex constructs GNU grep accepts (e.g. empty alternations like
> `=(|foo)`). A pattern that errors on one machine but not the other is this, not a failure.

### Phase 0 — Git hygiene and secret safety

**The most important phase. A leaked key is the only failure here that can't be undone by
editing a file.**

```bash
# 0.1 — working tree state
git status --short
git branch --show-current

# 0.2 — is .env ignored?
grep -nE '^\.env' .gitignore

# 0.3 — is .env currently tracked? (this command SHOULD fail)
git ls-files --error-unmatch .env

# 0.4 — secret scan across all history, excluding files that legitimately
#       DOCUMENT the variable names (see 0.6, which closes this exclusion).
#       --format="" drops commit MESSAGES so prose about key names doesn't trip it;
#       diffs are still scanned. SETUP_STATUS.md is STATUS.md's pre-rename path and
#       must stay excluded to cover history.
git log -p --format="" --all -- . \
  ':(exclude).env.example' ':(exclude)STATUS.md' ':(exclude)SETUP_STATUS.md' ':(exclude)docs' \
  | grep -inE 'sk-or-v1-|service_role|SUPABASE_SERVICE_ROLE|sb_secret_' | head -20

# 0.5 — secret scan of the working tree, excluding deps and the same docs
grep -rInE 'sk-or-v1-|service_role|sb_secret_' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=docs \
  --exclude=STATUS.md --exclude=.env.example | head -20

# 0.6 — .env.example must contain ONLY placeholders.
#       This is what earns the right to exclude it from 0.4 and 0.5.
grep -vE '^\s*#|^\s*$' .env.example | grep -vE '=($|.*your-)'
```

| Check | PASS criteria |
|---|---|
| 0.2 | `.gitignore` ignores a **bare** `.env`, not just `.env*.local`. Confirm `.env.example` is still re-included using `git status`, **not** `git check-ignore` — the latter also exits 0 on a negation match |
| 0.3 | Errors with "did not match any file" — `.env` is untracked |
| 0.4 | **No output.** Any hit is CRITICAL — report immediately and stop the phase |
| 0.5 | No output |
| 0.6 | **No output.** Any line printed is a real value in a committed template |

> If 0.4 returns anything, the correct human action is to **rotate that key at its source**
> (OpenRouter / Supabase) immediately — not to rewrite git history first. Report it at the
> very top of §10.
>
> `docs/` is excluded from 0.4/0.5 because `docs/DATABASE.md` legitimately discusses
> `security definer` and the service-role key by name. If that ever stops being true,
> tighten the exclusion.
>
> **These exclusions are load-bearing and were each earned.** Without `--format=""` the
> check matches its own commit messages; without `':(exclude)SETUP_STATUS.md'` it matches
> this file's pre-rename history. Verified after the last change: 0.4 clean, and diffs are
> still scanned (a planted `sk-or-v1-`-shaped string is still caught). If you widen an
> exclusion, re-run that negative control — an exclusion that silently swallows real
> secrets is worse than a noisy check.

### Phase 1 — Toolchain

```bash
node -v          # v20+ ; v22+ preferred
npm -v           # expect 11.19.1 (pinned)
git --version
npx expo-doctor
```

`expo-doctor` is the highest-value single check. Report its warnings **verbatim** rather than
summarising — dependency-version mismatches are the most common cause of "works on my
machine".

### Phase 2 — Expo project shape

```bash
cat package.json

# router structure. NOTE: this project uses the src/ convention.
ls -la src/app/ 2>/dev/null || echo "NO src/app/ DIRECTORY"
ls src/app/_layout.* 2>/dev/null || echo "NO ROOT LAYOUT"

cat tsconfig.json

npm run typecheck
npm run lint
```

| Check | PASS criteria |
|---|---|
| 2.1 | `dependencies` has `expo`, `expo-router`, `react-native`, `react`; `devDependencies` has `typescript`, `@types/react`, `eslint` |
| 2.2 | `src/app/` exists with a root `_layout.tsx`. **Not `app/`** — checking `app/` yields a false FAIL |
| 2.3 | Extends `expo/tsconfig.base.json`; `compilerOptions.strict` is `true` |
| 2.4 | `typecheck` exits 0, no output |
| 2.5 | `lint` exits 0. On a fresh clone the **first** run bootstraps ESLint then fails — see §11.4 |

### Phase 3 — Supabase wiring

```bash
grep -n '"supabase"' package.json
ls -la supabase/ 2>/dev/null || echo "NOT INITIALISED"
ls supabase/migrations/ 2>/dev/null
npx supabase migration list      # READ ONLY
```

| Check | PASS criteria |
|---|---|
| 3.1 | `supabase` appears under `devDependencies` |
| 3.2 | `supabase/config.toml` exists |
| 3.3 | Every migration appears in **both** Local and Remote columns |

3.3 is the drift detector. Local-but-not-Remote means never applied. Remote-but-not-Local
means **someone changed the schema through the dashboard or a write-enabled MCP connection** —
the exact failure the read-only rule exists to prevent. Either asymmetry is a real finding.

**Currently SKIP** — the CLI isn't installed. Expected per §1.

### Phase 4 — Environment variables

```bash
cat .env.example 2>/dev/null || echo "NO .env.example"
test -f .env && echo ".env present" || echo ".env MISSING"

# CRITICAL: no secret is publicly prefixed
grep -nE '^EXPO_PUBLIC_.*(SERVICE_ROLE|OPENROUTER|SECRET|PRIVATE)' .env.example .env 2>/dev/null
```

| Check | PASS criteria |
|---|---|
| 4.1 | `.env.example` exists and lists every variable the app needs |
| 4.3 | **No output.** Any hit is CRITICAL |

Anything prefixed `EXPO_PUBLIC_` is compiled into the JS bundle and trivially extractable
from a published web build. Only the Supabase URL, the anon key and the Mapbox **public**
token belong there. `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` live **only** in
Edge Function secrets via `npx supabase secrets set`.

### Phase 5 — Architecture discipline

```bash
ls AGENTS.md docs/ARCHITECTURE.md docs/DATABASE.md 2>/dev/null

# layering: is there a services layer, or are components querying directly?
grep -rIn "@supabase/supabase-js" src --include='*.ts' --include='*.tsx' 2>/dev/null
grep -rIn "supabase\.from(" src --include='*.tsx' 2>/dev/null
```

> Quote the `--include` globs. Unquoted, zsh expands them and the command dies with
> `no matches found`.

The second grep is the one that matters over time. **A `supabase.from(` call in a `.tsx` file
is an architecture violation** — data access belongs in `services/`, reaching components
through `hooks/`. Today the answer is "no results, nothing built". Re-run it every time an
agent ships a feature; this is the drift that matters most.

### Phase 6 — Web deploy readiness

```bash
grep -nE '"(build|export)".*expo export' package.json
ls vercel.json 2>/dev/null
npx expo export -p web           # should succeed; writes dist/ (gitignored)
```

The export itself is **verified working** (§1). What's missing is the Vercel wiring: build
command `npx expo export -p web`, output directory `dist`. Expo web is not a default Vercel
framework preset. Mark the Vercel half SKIP until connected.

---

## 9. Cross-machine parity check

Run on **both** machines and compare. Divergence explains most "it works for me" arguments.

```bash
node -v
npm -v                      # must match: 11.19.1
npx expo --version
git rev-parse --short HEAD
npm run typecheck && echo "TYPECHECK OK"
npm run lint && echo "LINT OK"
git status --short          # should be clean
```

Ameer additionally: confirm the repo lives in the **same filesystem as the shell running
Metro** — all inside WSL (`~/code/...`) or all on Windows (`C:\...`), never a Windows shell
reaching into `\\wsl$\`. Mixed setups produce slow file watching and mismatched native
binaries.

**This has never been run on Ameer's machine.** See §4.1.

---

## 10. Report template

Produce the report in exactly this shape.

```markdown
# Setup Verification — <date>

## CRITICAL
<Secret exposure or env-prefix failures. "None" if clean. This section goes first
even if empty.>

## Results
| Phase | Check | Result | Detail |
|---|---|---|---|
| 0 | Git hygiene | PASS/FAIL | |
| 1 | Toolchain | | |
| 2 | Expo shape | | |
| 3 | Supabase | | |
| 4 | Env vars | | |
| 5 | Architecture | | |
| 6 | Deploy | | |

## Contradictions with §1
<Anything STATUS.md claims is done that is not actually done.>

## expo-doctor output
<Verbatim.>

## Observations
<Anything not covered by a check — including disagreements with the locked stack. Brief.>

## Recommended next action
<A single step from §4. One, not a list.>
```

---

## 11. Known-resolved issues and standing quirks

### 11.1 `tsc` used to fail on a fresh clone — RESOLVED
Two errors (`Cannot find module './animated-icon.module.css'` and `Cannot find module or type
declarations for side-effect import of '@/global.css'`) appeared on any clone where the dev
server had never run.

Cause: the CSS-module declarations live in `node_modules/expo/types/global.d.ts`, reachable
only via `expo-env.d.ts` — which the Expo CLI generates on `expo start` and **gitignores by
design** (its own generated comment says it "should not be edited and should be in your git
ignore").

Fix: committed `types/expo.d.ts` holding `/// <reference types="expo/types" />`; tsconfig's
`**/*.ts` include picks it up. Do **not** "fix" this by committing `expo-env.d.ts` — that
fights the CLI, which rewrites and removes it.

### 11.2 `package-lock.json` churn between machines — RESOLVED
npm rewrote 12 `"libc": ["glibc"|"musl"]` fields on optional Linux binaries depending on which
npm version ran the install, producing a phantom diff that ping-ponged between machines.

Fixed by standardising on **npm 11.19.1** and committing the lockfile it deterministically
produces (verified by a full `rm -rf node_modules && npm install` producing a byte-identical
file). `"packageManager": "npm@11.19.1"` records it.

Standing caveat: this is **documentation, not enforcement**. Corepack would enforce it but
couldn't be enabled — Node here is a system-wide install, not nvm-managed, so both
`npm install -g` and `corepack enable` need root on `/usr/local`. If a machine's npm drifts,
the churn returns. Worth revisiting if either machine moves to an nvm-managed Node.
npm 12.x requires Node ≥22.22.2/24.15.0 and the local Node is v24.14.0, so 11.19.1 is
currently the ceiling.

### 11.3 Editor vs CLI TypeScript disagreement — RESOLVED
VS Code reported `File 'expo/tsconfig.base' not found.` while `npx tsc --noEmit` exited 0.
The editor was using its bundled TypeScript rather than the workspace's 6.0.3.

Fixed two ways: `tsconfig.json` extends `expo/tsconfig.base.json` with the explicit extension,
and `.vscode/settings.json` pins `typescript.tsdk` to `node_modules/typescript/lib`. After
pulling, run **TypeScript: Restart TS Server** in the command palette.

### 11.4 `npm run lint` needs two runs on a fresh clone — STANDING
The first invocation installs `eslint` + `eslint-config-expo`, writes `eslint.config.js`, then
dies with `Cannot find module 'eslint'` — it can't resolve what it just installed in the same
process. Run it again and it works. That is Expo CLI behaviour, not a repo bug. Don't "fix"
it. (The deps and config are now committed, so this only bites a clone that predates them.)

### 11.5 The scaffold's lint error — RESOLVED
`src/hooks/use-color-scheme.web.ts` failed `react-hooks/set-state-in-effect`: it detected
hydration with `setState` inside a `useEffect`. Rewritten to use `useSyncExternalStore`
(`getServerSnapshot` → `false`, `getSnapshot` → `true`), which gives the same two-pass
behaviour without the cascading-render pattern. Verified: lint exit 0, typecheck exit 0, and
`expo export -p web` renders all four static routes.

---

## 12. Keeping this file honest

This file is a claim about reality, and claims rot.

- When a §1 "not started" item lands, move it up and update the date.
- When a check starts failing for a known reason, record it in §11 rather than letting the
  next agent rediscover it.
- When a §3 decision gets made, delete it from §3 and put the answer in `docs/DATABASE.md`.
- `AGENTS.md` Part B is the repo inventory; regenerate it when the repo drifts.

If §1 and a verification report disagree twice in a row, trust the report.
