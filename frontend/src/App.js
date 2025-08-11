import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Species from './pages/Species';
import Locations from './pages/Locations';
import Census from './pages/Census';
import Reports from './pages/Reports';
import Observers from './pages/Observers';
import ConservationHistory from './pages/ConservationHistory';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/species" element={<Species />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/census" element={<Census />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/observers" element={<Observers />} />
              <Route path="/conservation-history" element={<ConservationHistory />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
