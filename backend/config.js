const mysql = require('mysql2');

console.log('Creating database connection pool...');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Yazh@2005',
  database: 'wildlife_census',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  debug: true,
  multipleStatements: true
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database!');
  connection.release();
});

module.exports = db; 