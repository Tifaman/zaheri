# Changelog

All notable changes to ZaHeri are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2026-09-03

First release. Covers CLAUDE.md build order Phases 0–3, plus analytics from
Phase 5 (built early).

### Included

- **Guided patient intake** — voice-prompt + touch-UI flow, SVG body diagram,
  hospital selection.
- **Auth + doctor console** — role-gated login, case list and review UI.
- **Routing + red-flag engine** — every non-emergency patient routes to an
  in-person doctor; red flags escalate to the EMD. Red-flag list has clinician
  sign-off `TODO`s where noted in code — see `CLAUDE.md`'s Guardrails.
- **Digital queue** — real-time queue via Socket.IO/BullMQ, notification
  templates (SMS/WhatsApp-ready, provider not yet wired).
- **Labs + verified pharmacy receipts** — lab ordering, QR-signed receipts
  with signature verification and single-use enforcement.
- **Anonymised analytics** — flow/bottleneck dashboard, aggregated only.
- **Hospital gateway interface** (`IHospitalGateway`) — GoTHOMIS integration
  point, mocked until real credentials exist.

### Not yet included

- GPS pharmacy locator (Phase 4)
- PHARM.LINK stock/price provider (Phase 4, future)
- NHIF eligibility, medication reminders (Phase 5)
- Real GoTHOMIS/NHIF/SMS-WhatsApp credentials (all mocked behind interfaces)

### Infrastructure

- Database: PostgreSQL via Prisma, hosted on Neon.
- Redis: Redis Cloud (BullMQ + Socket.IO adapter).
- Deployment: Verpex VPS (Docker + Nginx) — see `HOSTING.md`.
