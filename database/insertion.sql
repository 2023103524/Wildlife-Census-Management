 -- Insert sample species data
INSERT INTO species (name, scientific_name, conservation_status, population_count, last_census_date) VALUES
('Bengal Tiger', 'Panthera tigris tigris', 'Endangered', 2500, '2023-12-01'),
('Asian Elephant', 'Elephas maximus', 'Endangered', 40000, '2023-12-01'),
('Red Panda', 'Ailurus fulgens', 'Endangered', 10000, '2023-12-01'),
('Snow Leopard', 'Panthera uncia', 'Vulnerable', 4000, '2023-12-01'),
('Giant Panda', 'Ailuropoda melanoleuca', 'Vulnerable', 1864, '2023-12-01');

-- Insert sample locations data
INSERT INTO locations (name, region, coordinates, area_hectares) VALUES
('Kaziranga National Park', 'Assam, India', POINT(93.4167, 26.5833), 43000.00),
('Sundarbans National Park', 'West Bengal, India', POINT(88.8833, 21.9500), 133000.00),
('Sichuan Giant Panda Sanctuaries', 'Sichuan, China', POINT(102.9167, 30.8333), 924500.00),
('Sagarmatha National Park', 'Nepal', POINT(86.7167, 27.9833), 114800.00),
('Manas National Park', 'Assam, India', POINT(91.7167, 26.7167), 39100.00);

-- Insert sample observers data
INSERT INTO observers (name, email, phone, organization, expertise, join_date, active) VALUES
('Dr. Sarah Chen', 'sarah.chen@wildlife.org', '+1-555-0123', 'Wildlife Conservation Society', 'Mammalogy', '2020-01-15', TRUE),
('Prof. Rajesh Kumar', 'rajesh.kumar@conservation.edu', '+91-98765-43210', 'National Wildlife Institute', 'Ecology', '2019-06-01', TRUE),
('Dr. Maria Garcia', 'maria.garcia@wildlife.org', '+1-555-0124', 'Wildlife Conservation Society', 'Ornithology', '2021-03-10', TRUE),
('Dr. James Wilson', 'james.wilson@conservation.edu', '+1-555-0125', 'National Wildlife Institute', 'Herpetology', '2018-09-20', TRUE),
('Dr. Priya Patel', 'priya.patel@wildlife.org', '+91-98765-43211', 'Wildlife Conservation Society', 'Botany', '2022-01-05', TRUE);

-- Insert sample census records data
INSERT INTO census_records (species_id, location_id, observer_id, count, census_date, notes) VALUES
(1, 1, 1, 120, '2023-12-01', 'Regular census count in Kaziranga'),
(1, 2, 2, 85, '2023-12-01', 'Annual tiger census in Sundarbans'),
(2, 1, 3, 2500, '2023-12-01', 'Elephant population survey in Kaziranga'),
(3, 3, 4, 150, '2023-12-01', 'Red panda census in Sichuan'),
(4, 4, 5, 45, '2023-12-01', 'Snow leopard survey in Sagarmatha'),
(5, 3, 1, 80, '2023-12-01', 'Giant panda census in Sichuan sanctuaries');

-- Insert sample conservation status history data
INSERT INTO conservation_status_history (species_id, previous_status, new_status, change_date, reason, changed_by) VALUES
(1, 'Critically Endangered', 'Endangered', '2022-06-15', 'Population recovery due to successful anti-poaching measures', 'Dr. Sarah Chen'),
(2, 'Endangered', 'Vulnerable', '2023-03-20', 'Habitat restoration and population growth in protected areas', 'Prof. Rajesh Kumar'),
(3, 'Vulnerable', 'Near Threatened', '2023-09-10', 'Stable population growth and improved habitat conditions', 'Dr. Maria Garcia'),
(4, 'Endangered', 'Vulnerable', '2023-07-05', 'Successful community-based conservation program', 'Dr. James Wilson'),
(5, 'Critically Endangered', 'Endangered', '2021-12-01', 'Breeding program success and habitat protection', 'Dr. Priya Patel');