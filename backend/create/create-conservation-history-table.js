const mysql = require('mysql2');
const db = require('../config');

// Create conservation_status_history table
const createConservationHistoryTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS conservation_status_history (
      history_id INT AUTO_INCREMENT PRIMARY KEY,
      species_id INT NOT NULL,
      previous_status ENUM('Extinct', 'Extinct in the Wild', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient', 'Not Evaluated') NOT NULL,
      new_status ENUM('Extinct', 'Extinct in the Wild', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern', 'Data Deficient', 'Not Evaluated') NOT NULL,
      change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reason TEXT,
      changed_by VARCHAR(100),
      FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
    )
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error creating conservation_status_history table:', err);
      return;
    }
    console.log('Conservation status history table created successfully');
    
    // Add some sample data
    addSampleData();
  });
};

// Add sample data to the table
const addSampleData = () => {
  // First, get some species IDs
  db.query('SELECT species_id FROM species LIMIT 3', (err, species) => {
    if (err) {
      console.error('Error fetching species:', err);
      return;
    }
    
    if (species.length === 0) {
      console.log('No species found to add sample data');
      return;
    }
    
    const sampleData = [
      {
        species_id: species[0].species_id,
        previous_status: 'Least Concern',
        new_status: 'Near Threatened',
        reason: 'Population decline observed in recent surveys',
        changed_by: 'Dr. Jane Smith'
      },
      {
        species_id: species[0].species_id,
        previous_status: 'Near Threatened',
        new_status: 'Vulnerable',
        reason: 'Continued population decline and habitat loss',
        changed_by: 'Dr. John Doe'
      }
    ];
    
    if (species.length > 1) {
      sampleData.push({
        species_id: species[1].species_id,
        previous_status: 'Least Concern',
        new_status: 'Vulnerable',
        reason: 'New research indicates significant population decline',
        changed_by: 'Dr. Sarah Johnson'
      });
    }
    
    // Insert sample data
    const insertQuery = `
      INSERT INTO conservation_status_history 
      (species_id, previous_status, new_status, reason, changed_by) 
      VALUES ?
    `;
    
    const values = sampleData.map(item => [
      item.species_id,
      item.previous_status,
      item.new_status,
      item.reason,
      item.changed_by
    ]);
    
    db.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Error inserting sample data:', err);
        return;
      }
      console.log('Sample data added to conservation_status_history table');
    });
  });
};

// Execute the function
createConservationHistoryTable(); 