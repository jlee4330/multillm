-- Create a submissions table for Supabase/Postgres
-- Run this in Supabase SQL editor or your Postgres client

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  receivedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);

-- Optional index on receivedAt for faster ordering/filtering
CREATE INDEX IF NOT EXISTS submissions_receivedat_idx ON submissions (receivedAt DESC);
