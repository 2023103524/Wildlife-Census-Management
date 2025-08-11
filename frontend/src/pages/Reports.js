import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [populationDensity, setPopulationDensity] = useState([]);
  const [growthRates, setGrowthRates] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPopulationDensity();
    fetchGrowthRates();
  }, []);

  const fetchPopulationDensity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/species/population-density');
      console.log('Population density data:', response.data);
      // Parse numeric values from strings
      const parsedData = response.data.map(item => ({
        ...item,
        population_count: parseInt(item.population_count) || 0,
        total_area: parseFloat(item.total_area) || 0,
        population_density: parseFloat(item.population_density) || 0
      }));
      setPopulationDensity(parsedData);
    } catch (error) {
      console.error('Error fetching population density:', error);
      setError('Failed to fetch population density data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthRates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/species/growth-rates');
      console.log('Growth rates data:', response.data);
      
      // Check if we have valid data
      if (response.data && Array.isArray(response.data.species)) {
        // Parse numeric values to ensure they're numbers
        const parsedData = response.data.species.map(item => ({
          ...item,
          initial_population: parseInt(item.initial_population) || 0,
          current_population: parseInt(item.current_population) || 0,
          growth_rate: parseFloat(item.growth_rate) || 0
        }));
        
        console.log('Parsed growth rates data:', parsedData);
        setGrowthRates(parsedData);
      } else {
        console.error('Invalid growth rates data format:', response.data);
        setGrowthRates([]);
      }
    } catch (error) {
      console.error('Error fetching growth rates:', error);
      setError('Failed to fetch growth rates data. Please try again later.');
    }
  };

  // Format growth rate for display
  const formatGrowthRate = (rate) => {
    if (rate === null || isNaN(rate) || typeof rate !== 'number') return '0.00%';
    return `${rate.toFixed(2)}%`;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Population Density" />
          <Tab label="Growth Rates" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Population Density by Species
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : populationDensity.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No population density data available
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Species</TableCell>
                    <TableCell>Population Count</TableCell>
                    <TableCell>Total Area (hectares)</TableCell>
                    <TableCell>Density (animals/hectare)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {populationDensity.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.population_count}</TableCell>
                      <TableCell>{item.total_area.toFixed(2)}</TableCell>
                      <TableCell>{item.population_density.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Species Growth Rates
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : growthRates.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No growth rate data available
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Species</TableCell>
                    <TableCell>Initial Population</TableCell>
                    <TableCell>Current Population</TableCell>
                    <TableCell>Growth Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {growthRates.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.initial_population}</TableCell>
                      <TableCell>{item.current_population}</TableCell>
                      <TableCell>{formatGrowthRate(item.growth_rate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Reports;