import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    coordinates: { lat: '', lng: '' },
    area_hectares: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      console.log('Fetched locations:', response.data);
      
      // Ensure all locations have valid coordinates
      const locationsWithValidCoords = response.data.map(location => {
        if (!location.coordinates) {
          console.warn(`Location ${location.name} has no coordinates object`);
          return {
            ...location,
            coordinates: { lat: 0, lng: 0 }
          };
        }
        
        if (location.coordinates.lat === null || location.coordinates.lng === null) {
          console.warn(`Location ${location.name} has null coordinates`);
          return {
            ...location,
            coordinates: {
              lat: location.coordinates.lat === null ? 0 : location.coordinates.lat,
              lng: location.coordinates.lng === null ? 0 : location.coordinates.lng
            }
          };
        }
        
        return location;
      });
      
      setLocations(locationsWithValidCoords);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleOpen = (location = null) => {
    if (location) {
      console.log('Opening location for edit:', location);
      setSelectedLocation(location);
      setFormData({
        name: location.name,
        region: location.region,
        coordinates: location.coordinates || { lat: '', lng: '' },
        area_hectares: location.area_hectares,
      });
    } else {
      setSelectedLocation(null);
      setFormData({
        name: '',
        region: '',
        coordinates: { lat: '', lng: '' },
        area_hectares: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocation(null);
    setFormData({
      name: '',
      region: '',
      coordinates: { lat: '', lng: '' },
      area_hectares: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate coordinates
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      alert('Please enter both latitude and longitude');
      return;
    }
    
    // Convert coordinates to numbers
    const lat = parseFloat(formData.coordinates.lat);
    const lng = parseFloat(formData.coordinates.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Latitude and longitude must be valid numbers');
      return;
    }
    
    // Update formData with parsed coordinates
    const updatedFormData = {
      ...formData,
      coordinates: {
        lat: lat,
        lng: lng
      }
    };
    
    try {
      if (selectedLocation) {
        await axios.put(`http://localhost:5000/api/locations/${selectedLocation.location_id}`, updatedFormData);
      } else {
        await axios.post('http://localhost:5000/api/locations', updatedFormData);
      }
      fetchLocations();
      handleClose();
    } catch (error) {
      console.error('Error saving location:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Failed to save location. Please try again.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Location Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Location
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Coordinates</TableCell>
              <TableCell>Area (Hectares)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((item) => (
              <TableRow key={item.location_id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.region}</TableCell>
                <TableCell>
                  {item.coordinates && 
                    (item.coordinates.lat !== null && item.coordinates.lng !== null) && 
                    (item.coordinates.lat !== 0 || item.coordinates.lng !== 0)
                    ? `${parseFloat(item.coordinates.lat).toFixed(4)}, ${parseFloat(item.coordinates.lng).toFixed(4)}` 
                    : 'Coordinates not available'}
                </TableCell>
                <TableCell>{item.area_hectares}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpen(item)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Location Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="lat"
                value={formData.coordinates.lat}
                onChange={handleChange}
                margin="normal"
                type="number"
                required
              />
              <TextField
                fullWidth
                label="Longitude"
                name="lng"
                value={formData.coordinates.lng}
                onChange={handleChange}
                margin="normal"
                type="number"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Area (Hectares)"
              name="area_hectares"
              value={formData.area_hectares}
              onChange={handleChange}
              margin="normal"
              type="number"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedLocation ? 'Update Location' : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Locations; 