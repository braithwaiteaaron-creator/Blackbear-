-- Clear all data from tables to prepare for real data
-- Order matters due to foreign key constraints

-- First, clear tables with foreign key references
DELETE FROM public.spotted_damage;
DELETE FROM public.route_stops;
DELETE FROM public.transactions;
DELETE FROM public.leads;
DELETE FROM public.jobs;
DELETE FROM public.referrers;
DELETE FROM public.merchandise;
DELETE FROM public.agents;
DELETE FROM public.customers;

-- Confirm deletion
SELECT 'All data cleared successfully' AS status;
