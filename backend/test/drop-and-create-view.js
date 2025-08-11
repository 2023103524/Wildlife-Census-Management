const mysql = require('mysql2');
const db = require('../config');

async function dropAndCreateView() {
    try {
        // Drop the existing table/view if it exists
        await db.promise().query('DROP TABLE IF EXISTS species_population_density');
        await db.promise().query('DROP VIEW IF EXISTS species_population_density');
        console.log('Dropped existing table/view');

        // Create population density view
        await db.promise().query(`
            CREATE VIEW species_population_density AS
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
                s.species_id, s.name, s.population_count
        `);
        console.log('Created population density view');

        // Verify the view was created
        const [views] = await db.promise().query('SHOW FULL TABLES WHERE Table_type = "VIEW"');
        console.log('\nViews in database:', JSON.stringify(views, null, 2));

        // Check the view data
        const [density] = await db.promise().query('SELECT * FROM species_population_density');
        console.log('\nPopulation density view data:', JSON.stringify(density, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

dropAndCreateView(); 