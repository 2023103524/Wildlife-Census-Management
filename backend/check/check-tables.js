const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Yazh@2005',
  database: 'wildlife_census'
};

const checkTables = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get list of tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables);

    // Get structure of each table
    for (const table of tables) {
      const tableName = table[Object.keys(table)[0]];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`\nStructure of ${tableName}:`);
      console.log(columns);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
};

checkTables(); 