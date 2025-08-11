const mysql = require('mysql2');
const db = require('../config');

// Create observers table
const createObserversTable = () => {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
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
      )
    `;

    db.query(createTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating observers table:', err);
        reject(err);
        return;
      }
      console.log('Observers table created successfully');
      resolve(result);
    });
  });
};

// Add observer_id column to census_records table if it doesn't exist
const addObserverIdToCensusRecords = () => {
  return new Promise((resolve, reject) => {
    // First check if the column exists
    db.query("SHOW COLUMNS FROM census_records LIKE 'observer_id'", (err, results) => {
      if (err) {
        console.error('Error checking for observer_id column:', err);
        reject(err);
        return;
      }

      // If the column doesn't exist, add it
      if (results.length === 0) {
        const alterTableQuery = `
          ALTER TABLE census_records 
          ADD COLUMN observer_id INT,
          ADD FOREIGN KEY (observer_id) REFERENCES observers(observer_id)
        `;

        db.query(alterTableQuery, (err, result) => {
          if (err) {
            console.error('Error adding observer_id column:', err);
            reject(err);
            return;
          }
          console.log('Added observer_id column to census_records table');
          resolve(result);
        });
      } else {
        console.log('observer_id column already exists in census_records table');
        resolve();
      }
    });
  });
};

// Main function to set up the database
const setupDatabase = async () => {
  try {
    await createObserversTable();
    await addObserverIdToCensusRecords();
    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Run the setup
setupDatabase(); 