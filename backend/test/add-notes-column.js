const mysql = require('mysql2');
const db = require('../config');

async function addNotesColumn() {
    try {
        // Add notes column to census_records table
        await db.promise().query(`
            ALTER TABLE census_records
            ADD COLUMN notes TEXT
        `);
        console.log('Added notes column to census_records table');

        // Verify the column was added
        const [columns] = await db.promise().query('SHOW COLUMNS FROM census_records');
        console.log('\nUpdated census records table structure:', JSON.stringify(columns, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.end();
    }
}

addNotesColumn(); 