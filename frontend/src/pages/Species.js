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
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_ENDPOINTS = {
  species: `${API_BASE_URL}/api/species`,
};

const Species = () => {
  const [species, setSpecies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    conservation_status: 'Least Concern',
  });

  const conservationStatuses = [
    'Endangered',
    'Vulnerable',
    'Near Threatened',
    'Least Concern',
  ];

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.species);
      setSpecies(response.data);
    } catch (error) {
      console.error('Error fetching species:', error);
      setError('Failed to load species data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setEditingSpecies(null);
    setFormData({
      name: '',
      scientific_name: '',
      conservation_status: 'Least Concern',
    });
    setOpen(true);
  };

  const handleEdit = (species) => {
    setEditingSpecies(species);
    setFormData({
      name: species.name,
      scientific_name: species.scientific_name,
      conservation_status: species.conservation_status,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSpecies(null);
    setFormData({
      name: '',
      scientific_name: '',
      conservation_status: 'Least Concern',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingSpecies) {
        await axios.put(`${API_ENDPOINTS.species}/${editingSpecies.species_id}`, formData);
      } else {
        await axios.post(API_ENDPOINTS.species, formData);
      }
      await fetchSpecies();
      handleClose();
    } catch (error) {
      console.error('Error saving species:', error);
      setError('Failed to save species. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Species Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={loading}
        >
          Add Species
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Scientific Name</TableCell>
                <TableCell>Conservation Status</TableCell>
                <TableCell>Population Count</TableCell>
                <TableCell>Last Census Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {species.map((item) => (
                <TableRow key={item.species_id}>
                  <TableCell>{item.species_id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.scientific_name}</TableCell>
                  <TableCell>{item.conservation_status}</TableCell>
                  <TableCell>{item.population_count || 0}</TableCell>
                  <TableCell>{item.last_census_date || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleEdit(item)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingSpecies ? 'Edit Species' : 'Add New Species'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Species Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Scientific Name"
                name="scientific_name"
                value={formData.scientific_name}
                onChange={handleChange}
                margin="normal"
                disabled={loading}
              />
              <TextField
                fullWidth
                select
                label="Conservation Status"
                name="conservation_status"
                value={formData.conservation_status}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
              >
                {conservationStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editingSpecies ? 'Save Changes' : 'Add Species'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Species; 