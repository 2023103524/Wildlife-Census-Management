const db = require('../config');

console.log('Checking observers table...');

db.query('SELECT * FROM observers', (err, results) => {
  if (err) {
    console.error('Error querying observers:', err);
  } else {
    console.log('Observers in database:');
    console.log(results);
  }
  
  // Check the structure of the observers table
  db.query('DESCRIBE observers', (err, structure) => {
    if (err) {
      console.error('Error describing observers table:', err);
    } else {
      console.log('\nObservers table structure:');
      console.log(structure);
    }
    
    process.exit();
  });
}); 