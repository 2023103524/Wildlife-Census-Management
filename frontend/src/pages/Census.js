import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const Census = () => {
  const [censusRecords, setCensusRecords] = useState([]);
  const [species, setSpecies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [observers, setObservers] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    species_id: '',
    location_id: '',
    observer_id: '',
    count: '',
    census_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [censusRes, speciesRes, locationsRes, observersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/census'),
        axios.get('http://localhost:5000/api/species'),
        axios.get('http://localhost:5000/api/locations'),
        axios.get('http://localhost:5000/api/observers'),
      ]);
      
      console.log('Species data:', speciesRes.data);
      console.log('Locations data:', locationsRes.data);
      console.log('Observers data:', observersRes.data);
      
      setCensusRecords(censusRes.data);
      setSpecies(speciesRes.data);
      setLocations(locationsRes.data);
      setObservers(observersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setEditingRecord(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setEditingRecord(null);
    setFormData({
      species_id: '',
      location_id: '',
      observer_id: '',
      count: '',
      census_date: '',
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      species_id: record.species_id,
      location_id: record.location_id,
      observer_id: record.observer_id,
      count: record.count.toString(),
      census_date: new Date(record.census_date).toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.species_id) {
      setError('Please select a species');
      return false;
    }
    if (!formData.location_id) {
      setError('Please select a location');
      return false;
    }
    if (!formData.observer_id) {
      setError('Please select an observer');
      return false;
    }
    if (!formData.count || formData.count <= 0) {
      setError('Please enter a valid count');
      return false;
    }
    if (!formData.census_date) {
      setError('Please select a census date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Format the date to YYYY-MM-DD
      const formattedDate = new Date(formData.census_date).toISOString().split('T')[0];
      
      const submitData = {
        ...formData,
        census_date: formattedDate,
        count: parseInt(formData.count)
      };

      if (editingRecord) {
        // Update existing record
        await axios.put(`http://localhost:5000/api/census/${editingRecord.record_id}`, submitData);
      } else {
        // Add new record
        await axios.post('http://localhost:5000/api/census', submitData);
      }
      
      await fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving census record:', error);
      setError(error.response?.data?.error || 'Error saving census record. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Census Records
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Census Record
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Species</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Observer</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {censusRecords.map((record) => (
              <TableRow key={record.record_id}>
                <TableCell>{record.species_name}</TableCell>
                <TableCell>{record.location_name}</TableCell>
                <TableCell>{record.count}</TableCell>
                <TableCell>{new Date(record.census_date).toLocaleDateString()}</TableCell>
                <TableCell>{record.observer_name}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary"
                    onClick={() => handleEdit(record)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingRecord ? 'Edit Census Record' : 'Add New Census Record'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Species"
                name="species_id"
                value={formData.species_id}
                onChange={handleChange}
                margin="normal"
                required
              >
                {species.map((item) => (
                  <MenuItem key={item.species_id} value={item.species_id}>
                    {item.name} ({item.scientific_name})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Location"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                margin="normal"
                required
              >
                {locations.map((item) => (
                  <MenuItem key={item.location_id} value={item.location_id}>
                    {item.name} ({item.region})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Observer"
                name="observer_id"
                value={formData.observer_id}
                onChange={handleChange}
                margin="normal"
                required
              >
                {observers.map((item) => (
                  <MenuItem key={item.observer_id} value={item.observer_id}>
                    {item.name} ({item.organization})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Count"
                name="count"
                type="number"
                value={formData.count}
                onChange={handleChange}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Census Date"
                name="census_date"
                type="date"
                value={formData.census_date}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingRecord ? 'Save Changes' : 'Add Record'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Census; 