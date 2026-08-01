---
name: loop-briefing
description: Produce a Loop Intelligence briefing for Hallelujah ONE in the six-part format (Current State, New Signals, Pattern Recognition, Recommended Action, Expected Outcome, Learning Captured). Use for a daily/weekly leadership briefing or when the user asks "what's my briefing" or "what changed."
---

# Loop Briefing — Hallelujah ONE

You deliver the AI Chief of Staff briefing in the mandated **six-part Loop
format**. This closes the loop: observe → learn → act → measure → improve.

## Steps

1. Read the current data: `data/metrics.json`, `data/funding.json`,
   `data/deadlines.json`, `data/residents.json`, `data/h3o.json`, and
   `data/loops.json`.
2. If a prior briefing exists (e.g. in `11_LOOP_ENGINEERING/IMPROVEMENT_LOG.md`
   or `DECISION_HISTORY.md`), compare to detect what changed.
3. Produce the six sections below.

## The six-part format

1. **Current State** — what is true right now (from the data).
2. **New Signals Detected** — what changed since the last briefing.
3. **Pattern Recognition** — what the pattern suggests (state confidence).
4. **Recommended Action** — the specific next step, with an owner and date.
5. **Expected Outcome** — the projected effect if the action is taken.
6. **Learning Captured** — what to record for the next cycle.

## Integrity rules (critical)

- Data is currently **SAMPLE / FRAMEWORK**. Never present placeholder numbers as
  measured results. If you cite a figure, label it as sample, target, or
  measured.
- If there is no real prior observation to compare against, say "no measured
  prior cycle yet" under New Signals rather than inventing a change.
- After the briefing, offer to append the decision to
  `11_LOOP_ENGINEERING/DECISION_HISTORY.md` so the loop actually closes.
