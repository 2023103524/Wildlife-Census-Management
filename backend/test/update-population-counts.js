const mysql = require('mysql2');
const db = require('../config');

async function updatePopulationCounts() {
    try {
        // Update population counts for each species
        await db.promise().query(`
            UPDATE species s
            SET population_count = (
                SELECT COALESCE(SUM(count), 0)
                FROM census_records cr
                WHERE cr.species_id = s.species_id
            ),
            last_census_date = (
                SELECT MAX(census_date)
                FROM census_records cr
                WHERE cr.species_id = s.species_id
            )
        `);
        console.log('Updated population counts');

        // Verify the updates
        const [species] = await db.promise().query('SELECT * FROM species');
        console.log('\nUpdated species data:', JSON.stringify(species, null, 2));

        // Check population density view
        const [density] = await db.promise().query('SELECT * FROM species_population_density');
        console.log('\nUpdated population density view:', JSON.stringify(density, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

updatePopulationCounts(); 