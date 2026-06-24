# QueueCure Thought Process

## Architecture Decisions

QueueCure uses a repository boundary between the UI and data source so the frontend never contains raw database logic. The active repository is chosen at runtime:

- `supabaseQueueRepository` for real cloud operation
- `mockQueueRepository` for zero-friction local development and judging demos

This preserves the Supabase-first architecture while ensuring `npm install` and `npm run dev` work immediately in a fresh environment.

## Why Supabase

- PostgreSQL gives durable queue state and transactional consistency.
- RPC functions let the queue-critical logic live close to the data.
- Realtime channels eliminate the need for a custom websocket layer.
- RLS and policies provide a strong default security posture.
- Supabase is fast to set up in a hackathon without sacrificing production credibility.

## Realtime Strategy

The frontend subscribes to:

- `patients`
- `clinic_settings`
- `queue_events`

Whenever a write occurs, Supabase emits Postgres change events. Clients receive the event, reload the authoritative snapshot, and hydrate React Query. This keeps the implementation simple, resilient to reconnection, and easy to explain during judging.

## Wait-Time Strategy

The product goal explicitly forbids hardcoded wait times, so the system calculates wait from actual consultation history.

- If there are completed consultations, use their average duration.
- If there are no completed consultations yet, use the clinic-configured default duration.
- Estimated wait is proportional to the number of patients ahead.

This gives a credible operational story without requiring ML or over-engineering.

## Concurrency Handling

The riskiest flows are:

- simultaneous patient registration
- two receptionists clicking call-next
- multiple tabs trying to advance the queue

To keep queue order consistent:

- token creation is centralized in `add_patient()`
- queue advancement is centralized in `call_next_patient()`
- completion is centralized in `complete_consultation()`
- the SQL functions lock queue tables before mutating state

This is intentionally conservative for a single-clinic MVP. Table-level locking is acceptable at hackathon scale and very easy to reason about when demoing race-condition prevention.

## Tradeoffs

### Chosen

- Single-clinic model over multi-tenant complexity
- Table locking over more granular optimistic concurrency
- Snapshot reload on realtime events over event-diff reconciliation
- Demo repository fallback over requiring a preconfigured Supabase project to boot locally

### Deferred

- authenticated operator roles
- multi-doctor queue partitioning
- appointment scheduling
- durable offline mutation queues
- patient identity matching across repeat visits

## Scalability Approach

For the MVP, one clinic uses a single ordered queue. If the product expands:

- add `clinic_id` to all queue tables
- partition queue data per clinic
- introduce role-aware access with Supabase Auth
- move public mutations behind Edge Functions
- add operational analytics materialized views

The current architecture already supports these changes without major frontend rewrites because the repository and service layers isolate the data source.

## Performance Considerations

- React Query prevents redundant fetch churn and simplifies cache updates.
- Realtime subscriptions update a single `queue-snapshot` cache key.
- The UI derives queue rows in-memory for responsive rendering.
- The waiting-room layout is intentionally lightweight and TV-friendly.
- The code avoids unnecessary memoization complexity and keeps most logic in pure helpers.

## Hackathon Judge Mapping

### Problem clarity

The app directly solves the paper-token problem with three distinct operator and patient views.

### Technical depth

- PostgreSQL schema
- SQL RPC functions
- RLS and policies
- realtime subscriptions
- testing
- deployment documentation

### UX quality

The interface feels like a modern clinic operations product rather than a generic admin panel:

- strong typography
- clean glass-panel cards
- visible queue health
- TV-friendly waiting-room presentation

### Demo readiness

- boots locally without extra coding
- includes seed/demo data
- includes Supabase migrations
- includes documentation for architecture and deployment
