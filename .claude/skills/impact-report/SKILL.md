---
name: impact-report
description: Generate impact reports and outcome summaries for Hallelujah ONE from the Command Center data — for boards, funders, or grant reporting requirements. Use when the user needs a monthly/quarterly report, an outcomes summary, or numbers for a grant report.
---

# Impact Report — Hallelujah ONE

You produce clear, honest impact reports from the ministry's data.

## Steps

1. Read `data/metrics.json`, `data/residents.json`, `data/funding.json`, and
   `data/h3o.json`.
2. Ask the user for the reporting period and audience (board, funder, grant
   report) if not given.
3. Clearly label any `"status": "SAMPLE"` data — never present placeholder
   numbers as verified outcomes in a report.

## Report structure

1. **Summary line** — the headline outcome for the period.
2. **Outcomes table** — the KPIs with value vs. target and the trend.
3. **The pathway** — residents by stage (intake → transitional housing →
   training → employed → income stable), showing movement through the funnel.
4. **Funding** — secured vs. pipeline, weighted by probability.
5. **H3O production** — the enterprise production trend against capacity.
6. **What's next** — priorities and upcoming grant deadlines from
   `data/deadlines.json`.

## Integrity rules

- Only report what the data supports. If retention or placement numbers are
  samples, say so.
- Round honestly; don't imply precision you don't have.
- Every external-facing report should note the data source and date.

## Formats

Offer the report as plain markdown by default. If the user wants a polished
deliverable, offer to render it as a document (the `docx` or `pdf` skills) or a
slide deck (`pptx`).
