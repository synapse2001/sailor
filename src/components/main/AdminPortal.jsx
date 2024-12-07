import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, Button, Typography, Divider } from '@mui/material';
import UserManagement from '../admin/user/UserManagement';
import OrderManagement from '../admin/order/OrderManagement';
import ProductManagement from '../admin/product/ProductManagement';
import CustomerManagement from '../admin/customer/CustomerManagement';
import { useFirebase, auth } from '../../context/Firebase';
import boatImage from '../../assets/images/sailor.png';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPortal = () => {
  const [value, setValue] = useState(0);
  const firebase = useFirebase();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogout = () => {
    firebase.logOut(auth);
  };

  return (
    <Container
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    bgcolor: 'background.default',
    color: 'text.primary',
    paddingTop: 2,
  }}
>
  <Box
    sx={{
      width: '100%',
      maxWidth: '1200px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      minWidth: '90vw',
      minHeight: '40vw',
      padding: 2,
    }}
  >
    {/* Logo and Title aligned to top-left */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img src={boatImage} alt="boat" style={{ width: '60px', height: '60px' }} />
      <Typography
        variant="h3"
        sx={{ fontFamily: 'Raleway', color: '#fcf8ca', marginLeft: '16px' }}
      >
        Sailor
      </Typography>
    </Box>
      <Divider orientation="horizontal"  color ='#fcf8ca'/>

    {/* Tabs and Logout Button */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs" textColor="primary" indicatorColor="primary">
        <Tab label="User Management" />
        <Tab label="Order Management" />
        <Tab label="Customer Management" />
        <Tab label="Product Management" />
      </Tabs>
      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{ borderRadius: '8px', bgcolor: 'error.main',marginRight:'16px' }}
      >
        <Typography style={{ color: 'black' }}>Logout</Typography>
      </Button>
    </Box>

    {/* Tab Panels */}
    <TabPanel value={value} index={0}>
      <UserManagement />
    </TabPanel>
    <TabPanel value={value} index={1}>
      <OrderManagement />
    </TabPanel>
    <TabPanel value={value} index={2}>
      <CustomerManagement />
    </TabPanel>
    <TabPanel value={value} index={3}>
      <ProductManagement />
    </TabPanel>
  </Box>
</Container>

  );
}

export default AdminPortal;