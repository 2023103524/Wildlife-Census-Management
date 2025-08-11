import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Pets as SpeciesIcon,
  LocationOn as LocationIcon,
  Assessment as CensusIcon,
  TrendingUp as GrowthIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSpecies: 0,
    totalLocations: 0,
    totalCensus: 0,
    averageGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [speciesData, setSpeciesData] = useState([]);
  const [growthRates, setGrowthRates] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [censusData, setCensusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data from backend...');
        
        const [speciesResponse, growthRatesResponse, locationsResponse, censusResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/species'),
          axios.get('http://localhost:5000/api/species/growth-rates'),
          axios.get('http://localhost:5000/api/locations'),
          axios.get('http://localhost:5000/api/census')
        ]);
        
        console.log('Species data:', speciesResponse.data);
        console.log('Growth rates data:', growthRatesResponse.data);
        console.log('Locations data:', locationsResponse.data);
        console.log('Census data:', censusResponse.data);
        
        setSpeciesData(speciesResponse.data);
        setGrowthRates(growthRatesResponse.data);
        setLocationsData(locationsResponse.data);
        setCensusData(censusResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        let errorMessage = 'Failed to fetch dashboard data';
        
        if (error.response) {
          if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          errorMessage = 'No response from server. Please check if the server is running.';
          console.error('No response received:', error.request);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate total species
  const totalSpecies = speciesData.length;

  // Calculate total locations
  const totalLocations = locationsData.length;

  // Calculate total census records
  const totalCensus = censusData.length;

  // Get average growth rate from the backend response
  const averageGrowthRate = growthRates && growthRates.averageGrowthRate !== undefined
    ? growthRates.averageGrowthRate
    : 0;

  // Format growth rate for display
  const formatGrowthRate = (rate) => {
    if (rate === null || isNaN(rate)) return '0.00%';
    return `${rate.toFixed(2)}%`;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <CircularProgress size={24} />
        ) : error ? (
          <Typography color="error">Error loading data</Typography>
        ) : (
          <Typography variant="h4" component="div" color={color}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Species"
            value={totalSpecies}
            icon={<SpeciesIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Locations"
            value={totalLocations}
            icon={<LocationIcon color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Census Records"
            value={totalCensus}
            icon={<CensusIcon color="success" />}
            color="success"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 