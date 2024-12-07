import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Autocomplete,
  Paper
} from '@mui/material';
import { useFirebase } from '../../context/Firebase';

const PopupAdditionalDetails = ({ open, onClose, onSubmit }) => {
  const [customerData, setCustomerData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  const firebase = useFirebase();

  // Fetch customers from Firebase
  useEffect(() => {
    if(open){
    const fetchCustomers = async () => {
      try {
        const data = await firebase.fetchData('customers');
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCustomerData(formattedData);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomers();
  }
  }, [firebase, open]);

  // useEffect(() => {
  //   if(open){
  //   setSelectedCustomer(null);
  //   setOrderNote('');}
  // }, [open]);

  // Handle form submission
  const handleSubmit = () => {
    if (selectedCustomer) {
      onSubmit({
        customerId: selectedCustomer.id,
        // customerName: selectedCustomer.customerName,
        // customerContact: selectedCustomer.customerPhone,
        // customerAddress: selectedCustomer.customerAddress,
        orderNote,
      });
      onClose();
    } else {
      console.error('Please select a customer.');
    }
  };

  const handleNameChange = (event, newValue) => {
    setSelectedCustomer(newValue);
  };

  const handleEmailChange = (event, newValue) => {
    setSelectedCustomer(newValue);
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select Customer</DialogTitle>
      <DialogContent>
        {/* Autocomplete for Customer Name */}
        <Autocomplete
        options={customerData}
        getOptionLabel={(option) => option.customerName}
        value={selectedCustomer}
        onChange={handleNameChange}
        renderInput={(params) => <TextField {...params} label="Customer Name" margin="dense" inputProps={{
          ...params.inputProps,
          autoComplete: 'new-password',
          role: 'presentation' 
        }}/>}
        PaperComponent={(props) => (
          <Paper {...props} style={{ backgroundColor: '#333', color: '#fff', elevation: 3 }} />
        )}
      />
      
      {/* Autocomplete for Customer Email */}
      <Autocomplete
        options={customerData}
        getOptionLabel={(option) => option.customerEmail}
        value={selectedCustomer}
        onChange={handleEmailChange}
        renderInput={(params) => <TextField {...params} label="Customer Email" margin="dense"inputProps={{
          ...params.inputProps,
          autoComplete: 'new-password', // Disable browser autocomplete
          role: 'presentation' // Prevent autofill
        }}/>}
        PaperComponent={(props) => (
          <Paper {...props} style={{ backgroundColor: '#333', color: '#fff', elevation: 3 }} />
        )}
      />

        {/* Pre-filled Fields */}
        <TextField
          margin="dense"
          label="Contact Number"
          type="text"
          fullWidth
          value={selectedCustomer?.customerPhone || ''}
          disabled
        />
        <TextField
          margin="dense"
          label="Address"
          type="text"
          fullWidth
          value={selectedCustomer?.customerAddress || ''}
          disabled
        />

        {/* Order Remarks */}
        <TextField
          margin="dense"
          label="Order Remarks"
          type="text"
          fullWidth
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={!selectedCustomer}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupAdditionalDetails;
