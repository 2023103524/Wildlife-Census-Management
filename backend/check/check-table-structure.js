const mysql = require('mysql2');
const db = require('../config');

async function checkTableStructure() {
    try {
        // Check census_records table structure
        const [columns] = await db.promise().query('SHOW COLUMNS FROM census_records');
        console.log('\nCensus records table structure:', JSON.stringify(columns, null, 2));

        // Check if the table exists
        const [tables] = await db.promise().query('SHOW TABLES');
        console.log('\nTables in database:', JSON.stringify(tables, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

checkTableStructure(); 