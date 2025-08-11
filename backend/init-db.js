const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Yazh@2005'
};

const createTables = `
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
    email VARCHAR(100) NOT NULL UNIQUE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (species_id) REFERENCES species(species_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (observer_id) REFERENCES observers(observer_id)
);
`;

const createView = `
CREATE OR REPLACE VIEW species_population_density AS
SELECT 
    s.species_id,
    s.name,
    COALESCE(s.population_count, 0) as population_count,
    COALESCE(SUM(l.area_hectares), 0) AS total_area,
    CASE 
        WHEN COALESCE(SUM(l.area_hectares), 0) > 0 THEN COALESCE(s.population_count, 0) / SUM(l.area_hectares)
        ELSE 0
    END AS population_density
FROM 
    species s
LEFT JOIN 
    census_records cr ON s.species_id = cr.species_id
LEFT JOIN 
    locations l ON cr.location_id = l.location_id
GROUP BY 
    s.species_id, s.name, s.population_count;
`;

const initDatabase = async () => {
  let connection;
  try {
    // Create connection without database selected
    connection = await mysql.createConnection(dbConfig);

    // Drop database if exists and create new one
    await connection.query('DROP DATABASE IF EXISTS wildlife_census');
    console.log('Dropped existing database');
    
    await connection.query('CREATE DATABASE wildlife_census');
    console.log('Created new database');

    // Use the database
    await connection.query('USE wildlife_census');
    console.log('Using wildlife_census database');
    
    // Split and execute table creation statements
    const tableStatements = createTables.split(';').filter(stmt => stmt.trim());
    for (const stmt of tableStatements) {
      if (stmt.trim()) {
        await connection.query(stmt);
      }
    }
    console.log('Tables created successfully');

    // Create view
    await connection.query(createView);
    console.log('View created successfully');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
};

initDatabase(); 