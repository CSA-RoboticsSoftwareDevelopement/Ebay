-- Insert a test user with hashed password ('password')
INSERT INTO users (id, username, email, password, is_admin) 
VALUES (999, 'testuser', 'test@example.com', '$2a$10$qMZ1NZEbRc8wYCNzqUYmue0jmJ7K/CK0R.3lDWCgSNWvQX3fZFD0K', 0);

-- Insert a license key for the test user (valid for 1 year)
INSERT INTO license_key (id, license_key, created_at, expires_at, user_id, status, payment_mode, payment_date) 
VALUES (999, 'TEST-LICENSE-KEY-123456', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 999, 'Activated', 'Test', CURDATE());

-- Insert a test product
INSERT INTO products (id, sku, cost_price, ebay_fees, updated_at, created_at)
VALUES (999, 'TEST-SKU-123', 50.00, 5.00, NOW(), NOW());

-- Insert a test session
INSERT INTO sessions (id, user_id, auth_token, expires_at)
VALUES (999, 999, 'test-auth-token-123456', DATE_ADD(NOW(), INTERVAL 7 DAY));

-- Insert a test plugin for the user
INSERT INTO plugins (id, plugin_id, user_id, plugin_name, installed)
VALUES (999, 1, 999, 'Test Plugin', 1);

-- Show the inserted data
SELECT 'USERS TABLE:' as '';
SELECT * FROM users WHERE id = 999;
SELECT 'LICENSE KEY TABLE:' as '';
SELECT * FROM license_key WHERE id = 999;
SELECT 'PRODUCTS TABLE:' as '';
SELECT * FROM products WHERE id = 999;
SELECT 'SESSIONS TABLE:' as '';
SELECT * FROM sessions WHERE id = 999;
SELECT 'PLUGINS TABLE:' as '';
SELECT * FROM plugins WHERE id = 999; 