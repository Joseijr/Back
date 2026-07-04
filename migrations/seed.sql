-- Clear existing data
/*TRUNCATE TABLE vehicles, vehicle_brands, vehicle_categories, vehicle_fuel_types, users CASCADE;

-- Insert users
INSERT INTO users (email, username, password, first_name, last_name, created_at, updated_at) VALUES
('alice@example.com', 'alice_smith', 'password1', 'Alice', 'Smith', NOW(), NOW()),
('bob@example.com', 'bob_johnson', 'password2', 'Bob', 'Johnson', NOW(), NOW());

-- Insert brands
INSERT INTO vehicle_brands (id, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Toyota', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Honda', NOW(), NOW());

-- Insert categories
INSERT INTO vehicle_categories (id, name, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Sedan', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'SUV', NOW(), NOW());

-- Insert fuel types
INSERT INTO vehicle_fuel_types (id, name, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Gasoline', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440002', 'Electric', NOW(), NOW());

-- Insert vehicles (using the UUIDs from above)
INSERT INTO vehicles (brand_id, category_id, fuel_type_id, model, year, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Camry', 2020, 'A reliable sedan', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'RAV4', 2020, 'A spacious SUV', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Civic', 2020, 'A compact car', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'CR-V', 2020, 'A versatile SUV', NOW(), NOW());
*/