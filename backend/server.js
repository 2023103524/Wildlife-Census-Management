const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const db = require('./config');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
// Growth rates route
app.get('/api/species/growth-rates', async (req, res) => {
  try {
    console.log('Fetching growth rates for all species...');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    
    // Test database connection first
    await new Promise((resolve, reject) => {
      db.query('SELECT 1', (err) => {
        if (err) {
          console.error('Database connection test failed:', err);
          reject(err);
        } else {
          console.log('Database connection test successful');
          resolve();
        }
      });
    });
    
    // Query to get individual species growth rates
    const speciesQuery = `
      SELECT 
        s.name,
        MIN(c.count) as initial_population,
        MAX(c.count) as current_population,
        CASE 
          WHEN MIN(c.count) > 0 THEN 
            ROUND(((MAX(c.count) - MIN(c.count)) / MIN(c.count) * 100), 2)
          ELSE 0
        END as growth_rate
      FROM species s
      LEFT JOIN census_records c ON s.species_id = c.species_id
      GROUP BY s.name
      HAVING COUNT(c.record_id) >= 2
      ORDER BY s.name;
    `;

    console.log('Executing species query:', speciesQuery);

    db.query(speciesQuery, (err, speciesResults) => {
      if (err) {
        console.error('Database error fetching species growth rates:', err);
        res.status(500).json({ error: 'Failed to fetch growth rates', details: err.message });
        return;
      }
      
      console.log('Species growth rates results:', speciesResults);
      
      if (!speciesResults || speciesResults.length === 0) {
        console.log('No growth rate data found');
        res.json([]);
        return;
      }

      // Calculate average growth rate across all species
      const validGrowthRates = speciesResults.filter(item => 
        item.growth_rate !== null && !isNaN(item.growth_rate)
      );
      
      let totalGrowthRate = 0;
      if (validGrowthRates.length > 0) {
        totalGrowthRate = validGrowthRates.reduce((sum, item) => sum + item.growth_rate, 0) / validGrowthRates.length;
      }
      
      // Add average growth rate to the response
      const response = {
        species: speciesResults,
        averageGrowthRate: isNaN(totalGrowthRate) ? 0 : totalGrowthRate
      };
      
      res.json(response);
    });
  } catch (error) {
    console.error('Error in growth rates endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch growth rates', details: error.message });
  }
});

// Species routes
app.get('/api/species', (req, res) => {
    db.query('SELECT * FROM species', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get population density view data - MOVED BEFORE THE :id ROUTE
app.get('/api/species/population-density', (req, res) => {
    db.query('SELECT * FROM species_population_density', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        // Ensure population_density is a number
        const formattedResults = results.map(item => ({
            ...item,
            population_density: item.population_density ? parseFloat(item.population_density) : 0
        }));
        res.json(formattedResults);
    });
});

app.get('/api/species/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM species WHERE species_id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Species not found' });
            return;
        }
        res.json(results[0]);
    });
});

app.post('/api/species', (req, res) => {
    const { name, scientific_name, conservation_status } = req.body;
    db.query(
        'INSERT INTO species (name, scientific_name, conservation_status) VALUES (?, ?, ?)',
        [name, scientific_name, conservation_status],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, message: 'Species added successfully' });
        }
    );
});

app.put('/api/species/:id', (req, res) => {
    const { id } = req.params;
    const { name, scientific_name, conservation_status } = req.body;
    db.query(
        'UPDATE species SET name = ?, scientific_name = ?, conservation_status = ? WHERE species_id = ?',
        [name, scientific_name, conservation_status, id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Species not found' });
                return;
            }
            res.json({ message: 'Species updated successfully' });
        }
    );
});

// Locations routes
app.get('/api/locations', (req, res) => {
    db.query('SELECT location_id, name, region, area_hectares, created_at, ST_X(coordinates) as lng, ST_Y(coordinates) as lat FROM locations', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log('Raw location results:', results);
        
        // Format the coordinates
        const formattedResults = results.map(location => {
            // Ensure coordinates are properly formatted
            const coordinates = {
                lat: location.lat !== null ? parseFloat(location.lat) : 0,
                lng: location.lng !== null ? parseFloat(location.lng) : 0
            };
            
            return {
                ...location,
                coordinates
            };
        });
        
        console.log('Formatted location results:', formattedResults);
        res.json(formattedResults);
    });
});

app.get('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT *, ST_X(coordinates) as lng, ST_Y(coordinates) as lat FROM locations WHERE location_id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Location not found' });
            return;
        }
        
        console.log('Raw location result:', results[0]);
        
        // Format the coordinates
        const location = results[0];
        location.coordinates = {
            lat: location.lat !== null ? parseFloat(location.lat) : 0,
            lng: location.lng !== null ? parseFloat(location.lng) : 0
        };
        
        console.log('Formatted location result:', location);
        res.json(location);
    });
});

app.post('/api/locations', (req, res) => {
    const { name, region, coordinates, area_hectares } = req.body;
    
    // Validate coordinates
    if (!coordinates || coordinates.lat === undefined || coordinates.lng === undefined) {
        return res.status(400).json({ error: 'Invalid coordinates. Both latitude and longitude are required.' });
    }
    
    // Convert coordinates to numbers to ensure they're valid
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates. Latitude and longitude must be numbers.' });
    }
    
    db.query(
        'INSERT INTO locations (name, region, coordinates, area_hectares) VALUES (?, ?, POINT(?, ?), ?)',
        [name, region, lng, lat, area_hectares],
        (err, result) => {
            if (err) {
                console.error('Error inserting location:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, message: 'Location added successfully' });
        }
    );
});

app.put('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    const { name, region, coordinates, area_hectares } = req.body;
    
    // Validate coordinates
    if (!coordinates || coordinates.lat === undefined || coordinates.lng === undefined) {
        return res.status(400).json({ error: 'Invalid coordinates. Both latitude and longitude are required.' });
    }
    
    // Convert coordinates to numbers to ensure they're valid
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates. Latitude and longitude must be numbers.' });
    }
    
    db.query(
        'UPDATE locations SET name = ?, region = ?, coordinates = POINT(?, ?), area_hectares = ? WHERE location_id = ?',
        [name, region, lng, lat, area_hectares, id],
        (err, result) => {
            if (err) {
                console.error('Error updating location:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Location not found' });
                return;
            }
            res.json({ message: 'Location updated successfully' });
        }
    );
});

// Observers routes
app.get('/api/observers', (req, res) => {
    db.query('SELECT * FROM observers', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.get('/api/observers/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM observers WHERE observer_id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Observer not found' });
            return;
        }
        res.json(results[0]);
    });
});

app.post('/api/observers', (req, res) => {
    const { name, email, phone, organization, expertise, join_date, active } = req.body;
    db.query(
        'INSERT INTO observers (name, email, phone, organization, expertise, join_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, organization, expertise, join_date, active],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, message: 'Observer added successfully' });
        }
    );
});

// Add PUT endpoint for updating observers
app.put('/api/observers/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, organization, expertise, join_date, active } = req.body;
    
    // Create a query that only updates the fields that are provided
    let updateFields = [];
    let updateValues = [];
    
    if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
    }
    
    if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
    }
    
    if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
    }
    
    if (organization !== undefined) {
        updateFields.push('organization = ?');
        updateValues.push(organization);
    }
    
    if (expertise !== undefined) {
        updateFields.push('expertise = ?');
        updateValues.push(expertise);
    }
    
    if (join_date !== undefined) {
        updateFields.push('join_date = ?');
        updateValues.push(join_date);
    }
    
    if (active !== undefined) {
        updateFields.push('active = ?');
        updateValues.push(active);
    }
    
    // Add the ID to the values array
    updateValues.push(id);
    
    // If no fields to update, return an error
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Construct the query
    const query = `UPDATE observers SET ${updateFields.join(', ')} WHERE observer_id = ?`;
    
    console.log('Update query:', query);
    console.log('Update values:', updateValues);
    
    db.query(
        query,
        updateValues,
        (err, result) => {
            if (err) {
                console.error('Error updating observer:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Observer not found' });
                return;
            }
            res.json({ message: 'Observer updated successfully' });
        }
    );
});

// Census records routes
app.get('/api/census', (req, res) => {
    db.query(`
        SELECT cr.*, s.name as species_name, l.name as location_name, o.name as observer_name
        FROM census_records cr
        JOIN species s ON cr.species_id = s.species_id
        JOIN locations l ON cr.location_id = l.location_id
        JOIN observers o ON cr.observer_id = o.observer_id
    `, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/api/census', (req, res) => {
    const { species_id, location_id, observer_id, count, census_date, notes } = req.body;
    
    // Start a transaction
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                res.status(500).json({ error: err.message });
                return;
            }

            // Insert census record
            connection.query(
                'INSERT INTO census_records (species_id, location_id, observer_id, count, census_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [species_id, location_id, observer_id, count, census_date, notes],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    // Update species population count and last census date
                    connection.query(
                        'UPDATE species SET population_count = ?, last_census_date = ? WHERE species_id = ?',
                        [count, census_date, species_id],
                        (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }

                            // Commit the transaction
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: err.message });
                                    });
                                }

                                connection.release();
                                res.json({ id: result.insertId, message: 'Census record added successfully' });
                            });
                        }
                    );
                }
            );
        });
    });
});

// Update census record
app.put('/api/census/:id', (req, res) => {
    const { id } = req.params;
    const { species_id, location_id, observer_id, count, census_date } = req.body;
    
    // Start a transaction
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                res.status(500).json({ error: err.message });
                return;
            }

            // Update census record
            connection.query(
                'UPDATE census_records SET species_id = ?, location_id = ?, observer_id = ?, count = ?, census_date = ? WHERE record_id = ?',
                [species_id, location_id, observer_id, count, census_date, id],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    if (result.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).json({ error: 'Census record not found' });
                        });
                    }

                    // Update species population count and last census date
                    connection.query(
                        'UPDATE species SET population_count = ?, last_census_date = ? WHERE species_id = ?',
                        [count, census_date, species_id],
                        (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }

                            // Commit the transaction
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: err.message });
                                    });
                                }

                                connection.release();
                                res.json({ message: 'Census record updated successfully' });
                            });
                        }
                    );
                }
            );
        });
    });
});

// Conservation status history routes
app.get('/api/conservation-history/:species_id', (req, res) => {
    const { species_id } = req.params;
    
    // Validate species_id
    if (!species_id || isNaN(parseInt(species_id))) {
        return res.status(400).json({ error: 'Invalid species ID' });
    }
    
    // Check if the species exists first
    db.query('SELECT species_id FROM species WHERE species_id = ?', [species_id], (err, speciesResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }
        
        if (speciesResults.length === 0) {
            return res.status(404).json({ error: 'Species not found' });
        }
        
        // Now query the conservation history
        db.query(
            'SELECT * FROM conservation_status_history WHERE species_id = ? ORDER BY change_date DESC',
            [species_id],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error occurred' });
                }
                
                // Return empty array if no history found (not an error)
                res.json(results);
            }
        );
    });
});

app.post('/api/conservation-history', (req, res) => {
    const { species_id, previous_status, new_status, reason, changed_by } = req.body;
    
    // Validate required fields
    if (!species_id || !previous_status || !new_status) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'species_id, previous_status, and new_status are required'
        });
    }
    
    // Validate species_id
    if (isNaN(parseInt(species_id))) {
        return res.status(400).json({ error: 'Invalid species ID' });
    }
    
    // Validate status values
    const validStatuses = [
        'Extinct', 'Extinct in the Wild', 'Critically Endangered', 
        'Endangered', 'Vulnerable', 'Near Threatened', 
        'Least Concern', 'Data Deficient', 'Not Evaluated'
    ];
    
    if (!validStatuses.includes(previous_status) || !validStatuses.includes(new_status)) {
        return res.status(400).json({ 
            error: 'Invalid status value',
            details: 'Status must be one of: ' + validStatuses.join(', ')
        });
    }
    
    // Check if the species exists
    db.query('SELECT species_id FROM species WHERE species_id = ?', [species_id], (err, speciesResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }
        
        if (speciesResults.length === 0) {
            return res.status(404).json({ error: 'Species not found' });
        }
        
        // Start a transaction
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ error: 'Database connection error' });
            }
            
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    console.error('Transaction error:', err);
                    return res.status(500).json({ error: 'Transaction error' });
                }
                
                // Insert conservation history record
                connection.query(
                    'INSERT INTO conservation_status_history (species_id, previous_status, new_status, change_date, reason, changed_by) VALUES (?, ?, ?, NOW(), ?, ?)',
                    [species_id, previous_status, new_status, reason || null, changed_by || null],
                    (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error('Insert error:', err);
                                res.status(500).json({ error: 'Failed to insert conservation history record' });
                            });
                        }
                        
                        // Update species conservation status
                        connection.query(
                            'UPDATE species SET conservation_status = ? WHERE species_id = ?',
                            [new_status, species_id],
                            (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error('Update error:', err);
                                        res.status(500).json({ error: 'Failed to update species status' });
                                    });
                                }
                                
                                // Commit the transaction
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            console.error('Commit error:', err);
                                            res.status(500).json({ error: 'Failed to commit transaction' });
                                        });
                                    }
                                    
                                    connection.release();
                                    res.json({ 
                                        id: result.insertId, 
                                        message: 'Conservation status history record added successfully and species updated' 
                                    });
                                });
                            }
                        );
                    }
                );
            });
        });
    });
});

// Population density routes
app.get('/api/species/:id/population-density', (req, res) => {
    const { id } = req.params;
    db.query(
        'SELECT * FROM species_population_density WHERE species_id = ?',
        [id],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ error: 'Population density record not found' });
                return;
            }
            res.json(results[0]);
        }
    );
});

// Report generation route
app.get('/api/reports/census', (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    db.query(`
        SELECT 
            cr.record_id,
            cr.count,
            cr.census_date,
            cr.notes,
            s.name as species_name,
            l.name as location_name,
            o.name as observer_name
        FROM census_records cr
        JOIN species s ON cr.species_id = s.species_id
        JOIN locations l ON cr.location_id = l.location_id
        JOIN observers o ON cr.observer_id = o.observer_id
        WHERE cr.census_date BETWEEN ? AND ?
        ORDER BY cr.census_date DESC
    `, [start_date, end_date], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Growth rate calculation route
// Add this new endpoint for growth rate calculation
app.get('/api/species/:id/growth-rate', async (req, res) => {
    const speciesId = req.params.id;
    const months = parseInt(req.query.months) || 12;

    try {
        const [results] = await db.query(
            'SELECT calculate_growth_rate(?, ?) as growth_rate',
            [speciesId, months]
        );

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Could not calculate growth rate' });
        }

        res.json({ growth_rate: results[0].growth_rate });
    } catch (error) {
        console.error('Error calculating growth rate:', error);
        res.status(500).json({ 
            error: 'Error calculating growth rate',
            details: error.message 
        });
    }
});

// Add this new endpoint to get available census dates
app.get('/api/census/dates', (req, res) => {
    db.query('SELECT DISTINCT census_date FROM census_records ORDER BY census_date DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results.map(row => row.census_date));
    });
});

// Stored procedure for processing species data
app.post('/api/species/process', (req, res) => {
    db.query('CALL process_species_data()', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Species data processed successfully' });
    });
});

// Report generation route using stored procedure
app.get('/api/reports/census/detailed', (req, res) => {
    const { census_date } = req.query;
    
    if (!census_date) {
        return res.status(400).json({ error: 'Census date is required' });
    }

    console.log('Received census_date:', census_date);

    // Ensure the date is in YYYY-MM-DD format
    const formattedDate = new Date(census_date).toISOString().split('T')[0];
    console.log('Formatted census_date:', formattedDate);

    // First check if we have any records for this date
    db.query('SELECT COUNT(*) as count FROM census_records WHERE DATE(census_date) = DATE(?)', [formattedDate], (err, countResults) => {
        if (err) {
            console.error('Error checking census records:', err);
            return res.status(500).json({ error: err.message });
        }

        console.log('Count results:', countResults);

        if (countResults[0].count === 0) {
            return res.status(404).json({ error: 'No census records found for the selected date' });
        }

        // Call the generate_census_report stored procedure
        db.query('CALL generate_census_report(?)', [formattedDate], (err, results) => {
            if (err) {
                console.error('Error generating census report:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            
            console.log('Stored procedure results:', results);
            
            // The stored procedure returns results in the first element of the results array
            const reportData = results[0];
            
            if (!reportData || reportData.length === 0) {
                return res.status(404).json({ error: 'No data returned from report generation' });
            }
            
            res.json(reportData);
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});