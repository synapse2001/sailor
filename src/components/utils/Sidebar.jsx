import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, ListItemIcon, Box, Snackbar, Typography, Divider } from '@mui/material';
import { Close as CloseIcon, AccountCircle, Settings, Refresh, ShoppingCart, Logout } from '@mui/icons-material';
import { useFirebase, auth } from '../../context/Firebase';
import boatImage from '../../assets/images/sailor.png';

const Sidebar = ({ orderpage, open, onClose }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const firebase = useFirebase();

  const handleSnackbarOpen = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const openOrderPage = () => {
    onClose();
    orderpage();
  }

  const refreshProducts = async () => {
    try {
      await firebase.fetchProducts(true);
      handleSnackbarOpen('Product data refreshed successfully');
    } catch (error) {
      handleSnackbarOpen('Failed to refresh product data');
    }
  }

  const handleLogout = () => {
    firebase.logOut(auth);
  }

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, p: 2 }}>
        <IconButton onClick={onClose} sx={{ mb: 2 }}>
          <CloseIcon color='primary' />
        </IconButton>
        <List>
          <ListItem button onClick={openOrderPage}>
            <Box sx={{ display: 'flex', alignItems: 'center',mb:'40px' }}>
              <img src={boatImage} alt="boat" style={{ width: '50px', height: '50px' }} />
              <Typography
                variant="h4"
                sx={{ fontFamily: 'Raleway', color: '#fcf8ca', marginLeft: '16px' }}
              >
                Sailor
              </Typography>
            </Box>
          </ListItem>
          <ListItem button onClick={openOrderPage}>
            <ListItemIcon>
              <ShoppingCart color='primary' />
            </ListItemIcon>
            <ListItemText primary="My Orders" />
          </ListItem>
          <ListItem button onClick={refreshProducts}>
            <ListItemIcon>
              <Refresh color='primary' />
            </ListItemIcon>
            <ListItemText primary="Refresh Product Data" />
          </ListItem>
          <ListItem button onClick={() => handleSnackbarOpen('Under Development')}>
            <ListItemIcon>
              <AccountCircle color='primary' />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem button onClick={() => handleSnackbarOpen('Under Development')}>
            <ListItemIcon>
              <Settings color='primary' />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <Logout color='primary' />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Drawer>
  );
};

export default Sidebar;