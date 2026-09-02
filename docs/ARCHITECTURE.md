# ARCHITECTURE.md

How code is organised in this repository, and how to add to it without breaking the shape.

`AGENTS.md` Part A states the *rules*. This file shows the *mechanics* — where files go, what
each layer may import, and a worked example of adding a feature end to end.

> **Status marker.** Sections tagged **[EXISTS]** describe code you can open today.
> Sections tagged **[PATTERN]** describe the shape the first implementation must take —
> nothing in the repo does this yet. Do not read a **[PATTERN]** section as a description of
> working code. Current build state lives in `STATUS.md`.

---

## 1. The layering rule

```
UI (src/app, src/components)
      ↓  may import
hooks (src/hooks)
      ↓  may import
services (src/services)
      ↓  may import
Supabase client (src/lib/supabase.ts)
```

Imports go **down only**. Concretely:

| Layer | May import | Must never |
|---|---|---|
| `src/app/*` (routes) | components, hooks, constants, types | the Supabase client, a service, raw SDKs |
| `src/components/*` | other components, hooks, constants, types | the Supabase client, a service |
| `src/hooks/*` | services, constants, types | the Supabase client directly |
| `src/services/*` | the Supabase client, types | React — no hooks, no JSX, no component imports |
| `src/lib/supabase.ts` | `@supabase/supabase-js`, env | anything in `app`/`components`/`hooks` |

Two consequences people get wrong:

- **A service is not allowed to be a hook.** No `useState`, no `useEffect`, no
  `useQuery` inside `src/services/`. Services are plain async functions that take arguments
  and return data or throw. That is what makes them testable and reusable from an Edge
  Function or a script.
- **A component is not allowed to know Supabase exists.** If a component imports anything
  Supabase-shaped, the layering is broken even if the call itself looks harmless.

### Why this specific shape

Data access concentrated in `services/` means an RLS change, a column rename, or a swap of
the query implementation touches one file per entity rather than every screen that displays
it. `hooks/` exists separately because caching, loading state and invalidation are *React*
concerns that shouldn't be baked into the query itself.

### The enforcement check

`STATUS.md` Phase 5 greps for this. The single most important line:

```bash
grep -rIn "supabase\.from(" src --include='*.tsx'
```

Any hit is an architecture violation. There is no acceptable exception — if a screen needs
data, it needs a hook, which needs a service.

---

## 2. Directory layout **[EXISTS]**

```
src/
  app/            Expo Router routes. THIS is the router root, not /app.
  components/     Presentational components.
    ui/           Low-level primitives (collapsible.tsx)
  constants/      theme.ts — design tokens
  hooks/          React hooks
  global.css      Web-only CSS custom properties (font stacks)
types/            Committed ambient TS declarations
docs/             This file and DATABASE.md
assets/           images/, expo.icon/
```

Directories that **do not exist yet** and should be created only when first genuinely needed
— by the task that needs them, announced explicitly:

```
src/services/     Data access. Created by the first feature that reads or writes.
src/lib/          Third-party client construction (supabase.ts, mapbox config).
src/types/        Domain model types (Masjid, Event, Profile, ...).
supabase/         CLI project: config.toml, migrations/, functions/.
```

Path aliases, from `tsconfig.json`: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.
Always use them. Relative imports across directories (`../../components/x`) are not the
house style — though note a few sibling imports inside `src/components/` do use `./x`, which
is fine within a directory.

---

## 3. Platform strategy **[EXISTS]**

Mobile is the primary product. Web is a secondary surface that must not be allowed to rot.

**For whole-module differences, use Expo's platform-extension resolution**, not runtime
branching. Metro picks the most specific file automatically:

```
app-tabs.tsx        ← native (iOS + Android)
app-tabs.web.tsx    ← web
```

Existing examples: `components/animated-icon`, `components/app-tabs`,
`hooks/use-color-scheme`. This is the mechanism Part A's "split the screen, not the logic"
rule expects.

**For single values, `Platform.select` is correct** — `constants/theme.ts` uses it for
`Fonts` and `BottomTabInset`. That is a value varying by platform, not logic forking.

**What not to do:** scatter `if (Platform.OS === 'web')` through a shared component to make
one file serve two very different UIs. If the branches are structural, split the file.

TypeScript note: `tsc` resolves the **non**-platform-suffixed file, so a `.web.tsx` variant
is only type-checked as its own module. Keep the exported signature identical across
variants or the platforms will silently diverge.

---

## 4. Theming **[EXISTS]**

Read tokens through the hook, not the constant:

```tsx
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const theme = useTheme();          // resolved Colors.light | Colors.dark
<View style={{ backgroundColor: theme.background, padding: Spacing.three }} />
```

Prefer `ThemedText` and `ThemedView` over raw `Text`/`View` — they wire up theme colour for
you. `ThemedText` carries the type scale (`title`, `subtitle`, `default`, `small`,
`smallBold`, `link`, `linkPrimary`, `code`).

Token inventory is in `AGENTS.md` §B.6. There is deliberately **no** brand palette, radius
scale, or elevation scale yet. Needing one is a design decision — raise it rather than
introducing hex literals.

Known inconsistency: `src/app/_layout.tsx` and `src/components/app-tabs.tsx` read
`useColorScheme()` from `react-native` and index `Colors` directly instead of calling
`useTheme()`. Don't copy that.

---

## 5. Data flow **[PATTERN]**

Nothing in the repo does this yet. This is the shape the first implementation must take.

**Layer 1 — the client** (`src/lib/supabase.ts`), constructed once:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);
```

Anon key only. The service-role key must never be reachable from app code — see
`AGENTS.md` Part A → Security.

**Layer 2 — a service** (`src/services/masjids.ts`), plain async, no React:

```ts
import { supabase } from '@/lib/supabase';
import type { Masjid } from '@/types/masjid';

export async function getMasjidById(id: string): Promise<Masjid> {
  const { data, error } = await supabase
    .from('masjids')
    .select('id, name, location, ...')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

Services own the column list and the error handling. Let errors throw — the hook layer
decides how to present them.

**Layer 3 — a hook** (`src/hooks/use-masjid.ts`), where React and caching live:

```ts
import { useQuery } from '@tanstack/react-query';
import { getMasjidById } from '@/services/masjids';

export function useMasjid(id: string) {
  return useQuery({
    queryKey: ['masjid', id],
    queryFn: () => getMasjidById(id),
  });
}
```

**Layer 4 — the screen**, which knows only the hook:

```tsx
const { data: masjid, isPending, error } = useMasjid(id);
```

TanStack Query is the committed cache and is **not yet installed**. Establish the query-key
convention deliberately the first time, in one place, rather than inventing keys per feature.

### Writes

Same direction. Service exposes `createEvent(input)`; the hook wraps it in a mutation and
invalidates the affected query keys. Components never call a service directly, even for a
write — the invalidation belongs with the mutation.

### Where filtering belongs

Distance, date windows, availability, sorting and pagination are **database** work. Do not
fetch a wide set and narrow it in JavaScript. Nearby queries are PostGIS — see
`docs/DATABASE.md`.

---

## 6. Maps **[PATTERN]**

No Mapbox dependency is installed. When it arrives:

- One shared map component in `src/components/` (plus a `.web.tsx` variant if the SDKs
  differ), and hooks beside it. **Screens never import a Mapbox SDK.**
- Style URLs, marker styling and camera defaults live in centralised config
  (`src/lib/mapbox.ts`), not inline in screens.
- **Billing is per request.** Memoise and debounce; never geocode on a keystroke or refetch
  tiles per render. Treat a wasted map request like a wasted model call.
- Radius/nearby queries go to PostGIS, not to a client-side distance filter.
- Not done until verified on iOS **and** Android **and** web. Web parity is not assumed —
  it is the riskiest unproven assumption in the stack.

---

## 7. AI features **[PATTERN]**

No Edge Function exists. The rules in `AGENTS.md` Part A → "AI features inside the product"
are binding when one is written. The two that most often get violated:

- **The app never calls a model provider directly.** The client calls an Edge Function; the
  Edge Function holds the key and calls the model.
- **Enrich on write, not on read**, and validate structured output against an explicit schema
  before it touches a table. Never write unvalidated model output.

Name functions for the capability (`enrich-event`), never the vendor or model.

---

## 8. Adding a feature — the walkthrough

For "show a masjid's detail page":

1. **Read `STATUS.md`** to confirm the prerequisites exist. If `src/services/` or the
   `masjids` table doesn't exist yet, that is setup work — say so rather than improvising it
   inside a feature.
2. **Types first** — `src/types/masjid.ts`, matching the actual schema. Prefer generated
   Supabase types over hand-written ones once the schema is real.
3. **Migration, if schema is needed** — a new file in `supabase/migrations/`, with RLS. Never
   live DDL. See `docs/DATABASE.md`. A human applies it.
4. **Service** — `src/services/masjids.ts`. Plain async. No React.
5. **Hook** — `src/hooks/use-masjid.ts`. Caching and invalidation.
6. **Route/screen** — `src/app/masjid/[id].tsx`. Consumes the hook, composes `ThemedText` /
   `ThemedView` and existing components. Reuse before creating; no `MasjidCardV2`.
7. **Finish per `AGENTS.md`**: `npm run typecheck`, `npm run lint`, exercise it on native
   **and** web if shared code changed, list files changed, and state what you did not do.

---

## 9. Conventions

- **kebab-case filenames**, `PascalCase` component exports, `camelCase` hooks
  (`themed-text.tsx` → `ThemedText`; `use-theme.ts` → `useTheme`).
- **Named exports** for components and hooks. `AppTabs` is a default export because Expo
  Router requires it for routes; follow the router's requirement, not its style.
- **Typed routes are on** (`app.json` → `experiments.typedRoutes`), so route strings are
  type-checked. Adding a route regenerates `.expo/types/router.d.ts` on the next dev-server
  run.
- **React Compiler is on.** Don't hand-add `useMemo`/`useCallback` for render-cost reasons;
  do still memoise things that cost *money or network* (map requests, geocoding).
- `.expo/`, `dist/`, `expo-env.d.ts` are generated. Never edit or commit them.

---

*If this file disagrees with the repo, the repo wins. Say so and fix the file.*
