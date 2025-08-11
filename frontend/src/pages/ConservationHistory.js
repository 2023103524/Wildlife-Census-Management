import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Snackbar,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_ENDPOINTS = {
  species: `${API_BASE_URL}/api/species`,
  conservationHistory: `${API_BASE_URL}/api/conservation-history`,
};

// Maximum number of retries for API requests
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;

const CONSERVATION_STATUSES = [
  'Extinct',
  'Extinct in the Wild',
  'Critically Endangered',
  'Endangered',
  'Vulnerable',
  'Near Threatened',
  'Least Concern',
  'Data Deficient',
  'Not Evaluated',
];

const ConservationHistory = () => {
  const [species, setSpecies] = useState([]);
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    species_id: '',
    previous_status: '',
    new_status: '',
    reason: '',
    changed_by: '',
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  useEffect(() => {
    if (selectedSpecies) {
      fetchHistory();
    }
  }, [selectedSpecies]);

  // Helper function to retry failed API requests
  const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying request, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  };

  const fetchSpecies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await retryRequest(() => axios.get(API_ENDPOINTS.species));
      setSpecies(response.data);
    } catch (error) {
      console.error('Error fetching species:', error);
      let errorMessage = 'Failed to load species data.';
      
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 404) {
          errorMessage = 'Species data not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Error: ${error.response.data.error}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await retryRequest(() => 
        axios.get(`${API_ENDPOINTS.conservationHistory}/${selectedSpecies}`)
      );
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching conservation history:', error);
      
      if (error.response && error.response.status === 404) {
        setHistory([]); // No history found for this species
      } else {
        let errorMessage = 'Failed to load conservation history.';
        
        if (error.response) {
          if (error.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = `Error: ${error.response.data.error}`;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your connection.';
        }
        
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      species_id: selectedSpecies,
      previous_status: '',
      new_status: '',
      reason: '',
      changed_by: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate form data
    if (!formData.species_id || !formData.previous_status || !formData.new_status) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    
    try {
      await retryRequest(() => axios.post(API_ENDPOINTS.conservationHistory, formData));
      setSnackbar({
        open: true,
        message: 'Conservation status change recorded successfully.',
        severity: 'success'
      });
      fetchHistory();
      handleClose();
    } catch (error) {
      console.error('Error saving conservation history:', error);
      let errorMessage = 'Failed to save conservation history.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || 'Invalid data provided.';
        } else if (error.response.status === 404) {
          errorMessage = 'Species not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Error: ${error.response.data.error}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpeciesChange = (e) => {
    const speciesId = e.target.value;
    setSelectedSpecies(speciesId);
    setFormData(prev => ({
      ...prev,
      species_id: speciesId,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Conservation Status History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Select Species"
            value={selectedSpecies}
            onChange={handleSpeciesChange}
            disabled={loading}
          >
            {species.map((species) => (
              <MenuItem key={species.species_id} value={species.species_id}>
                {species.name} ({species.scientific_name})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            disabled={!selectedSpecies || loading}
            fullWidth
          >
            Add Status Change
          </Button>
        </Grid>
      </Grid>

      {selectedSpecies && (
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : history.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Previous Status</TableCell>
                  <TableCell>New Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Changed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.history_id}>
                    <TableCell>{new Date(record.change_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.previous_status}</TableCell>
                    <TableCell>{record.new_status}</TableCell>
                    <TableCell>{record.reason}</TableCell>
                    <TableCell>{record.changed_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No conservation history found for this species.</Typography>
            </Box>
          )}
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Conservation Status Change</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Previous Status"
              name="previous_status"
              value={formData.previous_status}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            >
              {CONSERVATION_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="New Status"
              name="new_status"
              value={formData.new_status}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            >
              {CONSERVATION_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Changed By"
              name="changed_by"
              value={formData.changed_by}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConservationHistory; 