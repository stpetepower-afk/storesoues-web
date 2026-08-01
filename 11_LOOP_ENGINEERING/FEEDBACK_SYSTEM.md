# Feedback System — Loop Engineering

How feedback is collected so loops have something real to learn from.

## Sources (to be wired)

- **Operational data:** the `data/*.json` files behind the Command Center.
- **Human feedback:** staff and resident input (surveys, case notes).
- **Outcome events:** placements, retention checkpoints, funding decisions.

## Minimum viable feedback (first build)

The honest first step is small and real:

1. Log each meaningful event (e.g. a resident stage change) with a timestamp.
2. Store it append-only so history is preserved.
3. Let the Intelligence step read that history to spot a pattern.

Until this exists, loops are designs. Build one real feedback stream end to end
before scaling to all modules.
