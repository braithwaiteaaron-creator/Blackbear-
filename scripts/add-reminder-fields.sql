-- Add reminder tracking fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS reminder_3day_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_1day_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_morning_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date) WHERE status = 'scheduled';
