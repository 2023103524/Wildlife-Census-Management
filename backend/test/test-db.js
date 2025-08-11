const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Yazh@2005'
});

async function setupDatabase() {
  try {
    await connection.promise().query('USE wildlife_census');
    console.log('Database selected');

    // Drop tables in correct order
    await connection.promise().query('DROP TABLE IF EXISTS census_records');
    await connection.promise().query('DROP TABLE IF EXISTS species');
    await connection.promise().query('DROP TABLE IF EXISTS locations');
    console.log('Dropped existing tables');

    // Create species table
    await connection.promise().query(`
      CREATE TABLE species (
        species_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        scientific_name VARCHAR(100),
        conservation_status ENUM('Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern') NOT NULL,
        population_count INT,
        last_census_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created species table');

    // Create locations table
    await connection.promise().query(`
      CREATE TABLE locations (
        location_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        coordinates POINT,
        area_hectares DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created locations table');

    // Create census_records table
    await connection.promise().query(`
      CREATE TABLE census_records (
        record_id INT PRIMARY KEY AUTO_INCREMENT,
        species_id INT,
        location_id INT,
        count INT NOT NULL,
        census_date DATE NOT NULL,
        observer_name VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (species_id) REFERENCES species(species_id),
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
      )
    `);
    console.log('Created census_records table');

    // Create trigger for updating species population count
    await connection.promise().query(`
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
      END
    `);
    console.log('Created population count update trigger');

    // Insert test data
    const [speciesResult] = await connection.promise().query(
      'INSERT INTO species (name, scientific_name, conservation_status) VALUES (?, ?, ?)',
      ['Bengal Tiger', 'Panthera tigris tigris', 'Endangered']
    );
    console.log('Test species inserted with ID:', speciesResult.insertId);

    const [locationResult] = await connection.promise().query(
      'INSERT INTO locations (name, region, coordinates, area_hectares) VALUES (?, ?, POINT(?, ?), ?)',
      ['Sundarbans', 'West Bengal', 21.9497, 89.1833, 10000]
    );
    console.log('Test location inserted with ID:', locationResult.insertId);

    const [censusResult] = await connection.promise().query(
      'INSERT INTO census_records (species_id, location_id, count, census_date, observer_name) VALUES (?, ?, ?, ?, ?)',
      [speciesResult.insertId, locationResult.insertId, 100, '2024-04-20', 'John Doe']
    );
    console.log('Test census record inserted with ID:', censusResult.insertId);

    // Create population density view
    await connection.promise().query(`
      CREATE OR REPLACE VIEW species_population_density AS
      SELECT 
        s.species_id,
        s.name,
        s.population_count,
        COALESCE(SUM(l.area_hectares), 0) AS total_area,
        CASE 
          WHEN COALESCE(SUM(l.area_hectares), 0) > 0 THEN s.population_count / SUM(l.area_hectares)
          ELSE 0
        END AS population_density
      FROM 
        species s
      LEFT JOIN 
        census_records cr ON s.species_id = cr.species_id
      LEFT JOIN 
        locations l ON cr.location_id = l.location_id
      GROUP BY 
        s.species_id, s.name, s.population_count
    `);
    console.log('Created population density view');

    // Verify the data
    const [species] = await connection.promise().query('SELECT * FROM species');
    console.log('\nSpecies in database:', JSON.stringify(species, null, 2));

    const [locations] = await connection.promise().query('SELECT * FROM locations');
    console.log('\nLocations in database:', JSON.stringify(locations, null, 2));

    const [census] = await connection.promise().query('SELECT * FROM census_records');
    console.log('\nCensus records in database:', JSON.stringify(census, null, 2));

    const [density] = await connection.promise().query('SELECT * FROM species_population_density');
    console.log('\nPopulation density view:', JSON.stringify(density, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.end();
  }
}

setupDatabase(); 