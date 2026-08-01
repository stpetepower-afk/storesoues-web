-- Economic Mobility Index (EMI) — core reality-data query.
-- Reports verified income gain per participant against baseline.
-- Requires the Proof Layer schema (../../proof-layer/impact_measurement/
-- outcome_tracking.sql) applied to a PostgreSQL backend AND real participant
-- data. Returns nothing until the pilot is running — which is correct.

SELECT
    p.participant_id,
    b.monthly_income          AS baseline_monthly_income,
    o.monthly_income          AS current_monthly_income,
    (o.monthly_income - b.monthly_income) AS monthly_gain,
    o.emi_score               AS economic_mobility_index
FROM participants p
JOIN participant_baselines b ON p.id = b.resident_id
JOIN participant_outcomes  o ON p.id = o.resident_id
WHERE o.measurement_date = CURRENT_DATE;
