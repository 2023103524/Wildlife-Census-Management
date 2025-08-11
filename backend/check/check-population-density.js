const mysql = require('mysql2');
const db = require('../config');

async function checkPopulationDensity() {
    try {
        // Check species table
        const [species] = await db.promise().query('SELECT * FROM species');
        console.log('\nSpecies in database:', JSON.stringify(species, null, 2));

        // Check locations table
        const [locations] = await db.promise().query('SELECT * FROM locations');
        console.log('\nLocations in database:', JSON.stringify(locations, null, 2));

        // Check census records
        const [census] = await db.promise().query('SELECT * FROM census_records');
        console.log('\nCensus records in database:', JSON.stringify(census, null, 2));

        // Check population density view
        const [density] = await db.promise().query('SELECT * FROM species_population_density');
        console.log('\nPopulation density view:', JSON.stringify(density, null, 2));

        // Check if the view exists
        const [views] = await db.promise().query('SHOW FULL TABLES WHERE Table_type = "VIEW"');
        console.log('\nViews in database:', JSON.stringify(views, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

checkPopulationDensity(); 