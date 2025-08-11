const express = require('express');
const cors = require('cors');
const db = require('../config');

const app = express();
const PORT = 5001; // Use a different port

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running' });
});

// Growth rates route
app.get('/api/species/growth-rates', async (req, res) => {
  try {
    console.log('Fetching growth rates for all species...');
    
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
        res.status(500).json({ error: 'Failed to fetch growth rates', details: err.message });
        return;
      }
      
      console.log('Growth rates results:', results);
      
      if (!results || results.length === 0) {
        console.log('No growth rate data found');
        res.json([]);
        return;
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error in growth rates endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch growth rates', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 