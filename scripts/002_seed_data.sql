-- Bear Hub Pro Seed Data
-- Initial data for customers, jobs, leads, agents

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, properties_count, trees_count, notes) VALUES
('Private Estate', 'contact@bridlepath.com', '416-555-0100', 'Bridle Path Mansion, Toronto', 1, 15, 'High-value client - billionaire estate'),
('Johnson Family', 'johnson@email.com', '416-555-0101', '456 Maple Ave, Toronto', 1, 4, 'Prefers morning work. Dog in backyard.'),
('Municipal Parks', 'parks@toronto.ca', '416-555-0102', 'Toronto Parks Dept', 50, 500, 'City contract - priority client'),
('Smith Residence', 'smith@email.com', '416-555-0103', '789 Cedar Lane, Markham', 1, 6, 'Annual maintenance contract'),
('Thompson Estate', 'thompson@email.com', '416-555-0104', '321 Pine Road, Markham', 2, 8, 'Multiple properties')
ON CONFLICT DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (address, customer_name, job_type, status, value, permit_required, clearance_required, climbing_required, trees, notes, photos_count) VALUES
('Bridle Path Mansion', 'Private Estate', 'Huge Red Oak Removal', 'in-progress', 18500.00, TRUE, TRUE, TRUE, ARRAY['100ft Red Oak - Inaccessible'], 'Billionaire mansion. Crane cannot access. CLIMBING ONLY - Black Bear specialty.', 12),
('456 Maple Ave, Toronto', 'Johnson Family', 'Tree Removal', 'in-progress', 1200.00, TRUE, FALSE, TRUE, ARRAY['Large Oak', 'Dead Maple'], 'Backyard inaccessible to equipment. Climbing required.', 5),
('Storm Damage - Scarborough', 'Municipal Parks', 'Emergency Storm Damage', 'urgent', 2800.00, TRUE, TRUE, TRUE, ARRAY['Large Oak - split', 'Fallen Pine on house'], 'URGENT - Tree on roof. Other companies refused. WE CLIMB.', 8),
('789 Cedar Lane, Markham', 'Smith Residence', 'Pruning & Camera Install', 'scheduled', 950.00, FALSE, FALSE, FALSE, ARRAY['Cedar Hedge', 'Camera mount in Oak'], 'Security camera installation in tree + hedge trimming', 3),
('321 Pine Road, Markham', 'Thompson Estate', 'Stump Grinding', 'scheduled', 350.00, FALSE, FALSE, FALSE, ARRAY['3 stumps'], 'Access through side gate', 2)
ON CONFLICT DO NOTHING;

-- Insert sample leads
INSERT INTO leads (name, address, phone, source, status, priority, estimated_value, trees_count, properties_count, notes) VALUES
('Maria Santos', '123 Elm Street, Toronto', '416-555-0200', 'instagram', 'new', 'hot', 3500.00, 5, 1, 'Saw our storm damage post. Has urgent removal needed.'),
('David Park', '456 Oak Lane, Mississauga', '905-555-0201', 'linkedin', 'contacted', 'warm', 2200.00, 3, 1, 'Commercial property manager interested in maintenance contract'),
('Lisa Chen', '789 Pine Ave, Markham', '905-555-0202', 'referral', 'follow-up', 'warm', 1800.00, 4, 2, 'Referred by Thompson Estate. Two properties need assessment.'),
('Robert Kim', '321 Cedar Rd, Richmond Hill', '905-555-0203', 'google', 'new', 'hot', 4200.00, 8, 1, 'Found us searching for climbing specialists. Large property.'),
('Emma Wilson', '555 Birch Blvd, Toronto', '416-555-0204', 'yelp', 'quoted', 'warm', 1500.00, 2, 1, 'Saw our 5-star reviews. Needs spring cleanup.')
ON CONFLICT DO NOTHING;

-- Insert agents
INSERT INTO agents (name, role, email, phone, avatar_url, status, rating, jobs_completed, monthly_revenue, commission, trees_this_month, investment_balance) VALUES
('Owner', 'manager', 'blackbeartrees27@gmail.com', '647-764-9017', '/images/owner-climbing.jpg', 'active', 5.0, 156, 42500.00, 0, 67, 12800.00),
('Store Manager', 'manager', 'manager@blackbeartreecare.com', '647-555-0001', NULL, 'active', 4.8, 32, 18200.00, 2730.00, 18, 3200.00),
('Tree Sales Agent', 'sales', 'sales@blackbeartreecare.com', '647-555-0002', NULL, 'active', 4.9, 45, 24800.00, 3720.00, 28, 4500.00)
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (type, payment_method, amount, status, description, due_date) VALUES
('income', 'e-transfer', 18500.00, 'pending', 'Bridle Path Mansion - Red Oak Removal', CURRENT_DATE + INTERVAL '7 days'),
('income', 'e-transfer', 1200.00, 'pending', '456 Maple Ave - Tree Removal', CURRENT_DATE + INTERVAL '3 days'),
('income', 'qr-code', 2800.00, 'pending', 'Storm Damage - Scarborough', CURRENT_DATE),
('expense', 'e-transfer', 450.00, 'completed', 'Equipment maintenance - chainsaw', CURRENT_DATE - INTERVAL '2 days'),
('expense', 'e-transfer', 280.00, 'completed', 'Fuel for March', CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Insert merchandise
INSERT INTO merchandise (name, category, price, cost, stock, min_stock, has_qr, customizable, description) VALUES
('Black Bear Paw Print Mug', 'accessories', 22.00, 8.00, 48, 20, FALSE, FALSE, 'White mug with paw print logo and yellow interior'),
('Black Bear Hoodie', 'apparel', 65.00, 28.00, 24, 10, FALSE, FALSE, 'Premium hoodie with embroidered logo'),
('Black Bear Cap', 'apparel', 32.00, 12.00, 35, 15, FALSE, FALSE, 'Adjustable cap with paw print logo'),
('Black Bear Tracksuit', 'apparel', 110.00, 45.00, 12, 8, FALSE, FALSE, 'Full tracksuit with branding'),
('Business Cards (250) - QR Code', 'marketing', 0, 45.00, 3, 5, TRUE, FALSE, 'Premium business cards with QR code to website'),
('Lawn Signs (Pack of 10)', 'marketing', 0, 75.00, 2, 5, TRUE, FALSE, 'Yard signs with QR code'),
('Logo Stickers (100) - QR Code', 'marketing', 0, 28.00, 15, 5, TRUE, FALSE, 'Vinyl stickers with QR code'),
('Vehicle Magnets (Pair)', 'marketing', 0, 95.00, 4, 2, TRUE, FALSE, 'Large magnetic signs for truck'),
('Work Boots - Branded', 'apparel', 185.00, 95.00, 6, 3, FALSE, FALSE, 'Steel toe boots with logo'),
('Custom Logo Cutting Boards (Small)', 'custom-orders', 32.00, 14.00, 18, 10, FALSE, TRUE, '7x10 inch custom cutting board - Black Bear logo on back'),
('Custom Logo Cutting Boards (Large)', 'custom-orders', 48.00, 22.00, 12, 8, FALSE, TRUE, '10x14 inch custom cutting board - Black Bear logo on back')
ON CONFLICT DO NOTHING;
