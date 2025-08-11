const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Yazh@2005',
  database: 'wildlife_census'
};

const removeNotesColumn = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Check if notes column exists
    const [columns] = await connection.query("SHOW COLUMNS FROM census_records LIKE 'notes'");
    
    if (columns.length > 0) {
      // Remove notes column
      await connection.query('ALTER TABLE census_records DROP COLUMN notes');
      console.log('Successfully removed notes column from census_records table');
    } else {
      console.log('Notes column does not exist in census_records table');
    }

  } catch (error) {
    console.error('Error removing notes column:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
};

removeNotesColumn(); 