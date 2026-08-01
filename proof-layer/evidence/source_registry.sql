-- ============================================================
-- Hallelujah ONE — Proof Layer: Evidence Engine
-- Every claim carries a source, a confidence score, a last-verified
-- date, and an owner. Target: future PostgreSQL backend. Assumes a
-- users(id) table. This is the schema of record; the verification
-- workflow that writes to it is not yet built.
-- ============================================================

-- Claims with provenance
CREATE TABLE evidence_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_text TEXT NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('participant_data', 'public_data', 'ai_inference', 'third_party', 'manual_entry')),
    source_reference TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    last_verified_date DATE,
    owner UUID REFERENCES users(id),
    verification_status VARCHAR(50) CHECK (verification_status IN ('pending', 'verified', 'disputed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification logs
CREATE TABLE evidence_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES evidence_claims(id),
    verifier UUID REFERENCES users(id),
    action VARCHAR(50),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
