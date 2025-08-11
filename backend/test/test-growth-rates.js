const db = require('../config');

console.log('Testing growth rates query...');

const query = `
  WITH species_populations AS (
    SELECT 
      s.species_id,
      s.name,
      MIN(c.count) as initial_population,
      MAX(c.count) as current_population,
      COUNT(*) as census_count
    FROM species s
    LEFT JOIN census_records c ON s.species_id = c.species_id
    GROUP BY s.species_id, s.name
    HAVING census_count >= 2
  )
  SELECT 
    name,
    initial_population,
    current_population,
    CASE 
      WHEN initial_population > 0 THEN ROUND(((current_population - initial_population) / initial_population * 100), 2)
      ELSE 0
    END as growth_rate
  FROM species_populations
  ORDER BY name;
`;

console.log('Executing query:', query);

db.query(query, (err, results) => {
  if (err) {
    console.error('Database error fetching growth rates:', err);
    return;
  }
  
  console.log('Growth rates results:', results);
  
  if (!results || results.length === 0) {
    console.log('No growth rate data found');
    return;
  }

  console.log('Found', results.length, 'growth rate records');
  console.log('Sample data:', results[0]);
});

// Keep the script running for a moment to allow the query to complete
setTimeout(() => {
  console.log('Growth rates test complete');
  process.exit(0);
}, 2000); 