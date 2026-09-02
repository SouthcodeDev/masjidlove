# SETUP_STATUS.md — MasjidLuv / Places³ Engine

> **Project:** MasjidLuv (laboratory build for the Places³ engine)
> **Team:** Hishaam (macOS / iPhone) · Ameer (Windows / Android)
> **Last updated by a human:** _(set date when you edit this file)_
> **Last verified by an agent:** 2026-09-02 — Phases 0/2/4 findings fixed, see §11.

---

## 0. Instructions for the AI agent reading this file

You are being asked to **verify** the state of this repository against the expected
state described below, then report. Follow these rules:

1. **Report, do not fix.** Run the checks, record PASS / FAIL / SKIP, and produce the
   report in §8. Do not repair anything unless a human explicitly asks you to after
   reading the report.
2. **Never write to the database.** Do not run `supabase db push`, `db reset`,
   `db remote commit`, or any migration-applying command. Read-only inspection only.
3. **Never print secret values.** If a check requires looking at `.env`, report only
   whether a key is *present* and correctly *prefixed* — never its value.
4. **Do not propose alternative technologies.** The stack in §1 is locked. If you think
   something is a bad choice, note it in §8 under "Observations" and move on.
5. **Treat a missing item as expected, not broken.** §3 lists what is deliberately not
   done yet. Only flag things §2 claims are complete.
6. If a command fails because a tool is not installed, mark it **SKIP** with the reason
   rather than guessing at the answer.
7. **Check §11 before reporting a finding.** Known-resolved issues are recorded there so
   you do not rediscover them every run.

---

## 1. Locked decisions (do not re-litigate)

| Layer | Choice |
|---|---|
| Framework | Expo + React Native + TypeScript + Expo Router |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, RLS) |
| Geo | PostGIS |
| Maps | Mapbox *(still to be validated on web — see §3)* |
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

---

## 2. What we believe is already done

These are the claims to verify. If a check contradicts one of these, that is a real
finding.

- [x] GitHub repo created, both developers have access
- [x] Supabase cloud project created, both developers added
- [x] Expo project scaffolded in this repo (SDK 57, router in `src/app/`)
- [x] Expo, Vercel, Mapbox, OpenRouter accounts created
- [x] OpenRouter organisation created, shared credit pool funded (~$10)
- [x] Per-key spend limits set; Auto Top-Up confirmed OFF
- [x] OpenCode installed on both machines, OpenRouter connected
- [x] OpenCode VS Code extension installed
- [x] `AGENTS.md` exists — **minimal**, points at the SDK 57 versioned docs. Still needs
      the four rules named in §7.5.
- [x] TypeScript `strict` is on
- [x] `.env.example` committed (placeholders only); bare `.env` is gitignored
- [x] `tsc --noEmit` passes on a **fresh clone**, via committed `types/expo.d.ts` (see §11.1)
- [x] `npm run typecheck` exists as the finishing-gate command
- [x] Editor pinned to the workspace TypeScript (`.vscode/settings.json`)

---

## 3. Deliberately not done yet (do NOT flag as failures)

- [ ] The `docs/` set (`AGENTS.md` exists but is minimal — see §2)
- [ ] Supabase CLI installed as a dev dependency and project linked
- [ ] First migration (profiles + auth + RLS)
- [ ] Supabase MCP wired into OpenCode
- [ ] Mapbox rendering validated on iOS / Android / web
- [ ] TanStack Query installed
- [ ] Vercel project connected and a preview deploy green
- [ ] Any Edge Function (`enrich-event` is planned, not built)
- [ ] EAS development builds
- [ ] Push notifications, background location, payments, ticketing
- [ ] A `services/` layer (`src/` currently has `app`, `components`, `constants`, `hooks`)

---

## 4. Verification protocol

Run these in order from the repository root. Record the result of each.

> **Note on `grep`:** Hishaam's machine resolves `grep` to **ugrep**, not BSD/GNU grep.
> ugrep rejects some regex constructs GNU grep accepts (e.g. empty alternations like
> `=(|foo)`). If a pattern below errors on one machine but not the other, that is the
> cause — not a failed check.

### Phase 0 — Git hygiene and secret safety

**This phase is the most important. A leaked key is the only failure here that cannot be
undone by editing a file.**

```bash
# 0.1 — working tree state
git status --short
git branch --show-current

# 0.2 — is .env ignored?
grep -nE '^\.env' .gitignore

# 0.3 — is .env currently tracked? (this command SHOULD fail)
git ls-files --error-unmatch .env

# 0.4 — secret scan across all history, excluding files that legitimately
#       DOCUMENT the variable names (see 0.6, which closes this exclusion)
git log -p --all -- . ':(exclude).env.example' ':(exclude)SETUP_STATUS.md' \
  | grep -inE 'sk-or-v1-|service_role|SUPABASE_SERVICE_ROLE|sb_secret_' | head -20

# 0.5 — secret scan of the working tree, excluding deps and the same two docs
grep -rInE 'sk-or-v1-|service_role|sb_secret_' . \
  --exclude-dir=node_modules --exclude-dir=.git \
  --exclude=SETUP_STATUS.md --exclude=.env.example | head -20

# 0.6 — .env.example must contain ONLY placeholders.
#       This is what earns the right to exclude it from 0.4 and 0.5.
grep -vE '^\s*#|^\s*$' .env.example | grep -vE '=($|.*your-)'
```

| Check | PASS criteria |
|---|---|
| 0.2 | `.gitignore` ignores a **bare** `.env`, not just `.env*.local`. Verify with `git check-ignore -q .env` (exit 0) — but note `check-ignore` also exits 0 on a **negation** match, so confirm re-inclusion of `.env.example` with `git status`, not `check-ignore` |
| 0.3 | Command errors with "did not match any file" — meaning `.env` is untracked |
| 0.4 | **No output.** Any hit is a CRITICAL finding — report immediately and stop the phase |
| 0.5 | No output |
| 0.6 | **No output.** Any line printed is a real value sitting in a committed template |

> If 0.4 returns anything, the correct human action is to **rotate that key immediately**
> at its source (OpenRouter / Supabase), not to rewrite git history first. Report this at
> the very top of §8.

### Phase 1 — Toolchain

```bash
node -v          # expect v20+ ; v22+ preferred (Supabase CLI via npx wants 20+)
npm -v
git --version
npx expo-doctor  # aggregate health check — read its output carefully
```

`expo-doctor` is the highest-value single check here. Report each of its warnings
verbatim rather than summarising, since dependency-version mismatches are the most common
cause of "works on my machine".

### Phase 2 — Expo project shape

```bash
# 2.1 — required dependencies present
cat package.json

# 2.2 — router structure. NOTE: this project uses the src/ convention.
ls -la src/app/ 2>/dev/null || echo "NO src/app/ DIRECTORY"
ls src/app/_layout.* 2>/dev/null || echo "NO ROOT LAYOUT"

# 2.3 — TypeScript config
cat tsconfig.json

# 2.4 — does it actually typecheck?
npm run typecheck
```

| Check | PASS criteria |
|---|---|
| 2.1 | `dependencies` includes `expo`, `expo-router`, `react-native`, `react`; `devDependencies` includes `typescript` and `@types/react` |
| 2.2 | `src/app/` exists and contains a root `_layout.tsx`. **Not `app/`** — checking `app/` yields a false FAIL |
| 2.3 | Extends `expo/tsconfig.base.json`; `compilerOptions.strict` is `true` |
| 2.4 | Exits 0 with no output |

### Phase 3 — Supabase wiring

```bash
# 3.1 — CLI installed as a dev dependency (not global)
grep -n '"supabase"' package.json

# 3.2 — project initialised
ls -la supabase/ 2>/dev/null || echo "NOT INITIALISED"
ls supabase/migrations/ 2>/dev/null

# 3.3 — local vs remote migration drift (READ ONLY)
npx supabase migration list
```

| Check | PASS criteria |
|---|---|
| 3.1 | `supabase` appears under `devDependencies` |
| 3.2 | `supabase/config.toml` exists |
| 3.3 | Every migration appears in **both** Local and Remote columns |

Check 3.3 is the drift detector. A migration present locally but not remotely means it
was never applied; present remotely but not locally means **someone made a change through
the dashboard or a write-enabled MCP connection**, which is the exact failure mode the
read-only MCP rule exists to prevent. Either asymmetry is a real finding.

If the CLI is not installed or the project is not linked, mark this phase SKIP — that is
expected per §3.

### Phase 4 — Environment variables

```bash
# 4.1 — template exists
cat .env.example 2>/dev/null || echo "NO .env.example"

# 4.2 — local env exists (do NOT print values)
test -f .env && echo ".env present" || echo ".env MISSING"

# 4.3 — CRITICAL: no secret is publicly prefixed
grep -nE '^EXPO_PUBLIC_.*(SERVICE_ROLE|OPENROUTER|SECRET|PRIVATE)' .env.example .env 2>/dev/null
```

| Check | PASS criteria |
|---|---|
| 4.1 | `.env.example` exists and lists every variable the app needs |
| 4.3 | **No output.** Any hit is CRITICAL |

Why 4.3 matters: anything prefixed `EXPO_PUBLIC_` is compiled into the JavaScript bundle
and trivially extractable from a published web build. Only the Supabase URL, the anon
key, and the Mapbox public token belong there. `OPENROUTER_API_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` live **only** in Edge Function secrets, set via
`npx supabase secrets set`, and must never appear in a client-side variable.

### Phase 5 — Architecture scaffold

```bash
ls AGENTS.md 2>/dev/null || echo "AGENTS.md missing"
ls docs/ 2>/dev/null || echo "docs/ missing (expected per §3)"

# layering discipline — is there a services layer, or are components querying directly?
grep -rIn "@supabase/supabase-js" src --include='*.ts' --include='*.tsx' 2>/dev/null
grep -rIn "supabase\.from(" src --include='*.tsx' 2>/dev/null
```

> Quote the `--include` globs. Unquoted, zsh expands them itself and the command dies
> with `no matches found`.

The second grep is the one that matters over time. **A `supabase.from(` call inside a
`.tsx` component file is an architecture violation** — data access belongs in
`services/`, exposed to components through `hooks/`. Right now the answer is "no results,
nothing built yet"; re-run this check regularly once the agent starts producing features,
because this is precisely the drift that §7.6 of the master context warns about.

### Phase 6 — Web deploy readiness

```bash
grep -nE '"(build|export)".*expo export' package.json
ls vercel.json 2>/dev/null
```

Expo web is not a default Vercel framework preset. The build command needs to be
`npx expo export -p web` with output directory `dist`. Mark SKIP if Vercel isn't
connected yet — expected per §3.

---

## 5. Cross-machine parity check

Run on **both** machines and compare. Divergence here explains most "it works for me"
arguments.

```bash
node -v
npm -v
npx expo --version
git rev-parse --short HEAD
npm run typecheck && echo "TYPECHECK OK"
git status --short   # should be clean; see §11.2 on package-lock churn
```

Ameer additionally: confirm the repo lives in the **same filesystem as the shell running
Metro** — either all inside WSL (`~/code/...`) or all on Windows (`C:\...`), never a
Windows shell reaching into `\\wsl$\`. Mixed setups produce slow file watching and
mismatched native binaries.

---

## 6. The definition of "Phase 1 complete"

Not "we installed Expo." Not "the homepage looks nice." This:

```
LOGIN → MAP → MOSQUE → PRAYER TIMES → EVENT → JOIN EVENT
```

Both phones, running the same codebase, against the same Supabase project, completing
that entire flow — and a change made on one device visible on the other.

---

## 7. Next steps, in order

Do not skip ahead. Each step assumes the previous one passed.

Steps previously numbered 1–3 (fix CRITICAL Phase 0/4 findings, resolve `expo-doctor`
warnings, turn on `strict`) are **done** — see §2 and §11.

1. **Install the Supabase CLI as a dev dependency and link the project**
   (`npm i supabase --save-dev`, `npx supabase init`, `npx supabase link`).
   Skip local Docker for now — two people sharing one dev database is fine at this stage.
   This unblocks the Phase 3 drift detector, currently the only defence against
   dashboard DDL.
2. **Write the first migration by hand:** `profiles`, auth trigger, and RLS policies.
   Do this manually rather than with an agent. It becomes the pattern every later table
   is copied from, so the shape needs to be right.
3. **Expand `AGENTS.md` and write the `docs/` set** *before* letting the agent build
   features. Minimum content for `AGENTS.md`: the layering rule, the
   migrations-not-live-DDL rule, the RLS-mandatory rule, and the finishing gate
   (`npm run typecheck && npm run lint`, then report files changed).
4. **Wire Supabase MCP into OpenCode**, `read_only=true`.
5. **Install TanStack Query** and establish the fetching pattern once, deliberately.
6. **Timebox a Mapbox spike** — markers, clustering, geolocation, reverse geocoding, on
   iOS *and* Android *and* web. This is the riskiest remaining hypothesis in the stack.
7. **Get a Vercel preview deploy green** before building features. A demo that must run
   on a live URL should not have an untested deploy path.
8. **Then** start the vertical slice in §6.

---

## 8. Report template

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

## Contradictions with §2
<Anything SETUP_STATUS.md claims is done that is not actually done.>

## expo-doctor output
<Verbatim.>

## Observations
<Anything you noticed that isn't covered by a check — including disagreements with
the locked stack. Brief.>

## Recommended next action
<A single step from §7. One, not a list.>
```

---

## 9. Out of scope — do not add

Flag it as a finding if any of these appear in the repo:

Redis · Firebase · Prisma · MongoDB · Kafka · Kubernetes · a second backend · a second
auth system · a separate web framework · a state-management library beyond React state +
TanStack Query · background location · geofencing · payment or ticketing infrastructure ·
an elaborate analytics stack · more than one test runner

> **Don't build complexity before the traffic requires it.**

---

## 10. Keeping this file honest

This file is a claim about reality, and claims rot. When a §3 item gets done, move it to
§2 and update the date at the top. When a check starts failing for a known reason, say so
in §11 rather than letting the agent rediscover it every run.

If §2 and the verification report disagree twice in a row, trust the report.

---

## 11. Known-resolved issues and standing quirks

### 11.1 `tsc` used to fail on a fresh clone — RESOLVED
Two errors (`Cannot find module './animated-icon.module.css'` and
`Cannot find module or type declarations for side-effect import of '@/global.css'`)
appeared on any clone where the dev server had never run.

Cause: the CSS-module declarations live in `node_modules/expo/types/global.d.ts`, which is
only pulled in by `expo-env.d.ts` — a file the Expo CLI generates on `expo start` and
which is **gitignored by design** (its own generated comment says
"should not be edited and should be in your git ignore").

Fix: committed `types/expo.d.ts` holding `/// <reference types="expo/types" />`.
tsconfig's `**/*.ts` include picks it up automatically. Do not "fix" this by committing
`expo-env.d.ts` — that fights the CLI, which rewrites and removes it.

### 11.2 `package-lock.json` churn between machines — STANDING
npm rewrites 12 `"libc": ["glibc"|"musl"]` fields on optional Linux binaries depending on
the npm version that ran the install. This produces a phantom diff that ping-pongs
between Hishaam and Ameer. It is not a dependency change. Agree on one npm version
before considering `"packageManager"` in `package.json` — Node 24 ships Corepack, so
pinning it changes install behaviour rather than merely documenting intent.

### 11.3 Editor vs CLI TypeScript disagreement — RESOLVED
VS Code reported `File 'expo/tsconfig.base' not found.` while `npx tsc --noEmit` exited 0.
The editor was using its own bundled TypeScript rather than the workspace's 6.0.3.
Fixed two ways: `tsconfig.json` now extends `expo/tsconfig.base.json` with the explicit
extension, and `.vscode/settings.json` pins `typescript.tsdk` to
`node_modules/typescript/lib`. After pulling this, run
**TypeScript: Restart TS Server** in the command palette.
