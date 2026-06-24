# Q-Cure

Zero-Wait Digital Triage & Real-Time Queue Orchestration.

Q-Cure replaces paper tokens with a fast receptionist workflow, a patient self-service kiosk, an instantly updating waiting-room display, and a doctor-facing live operations cockpit. The project is built for hackathon judging: it demonstrates real-time queue orchestration, actual wait-time estimation from consultation history, advanced emergency patient triage, and a polished SaaS-style product experience.

## Problem Statement

Most neighbourhood clinics still rely on verbal updates and paper tokens. That creates avoidable friction:

- Patients do not know how many people are ahead of them.
- Receptionists manually maintain the queue.
- Doctors lack a live view of the clinic flow.
- Wait-time expectations are inconsistent and often guessed.
- Emergency cases disrupt the entire manual queue.

Q-Cure digitizes the full loop with Supabase-backed queue operations, realtime subscriptions, and a frontend that stays synchronized without refreshes or polling.

## Core Features & What the Demo Shows

- **Reception Dashboard**: Register a patient in a single action and generate sequential tokens like `T001`, `T002`, `T003`.
- **Patient Self-Check-in Kiosk**: A dedicated `/kiosk` page optimized for tablets where patients can register themselves.
- **Kiosk QR Code Generator**: Receptionists can instantly display a QR code for patients to scan and join the queue from their smartphones.
- **Emergency / Priority Triage**: Mark urgent patients as "Priority" to automatically bypass the standard queue and jump to the front of the line. Priority patients are visually highlighted across all dashboards with a red badge.
- **Waiting Room Display**: An instantly updating screen optimized for TVs that displays the currently serving token, live wait times, and the upcoming queue.
- **Doctor Cockpit**: A focused operational view for doctors to see who is next, mark consultations as complete, and track overall queue health and clinic efficiency.
- **Smart Wait Time Estimation**: Calculates estimated wait times using real completed consultation durations when history exists, falling back to a configurable clinic default when it does not.
- **RPC Modeled Operations**: Critical queue operations (like advancing the queue and recalculating times) are securely modeled as Postgres RPC functions instead of raw client-side mutations.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS, React Query, React Router
- **UI Primitives**: Custom components built with Radix UI and shadcn/ui principles
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Realtime**: Supabase Realtime with Postgres change events
- **Testing**: Vitest, Testing Library
- **Deployment**: Vercel for frontend, Supabase Cloud for backend

## Routes

- `/reception`: receptionist dashboard for registration, queue control, analytics, and settings
- `/waiting-room`: patient-facing realtime screen optimized for phone or TV display
- `/doctor`: live doctor cockpit with consultation and queue visibility
- `/kiosk`: a streamlined, full-screen patient self-registration portal

*Note: The project includes a `vercel.json` configuration file with a rewrite rule to ensure client-side SPA routing works correctly on Vercel without returning 404 errors.*

## Architecture

```mermaid
flowchart LR
  Reception["Reception UI"] --> Service["Queue Service"]
  Waiting["Waiting Room UI"] --> Service
  Doctor["Doctor UI"] --> Service
  Service --> Repo{"Repository"}
  Repo -->|Cloud mode| Supabase["Supabase RPC + Realtime"]
  Repo -->|Local demo mode| Demo["In-memory Demo Repository"]
  Supabase --> DB["PostgreSQL Tables + RPC Functions"]
  DB --> RT["Realtime Change Events"]
  RT --> Service
```

### Frontend architecture

- `pages/`: route-level experiences
- `components/`: UI building blocks and dashboard modules
- `hooks/`: data-loading and realtime synchronization hooks
- `services/`: queue service and repository abstraction
- `lib/`: environment and Supabase client setup
- `types/`: queue and database types
- `utils/`: formatting and queue derivation logic

### Backend architecture

- `supabase/migrations/001_init.sql`: tables, indexes, triggers, RLS, policies
- `supabase/migrations/002_rpc_functions.sql`: queue RPC functions and wait-time calculation
- `supabase/migrations/003_add_priority.sql`: priority and emergency queue overrides
- `supabase/seed.sql`: sample data for quick validation

## Folder Structure

```text
Q-Cure/
├─ src/
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  ├─ pages/
│  ├─ services/
│  ├─ styles/
│  ├─ test/
│  ├─ types/
│  └─ utils/
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ documentation/
├─ context.md
├─ thought-process.md
└─ realtime-flow.md
```

## Wait Time Logic

Q-Cure never hardcodes wait time.

1. Calculate the average from completed consultation durations.
2. If there is no history yet, use `clinic_settings.default_consultation_time`.
3. For each waiting patient, compute:

`estimated wait = patients ahead × average consultation duration`

This logic exists in both:

- frontend derivation utilities for demo mode and presentation
- SQL RPCs for live Supabase operation

## Realtime Architecture

- Clients subscribe to `patients`, `clinic_settings`, and `queue_events`
- Queue changes are triggered by RPC functions like `add_patient()` and `call_next_patient()`
- Supabase Realtime broadcasts Postgres change events
- React Query cache is updated immediately from subscription callbacks
- No polling or manual refresh is used

## Local Development

### Quick start

```bash
npm install
npm run dev
```

The app runs immediately after install. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured, Q-Cure automatically uses a built-in demo repository so the product still boots and behaves like a live queue.

### Environment variables

Create `.env` from `.env.example` when you want to connect to a real Supabase project:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

1. Create a new Supabase project.
2. Run `supabase/migrations/001_init.sql`.
3. Run `supabase/migrations/002_rpc_functions.sql`.
4. Run `supabase/migrations/003_add_priority.sql`.
5. Optionally run `supabase/seed.sql`.
6. Enable Realtime for `patients`, `clinic_settings`, and `queue_events`.
7. Add the project URL and anon key to `.env`.

## Security

- Row Level Security is enabled on all public tables.
- Public clients can read queue state.
- Mutating operations are intended to run through RPC functions.
- Input validation exists in both the frontend and SQL layer.
- Queue-critical operations lock tables to reduce race-condition risk across multiple receptionists and tabs.

### Rate limiting strategy

For production hardening, deploy the Supabase operations behind an authenticated receptionist/doctor role or an Edge Function gateway with:

- per-IP request throttling
- session-aware mutation limits
- audit logging for operator actions
- bot protection for public write surfaces

## Testing

Run:

```bash
npm test
```

Covered areas:

- wait-time calculation
- historical average fallback behavior
- token generation
- call-next queue progression
- realtime subscription behavior in the demo repository
- receptionist registration interaction

## Build

```bash
npm run build
```

## Deployment

Detailed deployment instructions live in [documentation/deployment.md](/E:/study/QueueCure/documentation/deployment.md).

## Screenshots

Suggested screenshots for a submission:

- Reception dashboard overview with queue metrics
- Add-patient flow showing instant token assignment
- Waiting-room display showing live current token
- Doctor dashboard showing current patient and queue status
- Self-check-in kiosk display with QR generator

## Future Scope

- WhatsApp or SMS queue notifications
- Multi-lingual patient kiosk views
- Doctor-specific consultation notes integration
- Appointment pre-booking and no-show handling
- Branch-level multi-clinic support
- Richer RBAC with Supabase Auth

## Documentation Map

- [thought-process.md](/E:/study/QueueCure/thought-process.md)
- [realtime-flow.md](/E:/study/QueueCure/realtime-flow.md)
- [documentation/deployment.md](/E:/study/QueueCure/documentation/deployment.md)
- [context.md](/E:/study/QueueCure/context.md)
