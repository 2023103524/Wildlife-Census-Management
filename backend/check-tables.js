const db = require('./config');

console.log('Checking database tables...');

// Check species table
db.query('SHOW CREATE TABLE species', (err, results) => {
  if (err) {
    console.error('Error checking species table:', err);
  } else {
    console.log('\nSpecies table structure:');
    console.log(results[0]['Create Table']);
  }
});

// Check census_records table
db.query('SHOW CREATE TABLE census_records', (err, results) => {
  if (err) {
    console.error('Error checking census_records table:', err);
  } else {
    console.log('\nCensus records table structure:');
    console.log(results[0]['Create Table']);
  }
});

// Check data in species table
db.query('SELECT * FROM species', (err, results) => {
  if (err) {
    console.error('Error checking species data:', err);
  } else {
    console.log('\nSpecies data:');
    console.log(results);
  }
});

// Check data in census_records table
db.query('SELECT * FROM census_records', (err, results) => {
  if (err) {
    console.error('Error checking census records data:', err);
  } else {
    console.log('\nCensus records data:');
    console.log(results);
  }
});

// Keep the script running for a moment to allow queries to complete
setTimeout(() => {
  console.log('\nDatabase check complete');
  process.exit(0);
}, 2000); 