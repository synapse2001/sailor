import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip, Typography, TextField, MenuItem, FormControl,Select,InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFirebase } from '../../../context/Firebase';
import { nanoid } from 'nanoid';
import PopupProductDetails from './PopupAlterOrder';
import PopupAlterOrder from './PopupAlterOrder';

// Columns for the DataGrid, including the new fields
const columns = (theme, handleOpenProductDetails) => [
  { field: 'orderId', headerName: 'Order ID', width: 150 },
  { field: 'created_by_name', headerName: 'Created By', width: 200 },
  { field: 'customerName', headerName: 'Customer Name', width: 200 },
  { field: 'order_type', headerName: 'Order Type', width: 150 },
  { field: 'updated_by_name', headerName: 'Updated By', width: 200 },
  { field: 'orderNote', headerName: 'Order Note', width: 200 },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value === 'pending' ? 'Pending' : params.value === 'cancelled' ? 'Cancelled' : 'Completed'}
        color={params.value === 'pending' ? 'warning' : params.value === 'cancelled' ? 'error' : 'success'}
        variant="filled"
      />
    ),
  },
  {
    field: 'orderWorkList',
    headerName: 'Product List',
    width: 200,
    renderCell: (params) => {
      // A button to open the product details popup
      return (
        <Button
          variant="outlined"
          onClick={() => handleOpenProductDetails(params.row.orderWorkList[params.row.orderId])}
        >
          View Products
        </Button>
      );
    },
  },
  {
    field: 'createdOn',
    headerName: 'Created On',
    width: 150,
    renderCell: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '-',
  },
  {
    field: 'updatedOn',
    headerName: 'Updated On',
    width: 150,
    renderCell: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '-',
  },
];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [formattedOrders, setFormattedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openProductDetails, setOpenProductDetails] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const firebase = useFirebase();
  const theme = useTheme();
  const [openOrderPopup, setOpenOrderPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New state for search and filter
  const [searchOrderId, setSearchOrderId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Updated useEffect to apply filters
  useEffect(() => {
    applyFilters();
  }, [formattedOrders, searchOrderId, statusFilter]);

  // New method to apply filters
  const applyFilters = () => {
    let result = formattedOrders;

    // Filter by Order ID (case-insensitive partial match)
    if (searchOrderId) {
      result = result.filter(order =>
        order.orderId.toLowerCase().includes(searchOrderId.toLowerCase())
      );
    }

    // Filter by Status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  };

  const getCustomerDetails = async (customerIds) => {
    try {
      const customerData = await Promise.all(
        customerIds.map(async (customerId) => {
          const data = await firebase.fetchData(`customers/${customerId}`);
          return { [customerId]: data };
        })
      );
      return customerData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const getUserDetails = async (userIds) => {
    try {
      const userData = await Promise.all(
        userIds.map(async (userId) => {
          const data = await firebase.fetchData(`users/${userId}`);
          return { [userId]: data };
        })
      );
      return userData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const orderData = await firebase.fetchData('orders');
      setOrders(orderData);
      const customerIds = new Set();
      const userIds = new Set();

      Object.keys(orderData).forEach((key) => {
        customerIds.add(orderData[key].additionalDetails.customerId);
        userIds.add(orderData[key].additionalDetails.created_by);
        userIds.add(orderData[key].additionalDetails.ordered_by);
        userIds.add(orderData[key].additionalDetails.updated_by);
      });

      const customerData = await getCustomerDetails([...customerIds]);
      const userData = await getUserDetails([...userIds]);

      setUserDetails(userData);
      setCustomerDetails(customerData);

      const formattedOrders = Object.keys(orderData).map((key) => ({
        id: key, // Required for DataGrid
        orderId: orderData[key].orderId,
        created_by: orderData[key].additionalDetails.created_by,
        created_by_name: userData[orderData[key].additionalDetails.created_by]?.name || 'N/A',
        customerName: customerData[orderData[key].additionalDetails.customerId]?.customerName || 'N/A',
        customerId: orderData[key].additionalDetails.customerId || 'N/A',
        orderNote: orderData[key].additionalDetails.orderNote || 'N/A',
        order_type: orderData[key].additionalDetails.order_type,
        updated_by: orderData[key].additionalDetails.updated_by,
        updated_by_name: userData[orderData[key].additionalDetails.updated_by]?.name || 'N/A',
        status: orderData[key].status,
        createdOn: orderData[key].createdOn,
        updatedOn: orderData[key].updatedOn,
        orderWorkList: orderData[key].orderWorkList,
      }));

      setFormattedOrders(formattedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleOpenProductDetails = (orderWorkList) => {
    // Set the product details and open the popup
    setProductDetails(orderWorkList);
    setOpenProductDetails(true);
  };

  const handleCloseProductDetails = () => {
    // Close the product details popup
    setOpenProductDetails(false);
  };

  const handleOpenOrderPopup = (formattedOrderRow) => {
    const tempOrder = orders[formattedOrderRow.orderId];
    setSelectedOrder(tempOrder);
    setOpenOrderPopup(true);
  };


  const handleCloseOrderPopup = () => {
    setOpenOrderPopup(false);
    setSelectedOrder(null);
  };

  const handleSaveOrder = async (updatedOrder) => {
    try {
      await firebase.putData(`orders/${updatedOrder.orderId}`, updatedOrder); // Update Firebase
    } catch (error) {
      console.error('Error updating order:', error);
    }
    handleCloseOrderPopup();
    fetchOrders();
  };
  const menuProps = {
    PaperProps: {
      style: {
        backgroundColor: '#333',
        color: 'primary',
      },
    },
  };


  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* Search and Filter Section */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          // marginBottom: 2,
          flexWrap: 'wrap'
        }}>
          <TextField
            label="Search Order ID"
            variant="outlined"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 150 }}
              MenuProps={menuProps}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSearchOrderId('');
              setStatusFilter('all');
            }}
            style={{ borderRadius: '8px' }}
          >
            <Typography style={{ color: 'black' }}>
              Clear Filters
            </Typography>
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={filteredOrders}
          columns={columns(theme, handleOpenProductDetails)}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          onCellDoubleClick={(params) => handleOpenOrderPopup(params.row)}
          loading={loading}
          sx={{
            '& .MuiDataGrid-menuIconButton': {
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-sortIcon': {
              color: theme.palette.primary.main,
            },
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
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', color: theme.palette.black.main }}
          onClick={fetchOrders}
        >
          Refresh Orders
        </Button>
      </Box>

      {/* Product Details Popup */}
      <PopupProductDetails
        open={openProductDetails}
        productDetails={productDetails}
        onClose={handleCloseProductDetails}
      />
      <PopupAlterOrder
        open={openOrderPopup}
        orderData={selectedOrder}
        handleClose={handleCloseOrderPopup}
        handleSave={handleSaveOrder}
      />
    </Box>
  );
};

export default OrderManagement;