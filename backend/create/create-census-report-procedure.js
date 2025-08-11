const mysql = require('mysql2');
const db = require('../config');

async function createCensusReportProcedure() {
    try {
        // Drop the procedure if it exists
        await db.promise().query('DROP PROCEDURE IF EXISTS generate_census_report');
        console.log('Dropped existing procedure if it existed');

        // Create the procedure
        await db.promise().query(`
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
                ORDER BY s.name;
            END
        `);
        console.log('Created generate_census_report procedure successfully');

        // Verify the procedure was created
        const [procedures] = await db.promise().query('SHOW PROCEDURE STATUS WHERE Db = "wildlife_census"');
        console.log('\nProcedures in database:', JSON.stringify(procedures, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

createCensusReportProcedure(); 