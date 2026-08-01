# Proof Layer (v6.1)

The layer that turns a well-architected concept into a **verifiable** system:
every claim sourced, every outcome measured, every recommendation human-approved.

## What's here — and its honest status

| Pillar | File | Status |
|---|---|---|
| 1. Reality Data Layer | `impact_measurement/outcome_tracking.sql` | 📄 **Schema of record** — targets the future PostgreSQL backend; not wired to the current static dashboard yet |
| 2. Human-in-the-Loop | `human_review/reviewer_workflow.yaml` | 📄 **Design of record** — the workflow engine that runs it isn't built |
| 3. Living Voice Engine v2 | `living_voice/tone_engine.js` | 🟡 **Runnable skeleton** — pipeline works; accuracy/bias checks are stubs |
| 4. Evidence Engine | `evidence/source_registry.sql` | 📄 **Schema of record** — verification workflow not built |
| 5. Replication Framework | `pilot/pilot_journey.md` | 📄 **Roadmap** — Phase 0 real, later phases are targets |

## Why the honesty matters

The whole point of a Proof Layer is that it can be trusted. Marking each piece
as *schema / design / skeleton* rather than "done" is not a weakness — it is the
Evidence Engine applied to our own repo. The single remaining point on the
scorecard is earned the only way it can be: **run the pilot** — enroll real
participants, capture baselines, complete the 90-day cycle.

## To activate (the real sequence)

1. Stand up the PostgreSQL backend and apply the two `.sql` schemas.
2. Wire the dashboard's `data/career.json` measurement loop to write real
   baselines/outcomes into `participant_baselines` / `participant_outcomes`.
3. Implement the Living Voice guardrail stubs against the Evidence Engine.
4. Build the review console that consumes `reviewer_workflow.yaml`.
5. Enroll the first 10 participants; run baseline EMI; begin the 90-day cycle.
