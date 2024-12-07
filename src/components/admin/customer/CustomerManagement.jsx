import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFirebase } from '../../../context/Firebase';
import { nanoid } from 'nanoid';
import PopupAlterCustomer from './PopupAlterCustomer';

const columns = (theme) => [
  { field: 'id', headerName: 'Customer ID', width: 150 },
  { field: 'customerName', headerName: 'Name', width: 150, editable: true },
  { field: 'customerEmail', headerName: 'Email', width: 200, editable: true },
  { field: 'customerPhone', headerName: 'Phone', width: 150, editable: true },
  { field: 'customerAddress', headerName: 'Address', width: 250, editable: true },
  { field: 'customerCode', headerName: 'Customer Code', width: 150 },
  { field: 'customerAreaCode', headerName: 'Area Code', width: 150 },
  {
    field: 'customerCreditWorthy',
    headerName: 'Credit Worthy',
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value ? 'Yes' : 'No'}
        color={params.value ? 'success' : 'error'}
        variant="filled"
      />
    ),
  },
  { field: 'customerPaymentTerms', headerName: 'Payment Terms', width: 150 },
  { field: 'customerType', headerName: 'Customer Type', width: 150 },
  { field: 'taxId', headerName: 'TAX ID', width: 150 },
  {
    field: 'accountCreationDate',
    headerName: 'Created On',
    width: 150,
    renderCell: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '-',
  },
  {
    field: 'accountUpdateDate',
    headerName: 'Updated On',
    width: 150,
    renderCell: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '-',
  },
  { field: 'customerStatus', 
    headerName: 'Status', 
    width: 100,
    renderCell: (params) => (
      <Chip
        label={params.value === 'Active' ? 'Active' : 'Inactive'}
        color={params.value === 'Active' ? 'success' : 'error'}
        variant="filled"
      />
    ),
  },
  { field: 'preferredContactMethod', headerName: 'Contact Method', width: 150 },
  { field: 'preferredPaymentMethod', headerName: 'Payment Method', width: 150 },
  {
    field: 'outstandingBalance',
    headerName: 'Outstanding Balance',
    width: 150,
    type: 'number',
    // renderCell: (params) => (
    //   <Typography
    //     variant="body2"
    //     sx={{
    //       fontWeight: 'bold',
    //       color: params.value > 0 ? theme.palette.error.main : theme.palette.success.main,
    //     }}
    //   >
    //     {params.value.toFixed(2)}
    //   </Typography>
    // ),
  },
  {
    field: 'loyaltyProgramMember',
    headerName: 'Loyalty Member',
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value ? 'Yes' : 'No'}
        color={params.value ? 'success' : 'error'}
        variant="filled"
      />
    ),
  },
  { field: 'notes', headerName: 'Notes', width: 300 },
];

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState(null);
  const [openAlterCustomerDialog, setOpenAlterCustomerDialog] = useState(false);
  const firebase = useFirebase();
  const theme = useTheme();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const customerData = await firebase.fetchData('customers');
      const formattedCustomers = Object.keys(customerData).map((key) => ({
        id: key,
        ...customerData[key],
      }));
      setCustomers(formattedCustomers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
    setOpenAlterCustomerDialog(true);
  };

  const handleCloseAlterCustomerDialog = () => {
    setEditCustomer(null);
    setOpenAlterCustomerDialog(false);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (customerData.id) {
        // Edit existing customer
        customerData.accountUpdateDate = new Date().toISOString();
        const updatedCustomers = customers.map((customer) =>
          customer.id === customerData.id ? customerData : customer
        );
        setCustomers(updatedCustomers);
        await firebase.putData(`customers/${customerData.id}`, customerData);
      } else {
        // Add new customer
        const newCustomerId = nanoid(11); // Generate a unique ID using nanoid
        customerData.accountCreationDate = new Date().toISOString();
        const newCustomerData = { id: newCustomerId, ...customerData };
        setCustomers([...customers, newCustomerData]);
        await firebase.putData(`customers/${newCustomerId}`, newCustomerData);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
    handleCloseAlterCustomerDialog();
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', color: theme.palette.black.main }}
          onClick={() => setOpenAlterCustomerDialog(true)}
        >
          Add Customer
        </Button>
      </Box>
      <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns(theme)}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          onRowDoubleClick={(params) => handleEditCustomer(params.row)}
          sx={{
            '& .MuiDataGrid-menuIconButton': {
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-sortIcon': {
              color: theme.palette.primary.main,
            },
            // Add border color customization
            border: `1px solid ${theme.palette.primary.main}`,
            '& .MuiDataGrid-cell': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-columnHeaders': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-columnSeparator': {
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-row': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.primary.main}`,
            }
          }}
          loading={loading}
        />
      </Box>
      <PopupAlterCustomer
        open={openAlterCustomerDialog}
        handleClose={handleCloseAlterCustomerDialog}
        customerData={editCustomer}
        handleSave={handleSaveCustomer}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', color: theme.palette.black.main }}
          onClick={fetchCustomers}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerManagement;
