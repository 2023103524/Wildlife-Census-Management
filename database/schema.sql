-- Create database
CREATE DATABASE IF NOT EXISTS wildlife_census;
USE wildlife_census;

-- Create tables
CREATE TABLE IF NOT EXISTS species (
    species_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(100),
    conservation_status ENUM('Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern') NOT NULL,
    population_count INT DEFAULT 0,
    last_census_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    coordinates POINT,
    area_hectares DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS observers (
    observer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    organization VARCHAR(100),
    expertise VARCHAR(100),
    join_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS census_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    species_id INT,
    location_id INT,
    observer_id INT,
    count INT NOT NULL,
    census_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES species(species_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (observer_id) REFERENCES observers(observer_id)
);

CREATE TABLE IF NOT EXISTS conservation_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    species_id INT NOT NULL,
    previous_status ENUM('Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern'),
    new_status ENUM('Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern'),
    change_date DATE NOT NULL,
	reason TEXT,
    changed_by TEXT,
    FOREIGN KEY (species_id) REFERENCES species(species_id),
  
);

-- Create view after all tables exist
CREATE OR REPLACE VIEW species_population_density AS
SELECT 
    s.species_id,
    s.name,
    COALESCE(s.population_count, 0) as population_count,
    COALESCE(SUM(l.area_hectares), 0.00) AS total_area,
    CASE 
        WHEN COALESCE(SUM(l.area_hectares), 0) > 0 THEN CAST(COALESCE(s.population_count, 0) / SUM(l.area_hectares) AS DECIMAL(10,2))
        ELSE 0.00
    END AS population_density
FROM 
    species s
LEFT JOIN 
    census_records cr ON s.species_id = cr.species_id
LEFT JOIN 
    locations l ON cr.location_id = l.location_id
GROUP BY 
    s.species_id, s.name, s.population_count;

DELIMITER //
CREATE TRIGGER after_census_insert
AFTER INSERT ON census_records
FOR EACH ROW
BEGIN
    UPDATE species 
    SET population_count = (
        SELECT SUM(count) 
        FROM census_records 
        WHERE species_id = NEW.species_id
    ),
    last_census_date = NEW.census_date
    WHERE species_id = NEW.species_id;
END //
DELIMITER ;

-- Procedure to generate census report
DELIMITER //
CREATE PROCEDURE generate_census_report(IN census_date DATE)
BEGIN
    SELECT 
        s.name as species_name,
        s.scientific_name,
        s.conservation_status,
        s.population_count,
        spd.population_density,
        l.name as location_name,
        l.region,
        cr.count,
        cr.census_date,
        o.name as observer_name
    FROM species s
    JOIN census_records cr ON s.species_id = cr.species_id
    JOIN locations l ON cr.location_id = l.location_id
    JOIN observers o ON cr.observer_id = o.observer_id
    LEFT JOIN species_population_density spd ON s.species_id = spd.species_id
    WHERE cr.census_date = census_date
    ORDER BY cr.census_date DESC;
END //
DELIMITER ;

-- Function to calculate species growth rate
DELIMITER //

CREATE FUNCTION calculate_growth_rate(
    p_species_id INT,
    p_months_back INT
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE initial_count DECIMAL(10,2);
    DECLARE final_count DECIMAL(10,2);
    DECLARE growth_rate DECIMAL(10,2);
    
    -- Get the initial count (oldest record within the specified months)
    SELECT count INTO initial_count
    FROM census_records
    WHERE species_id = p_species_id
    AND census_date >= DATE_SUB(CURDATE(), INTERVAL p_months_back MONTH)
    ORDER BY census_date ASC
    LIMIT 1;
    
    -- Get the final count (newest record)
    SELECT count INTO final_count
    FROM census_records
    WHERE species_id = p_species_id
    AND census_date >= DATE_SUB(CURDATE(), INTERVAL p_months_back MONTH)
    ORDER BY census_date DESC
    LIMIT 1;
    
    -- Calculate growth rate as percentage
    IF initial_count > 0 AND initial_count IS NOT NULL THEN
        SET growth_rate = ((final_count - initial_count) / initial_count) * 100;
    ELSE
        SET growth_rate = 0;
    END IF;
    
    RETURN COALESCE(growth_rate, 0);
END //

DELIMITER ;

-- Cursor example: Process species data
DELIMITER //
CREATE PROCEDURE process_species_data()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE species_id_var INT;
    DECLARE species_name_var VARCHAR(100);
    DECLARE cur CURSOR FOR SELECT species_id, name FROM species;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Create temporary table to store processed data
    DROP TEMPORARY TABLE IF EXISTS temp_species_stats;
    CREATE TEMPORARY TABLE temp_species_stats (
        species_id INT,
        species_name VARCHAR(100),
        total_count INT,
        avg_count DECIMAL(10,2)
    );

    -- Check if there are any species
    IF EXISTS (SELECT 1 FROM species LIMIT 1) THEN
        OPEN cur;
        
        read_loop: LOOP
            FETCH cur INTO species_id_var, species_name_var;
            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Process data for each species
            INSERT INTO temp_species_stats
            SELECT 
                species_id_var,
                species_name_var,
                COALESCE(SUM(cr.count), 0) as total_count,
                COALESCE(AVG(cr.count), 0.00) as avg_count
            FROM census_records cr
            WHERE cr.species_id = species_id_var;
            
        END LOOP;

        CLOSE cur;

        -- Return the processed data
        SELECT * FROM temp_species_stats;
    ELSE
        -- Return empty result with proper structure
        SELECT 
            NULL as species_id,
            NULL as species_name,
            0 as total_count,
            0.00 as avg_count
        WHERE FALSE;
    END IF;
    
    -- Clean up
    DROP TEMPORARY TABLE IF EXISTS temp_species_stats;
END //
DELIMITER ;