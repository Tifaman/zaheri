# ZaHeri

Voice-first, guided patient companion for Muhimbili National Hospital. A patient
scans a QR code at the ward and is guided in Swahili — by clear voice prompts and
a simple touch UI, **with no on-screen avatar** — through registration, triage,
seeing a doctor, and locating and collecting medicine. A real doctor reviews every
case; every non-emergency patient still sees a doctor in person, and emergency red
flags escalate to the EMD. The doctor may order lab tests and issues a verified
(QR-signed) pharmacy receipt, and a GPS locator finds the nearest pharmacy that has
the medicine in stock. ZaHeri sits on top of GoTHOMIS rather than replacing it.

## Architecture

- **Frontend** — React + TypeScript + Vite, Tailwind, vite-plugin-pwa, TanStack Query. Patient PWA (voice prompts + touch UI, SVG body diagram, GPS locator) + role-gated doctor console. No avatar.
- **Backend** — Node.js + TypeScript, NestJS, Socket.IO (real-time queue), BullMQ (jobs).
- **Database** — PostgreSQL via Prisma; Redis for cache, queues, real-time.
- **External (isolated at the edges)** — GoTHOMIS/FHIR (clinical source of truth), NHIF (insurance), PHARM.LINK (pharmacy stock/price, future), Maps (locator), TTS (voice), SMS/WhatsApp (notifications).

## Repository structure

```
apps/web    # React PWA: patient flow + doctor console
apps/api    # NestJS backend
packages/types  # shared DTO / API types
```

## Commands

```
pnpm install                              # install deps (workspace root)
pnpm dev:api                              # NestJS backend — http://localhost:3001
pnpm dev:web                              # Vite frontend — http://localhost:5173 (visit this one; proxies /api + /socket.io)
pnpm --filter api exec prisma migrate dev     # create + apply a migration (local/dev)
pnpm --filter api exec prisma migrate deploy  # apply existing migrations only (prod-safe, no new migration)
pnpm --filter api run seed                # idempotent seed script
pnpm build                                # build all workspaces
pnpm lint
pnpm typecheck
pnpm test
```

Local Postgres/Redis are optional — `apps/api/.env` can point at either the root
`docker-compose.yml` containers or hosted equivalents (Neon for Postgres, Redis
Cloud/Upstash for Redis). See `HOSTING.md` for production deployment (Verpex VPS).

## Conventions

- TypeScript **strict** across the monorepo. Share request/response types via `packages/types`.
- **No avatar.** Guidance is a clean, high-contrast, low-literacy-friendly touch UI plus Swahili voice prompts (pre-recorded fixed lines + TTS for variable content). Do not build an animated character.
- All database access goes through **Prisma**. Never build SQL by string interpolation. Migrations are versioned and committed.
- **Everyone sees a doctor.** There is no skip-the-doctor / prescription-only path. Non-emergency patients are always routed to an in-person doctor; red flags go to the EMD.
- Unit-test decision logic (red-flag, routing, receipt verification); e2e for intake and console. Keep the suite green.
- One feature per commit. Never force-push shared branches.

## Security and patient data

- Minimise stored PHI and location — GoTHOMIS is the source of truth; store orchestration/session state, not copies of clinical records.
- Encrypt sensitive fields at rest. Audit-log every clinician action and record access.
- **Analytics use anonymised, aggregated data only.**
- **Trust only verified receipts** — enforce signature verification and single use; never honour an unsigned or reused receipt.
- Never commit secrets; keep `.env.example` current. Assume in-region (Tanzania) hosting for the Personal Data Protection Act (2022).

## Guardrails

- **Do not invent clinical logic or regulatory decisions.** The red-flag list comes from a Muhimbili EMD clinician; leave a `TODO` where clinician or legal sign-off is needed.
- **Isolate external systems.** GoTHOMIS (`IHospitalGateway`), NHIF, and PHARM.LINK (`PharmacyStockProvider`) all sit behind interfaces, mocked until real credentials exist. Only the hospital-pharmacy provider exists now; PHARM.LINK is a future provider registered later without changing the locator.
- **Stop at the unknowns.** Missing field mapping, credential, or clinical rule → marked `TODO` and continue against the mock.
- **Ask before destructive actions** — dropping tables, deleting data, or any irreversible operation.

## Build order

Work one phase at a time. External systems are mocked until their credentials exist.

0. Foundations + guided intake (voice prompts + touch UI, body diagram)
1. Auth, doctor console, routing (everyone sees a doctor), red-flag
2. Digital queue + SMS/WhatsApp notifications
3. Labs + verified (QR-signed) pharmacy receipt
4. GPS pharmacy locator (hospital pharmacy first; PHARM.LINK pluggable)
5. NHIF eligibility, medication reminders, anonymised flow/surveillance analytics
