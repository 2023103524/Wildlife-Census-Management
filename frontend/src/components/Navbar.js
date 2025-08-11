import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Pets as SpeciesIcon,
  LocationOn as LocationIcon,
  Assessment as CensusIcon,
  Description as ReportsIcon,
  People as ObserversIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Species', icon: <SpeciesIcon />, path: '/species' },
    { text: 'Locations', icon: <LocationIcon />, path: '/locations' },
    { text: 'Census', icon: <CensusIcon />, path: '/census' },
    { text: 'Observers', icon: <ObserversIcon />, path: '/observers' },
    { text: 'Conservation History', icon: <HistoryIcon />, path: '/conservation-history' },
    { text: 'User', icon: <ReportsIcon />, path: '/reports' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Wildlife Census
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.text}
              component={RouterLink}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
            >
              {item.text}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 