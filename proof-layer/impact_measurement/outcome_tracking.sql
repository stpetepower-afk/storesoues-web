-- ============================================================
-- Hallelujah ONE — Proof Layer: Impact Measurement Schema
-- Target: future PostgreSQL backend (Growth phase). NOT yet wired
-- to the current static dashboard — this is the schema of record for
-- when the database is stood up. Assumes residents(id) and users(id)
-- tables exist.
-- ============================================================

-- Baseline & Outcome Tracking
CREATE TABLE participant_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id),
    entry_date DATE NOT NULL,
    housing_status VARCHAR(50),
    monthly_rent DECIMAL(10,2),
    employment_status VARCHAR(50),
    hourly_wage DECIMAL(10,2),
    monthly_income DECIMAL(10,2),
    savings DECIMAL(10,2),
    credit_score INTEGER,
    transportation_access VARCHAR(50),
    community_support_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participant_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id),
    measurement_date DATE NOT NULL,
    housing_status VARCHAR(50),
    monthly_rent DECIMAL(10,2),
    employment_status VARCHAR(50),
    hourly_wage DECIMAL(10,2),
    monthly_income DECIMAL(10,2),
    savings DECIMAL(10,2),
    credit_score INTEGER,
    transportation_access VARCHAR(50),
    community_support_score INTEGER,
    emi_score INTEGER,  -- Economic Mobility Index
    intervention_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 90-Day Measurement Plan
CREATE TABLE measurement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id),
    baseline_measurement_date DATE,
    day_30_measurement_date DATE,
    day_60_measurement_date DATE,
    day_90_measurement_date DATE,
    day_180_measurement_date DATE,
    day_365_measurement_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
