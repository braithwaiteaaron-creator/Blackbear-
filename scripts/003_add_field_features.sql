-- Add time tracking, notes, and materials to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time_ended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_notes TEXT;

-- Create job_materials table for tracking supplies used
CREATE TABLE IF NOT EXISTS job_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_photos table for before/after photos
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'general', -- 'before', 'after', 'general'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_materials_job ON job_materials(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job ON job_photos(job_id);

-- Update function to calculate duration when job is completed
CREATE OR REPLACE FUNCTION calculate_job_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.time_ended_at IS NOT NULL AND NEW.time_started_at IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.time_ended_at - NEW.time_started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
DROP TRIGGER IF EXISTS trigger_calculate_duration ON jobs;
CREATE TRIGGER trigger_calculate_duration
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_job_duration();
