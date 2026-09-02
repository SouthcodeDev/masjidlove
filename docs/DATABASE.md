# DATABASE.md

The database rules, the migration workflow, and the RLS pattern every table copies.

> **There is no schema yet.** No `supabase/` directory, no migrations, no tables, no
> `@supabase/supabase-js` dependency. Verified at the time of writing — re-verify with
> `STATUS.md` Phase 3 rather than trusting this line.
>
> So this file is **the pattern to follow**, not a description of a live database. Nothing
> below has been applied. Where it says "the `profiles` table", read "the `profiles` table
> that the first migration will create".

---

## 1. Non-negotiables

From `AGENTS.md` Part A → Database. Restated because these are the ones that get bent:

1. **RLS is mandatory on every table, from its first migration.** A table without policies
   is a bug, not a TODO. `ENABLE ROW LEVEL SECURITY` with no policy denies everything — that
   is a safe default but still incomplete; ship the policies with the table.
2. **All schema changes go through migration files in git.** Never DDL through the Supabase
   dashboard, never through a write-enabled MCP connection, never `db push` against a schema
   an agent wrote unreviewed.
3. **Never edit an applied migration.** Add a new one. An edited migration means two
   databases with the same migration name and different contents — the worst kind of drift.
4. **A human applies migrations.** Agents write and review them; a person runs the command.
5. **Never weaken a policy to make a feature work.** If RLS blocks a legitimate flow, the
   policy needs changing deliberately, as its own reviewed migration.
6. **Prefer the live schema over this file.** Inspect via Supabase MCP (read-only). Docs rot;
   the database doesn't lie.

---

## 2. Setup, before any of this works

Not done yet. In order:

```bash
npm i supabase --save-dev      # CLI as a dev dependency, not global
npx supabase init              # creates supabase/config.toml
npx supabase link              # interactive: needs the project ref + login
```

Local Docker is deliberately skipped for now — two developers sharing one cloud dev database
is fine at this stage. That means **there is no safety net**: a bad migration hits the
database both developers are using. Review before applying, and never apply from an
unreviewed agent diff.

---

## 3. Migration workflow

```bash
# 1. create
npx supabase migration new add_profiles

# 2. write the SQL by hand in supabase/migrations/<timestamp>_add_profiles.sql

# 3. review — a human reads the whole file

# 4. apply (HUMAN ONLY)
npx supabase db push

# 5. verify no drift — every migration in BOTH Local and Remote
npx supabase migration list
```

**Agents must not run step 4**, or `db reset`, or `db remote commit`. `STATUS.md` §0 makes
this a standing instruction. Read-only inspection is fine.

`migration list` is the drift detector. Asymmetry means:

- **Local but not Remote** → never applied.
- **Remote but not Local** → someone changed the schema out-of-band. This is the exact
  failure the read-only-MCP rule exists to prevent. Treat it as a real incident: find what
  changed, write the migration that represents it, reconcile.

---

## 4. Conventions

- `snake_case` for tables and columns. Plural table names (`masjids`, `events`).
- Primary keys: `id uuid primary key default gen_random_uuid()`.
- Timestamps: `created_at timestamptz not null default now()`. Add `updated_at` only with a
  trigger to maintain it — a column that silently goes stale is worse than no column.
- Foreign keys always carry an explicit `on delete` action. Decide deliberately between
  `cascade` and `restrict`; don't take the default by accident.
- Money, if it ever appears: integer minor units. Never floating point.
- Index every foreign key and every column you filter or sort by. PostGIS columns get a GIST
  index (§6).
- Enums: prefer a `text` column with a `check` constraint over a Postgres `enum` type —
  adding a value to an `enum` in a migration is awkward, changing a `check` is trivial.

---

## 5. The RLS pattern

The template every table copies. `profiles` is the first migration and sets the shape, so it
matters that it's right.

```sql
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read: any signed-in user may read any profile.
-- Tighten this if profiles should not be publicly readable — decide, don't default.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Write: a user may only ever touch their own row.
create policy "users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

Points worth internalising:

- **`using` gates which existing rows are visible/affected; `with check` gates the values
  being written.** An `update` policy needs both, or a user can update their own row into
  someone else's `id`.
- **Always name the role** (`to authenticated`). A policy without it also applies to `anon`.
- **`for all` is a trap.** Write separate `select` / `insert` / `update` / `delete` policies.
  It's more lines and far easier to reason about — and reading is almost never the same
  condition as writing.
- **Test as a real user, not with the service-role key.** The service role bypasses RLS
  entirely, so a service-role test proves nothing about your policies.

### The auth trigger

Supabase writes to `auth.users`; a matching `public.profiles` row needs creating. Standard
approach:

```sql
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

`security definer` is required (the inserting role can't write `public.profiles`), and
`set search_path = ''` is required with it — a `security definer` function without a pinned
`search_path` is a privilege-escalation vector. Fully qualify every name inside such a
function.

---

## 6. PostGIS

Enable in a migration, not the dashboard:

```sql
create extension if not exists postgis;
```

Store geography, not two float columns:

```sql
alter table public.masjids
  add column location geography(point, 4326) not null;

create index masjids_location_idx
  on public.masjids using gist (location);
```

`geography` over `geometry` for real-world lat/lon: distances come back in **metres** and
account for the earth's curvature without you choosing a projection. SRID 4326 is GPS
lat/lon.

Nearby queries belong in the database. Note the argument order — **longitude first**:

```sql
select id, name,
       st_distance(location, st_makepoint($1, $2)::geography) as metres
from public.masjids
where st_dwithin(location, st_makepoint($1, $2)::geography, $3)
order by metres
limit 50;
```

`st_dwithin` uses the GIST index; a bare `st_distance(...) < x` in `WHERE` does not. Do not
fetch a wide set and filter by distance in JavaScript — `AGENTS.md` Part A forbids it, and it
gets slow immediately.

Expose these through a Postgres function (`rpc`) rather than assembling PostGIS SQL in the
client:

```sql
create function public.masjids_nearby(lat float, lon float, radius_m float)
returns setof public.masjids
language sql stable
as $$
  select * from public.masjids
  where st_dwithin(location, st_makepoint(lon, lat)::geography, radius_m)
  order by location <-> st_makepoint(lon, lat)::geography;
$$;
```

**RLS applies to the table the function reads**, provided the function is not
`security definer`. Keep nearby-search functions `stable`/`invoker`, not `security definer` —
otherwise you've built an RLS bypass.

---

## 7. Types in the app

Once schema exists, generate types instead of hand-writing them:

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

Regenerate after every applied migration and commit the result, so a stale type is a visible
diff rather than a silent lie. Domain types in `src/types/` may narrow or compose generated
rows; they should not contradict them.

---

## 8. The domain model is an open product decision

`AGENTS.md` Part A §2 names the entities to model cleanly — **events, places, memberships** —
because the patterns must carry over to the wider Places³ engine. It does not specify their
columns, and neither does this file.

The first migration (`profiles` + auth trigger + RLS) is generic enough to write now. Beyond
that, these are **product decisions that must be made by a human before the schema is
written** — an agent must not settle them by picking a shape:

- Does a masjid have owners/admins, and how does someone claim one? (`memberships` shape)
- Where do prayer times come from — calculated, an external API, or entered by a masjid
  admin? This decides whether they are a table, a cache, or a computed value, and it is the
  single biggest schema fork.
- Who may create an event: any user, or only a masjid admin?
- Are events always attached to a masjid, or can they be free-standing? (Determines whether
  `events.masjid_id` is nullable, which is hard to change later.)
- What does "join event" record — a row per attendee, capacity limits, waitlists?
- Is a masjid's existence public before it's verified?

`AGENTS.md` Part A also separates **visibility of a record** from **visibility of a person's
participation in it**. Those are two different policies; don't collapse them into one.

Open questions and current thinking live in `STATUS.md`, not here. This file documents what
is decided.

---

*If this file disagrees with the live schema, the schema wins. Say so and fix the file.*
