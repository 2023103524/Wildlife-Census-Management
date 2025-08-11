const axios = require('axios');

console.log('Testing growth rates endpoint...');

async function testEndpoint() {
  try {
    console.log('Making request to http://localhost:5000/api/species/growth-rates');
    const response = await axios.get('http://localhost:5000/api/species/growth-rates');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoint(); 