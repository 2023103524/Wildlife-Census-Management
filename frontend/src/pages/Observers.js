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
  FormControlLabel,
  Switch,
  Alert,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const Observers = () => {
  const [observers, setObservers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedObserver, setSelectedObserver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    expertise: '',
    join_date: new Date(),
    active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchObservers();
  }, []);

  const fetchObservers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/observers');
      setObservers(response.data);
    } catch (error) {
      console.error('Error fetching observers:', error);
    }
  };

  const handleOpen = (observer = null) => {
    if (observer) {
      setSelectedObserver(observer);
      setFormData({
        name: observer.name,
        email: observer.email,
        phone: observer.phone || '',
        organization: observer.organization,
        expertise: observer.expertise || '',
        join_date: new Date(observer.join_date),
        active: observer.active,
      });
    } else {
      setSelectedObserver(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        expertise: '',
        join_date: new Date(),
        active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedObserver(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the join_date as YYYY-MM-DD for the server
      const formattedData = {
        ...formData,
        join_date: formData.join_date instanceof Date 
          ? formData.join_date.toISOString().split('T')[0] 
          : formData.join_date
      };
      
      if (selectedObserver) {
        await axios.put(`http://localhost:5000/api/observers/${selectedObserver.observer_id}`, formattedData);
      } else {
        await axios.post('http://localhost:5000/api/observers', formattedData);
      }
      fetchObservers();
      handleClose();
    } catch (error) {
      console.error('Error saving observer:', error);
      setError('An error occurred while saving the observer.');
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'active' ? checked : value,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Observers
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Add New Observer
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Expertise</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {observers.map((observer) => (
              <TableRow key={observer.observer_id}>
                <TableCell>{observer.name}</TableCell>
                <TableCell>{observer.email}</TableCell>
                <TableCell>{observer.phone || '-'}</TableCell>
                <TableCell>{observer.organization}</TableCell>
                <TableCell>{observer.expertise || '-'}</TableCell>
                <TableCell>{new Date(observer.join_date).toLocaleDateString()}</TableCell>
                <TableCell>{observer.active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(observer)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{selectedObserver ? 'Edit Observer' : 'Add New Observer'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Join Date"
                name="join_date"
                type="date"
                value={formData.join_date}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedObserver ? 'Save Changes' : 'Add Observer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Observers; 