-- SQL Schema placeholder for CrisisLink PostgreSQL database
-- This file will contain:
-- - Tables: listings, organizations, needs, claims, feedback
-- - Indexes for performance
-- - Constraints for data integrity
-- 
-- To be populated in Phase 1

-- Example table structure (to be expanded):
/*
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    postcode VARCHAR(4) NOT NULL,
    org_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    donor_org_id INTEGER REFERENCES organizations(id),
    food_type VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50),
    postcode VARCHAR(4) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    claimed_by_org_id INTEGER REFERENCES organizations(id),
    claimed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS needs (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    food_type VARCHAR(100),
    urgency VARCHAR(20),
    quantity_needed INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id),
    org_id INTEGER REFERENCES organizations(id),
    matched_score DECIMAL(3,2),
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id),
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/
