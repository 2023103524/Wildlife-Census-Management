const mysql = require('mysql2');
const db = require('../config');

const locationsData = [
  { name: 'Sundarbans National Park', region: 'West Bengal, India', coordinates: { lat: 21.9497, lng: 88.9404 }, area_hectares: 1330 },
  { name: 'Serengeti National Park', region: 'Tanzania', coordinates: { lat: -2.1540, lng: 34.6857 }, area_hectares: 14763 },
  { name: 'Wolong National Nature Reserve', region: 'Sichuan, China', coordinates: { lat: 30.9867, lng: 103.0000 }, area_hectares: 2000 },
  { name: 'Pacific Ocean Sanctuary', region: 'International Waters', coordinates: { lat: 0.0000, lng: -160.0000 }, area_hectares: 15000000 },
  { name: 'Virunga National Park', region: 'Democratic Republic of Congo', coordinates: { lat: -1.6833, lng: 29.5500 }, area_hectares: 7800 }
];

// Function to check and fix coordinates
const fixCoordinates = () => {
  return new Promise((resolve, reject) => {
    // First, check for locations with null coordinates
    db.query('SELECT location_id, name FROM locations WHERE coordinates IS NULL', (err, results) => {
      if (err) {
        console.error('Error checking for null coordinates:', err);
        reject(err);
        return;
      }

      if (results.length === 0) {
        console.log('No locations with null coordinates found.');
        resolve();
        return;
      }

      console.log(`Found ${results.length} locations with null coordinates.`);
      
      // For each location with null coordinates, set default coordinates
      const updatePromises = results.map(location => {
        return new Promise((resolve, reject) => {
          // Set default coordinates (0, 0) for locations with null coordinates
          db.query(
            'UPDATE locations SET coordinates = POINT(0, 0) WHERE location_id = ?',
            [location.location_id],
            (err, result) => {
              if (err) {
                console.error(`Error updating location ${location.name}:`, err);
                reject(err);
                return;
              }
              console.log(`Updated location ${location.name} with default coordinates.`);
              resolve(result);
            }
          );
        });
      });

      Promise.all(updatePromises)
        .then(() => {
          console.log('All locations with null coordinates have been fixed.');
          resolve();
        })
        .catch(err => {
          console.error('Error fixing coordinates:', err);
          reject(err);
        });
    });
  });
};

// Function to verify coordinates are properly stored
const verifyCoordinates = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT location_id, name, ST_X(coordinates) as lng, ST_Y(coordinates) as lat FROM locations', (err, results) => {
      if (err) {
        console.error('Error verifying coordinates:', err);
        reject(err);
        return;
      }

      console.log('Location coordinates verification:');
      results.forEach(location => {
        console.log(`${location.name}: lat=${location.lat}, lng=${location.lng}`);
      });

      resolve();
    });
  });
};

// Main function
const main = async () => {
  try {
    await fixCoordinates();
    await verifyCoordinates();
    console.log('Coordinates check and fix completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error in coordinates check and fix:', error);
    process.exit(1);
  }
};

// Run the script
main(); 