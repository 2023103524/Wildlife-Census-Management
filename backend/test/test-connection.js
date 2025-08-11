const db = require('../config');

console.log('Testing database connection...');

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  
  console.log('Successfully connected to the database!');
  
  // Test a simple query
  connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      console.error('Error executing test query:', err);
      connection.release();
      return;
    }
    
    console.log('Test query result:', results[0].result);
    connection.release();
    console.log('Connection released');
  });
});

// Keep the script running for a moment to allow the connection to complete
setTimeout(() => {
  console.log('Connection test complete');
  process.exit(0);
}, 2000); 