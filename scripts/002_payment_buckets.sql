-- Payment Buckets for Bear Hub Pro
-- Labour 45%, Materials 20%, Overhead 15%, Tax Reserve 13%, Profit 7%

-- Payment allocations table - tracks how each job payment is split
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  labour_amount DECIMAL(10,2) NOT NULL,
  materials_amount DECIMAL(10,2) NOT NULL,
  overhead_amount DECIMAL(10,2) NOT NULL,
  tax_reserve_amount DECIMAL(10,2) NOT NULL,
  profit_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for job lookups
CREATE INDEX IF NOT EXISTS idx_payment_allocations_job ON payment_allocations(job_id);

-- Function to calculate payment buckets when a job is marked as paid
CREATE OR REPLACE FUNCTION calculate_payment_buckets()
RETURNS TRIGGER AS $$
DECLARE
  job_amount DECIMAL(10,2);
BEGIN
  -- Only trigger when job is marked as paid (paid changes from false to true)
  IF NEW.paid = TRUE AND (OLD.paid = FALSE OR OLD.paid IS NULL) THEN
    -- Use actual_amount if set, otherwise use estimated_amount
    job_amount := COALESCE(NEW.actual_amount, NEW.estimated_amount);
    
    -- Insert payment allocation with bucket calculations
    INSERT INTO payment_allocations (
      job_id,
      total_amount,
      labour_amount,
      materials_amount,
      overhead_amount,
      tax_reserve_amount,
      profit_amount
    ) VALUES (
      NEW.id,
      job_amount,
      ROUND(job_amount * 0.45, 2),  -- Labour 45%
      ROUND(job_amount * 0.20, 2),  -- Materials 20%
      ROUND(job_amount * 0.15, 2),  -- Overhead 15%
      ROUND(job_amount * 0.13, 2),  -- Tax Reserve 13%
      ROUND(job_amount * 0.07, 2)   -- Profit 7%
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate buckets when job is paid
DROP TRIGGER IF EXISTS trigger_payment_buckets ON jobs;
CREATE TRIGGER trigger_payment_buckets
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payment_buckets();
