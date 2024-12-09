import React, { useState, useEffect, useRef } from 'react';
import {
  Box, List, ListItem, ListItemText, Collapse, IconButton, Typography,
  Divider, Grid, Paper, Card, CardContent, CardMedia, Chip
} from '@mui/material';
import { ExpandLess, ExpandMore, ArrowBack } from '@mui/icons-material';
import { useFirebase } from '../../context/Firebase';
import { useTheme } from '@mui/material/styles';
import ProductPage from '../product/ProductPage';
import { useImageCache } from '../../context/ImageCacheContext';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

const MyOrders = ({ user, orderclose, isoderpageopen }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);  // Track selected product
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const firebase = useFirebase();
  const theme = useTheme();
  const scrollPosition = useRef(0);  // Ref to store scroll position
  const { images, loadImage } = useImageCache();

  // useEffect(() => {
  //   orders.forEach(order => {
  //     order.products.forEach(product => {
  //       const imageUrl = product.images[0] || 'placeholder-image-url';
  //       loadImage(imageUrl);
  //     });
  //   });
  // }, [orders, loadImage]);

  const fetchUserRole = async (user) => {
    const userRole = await firebase.getUserRole(user.uid);
    setCurrentUserRole(userRole);
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchUserRole(user);
    }
  }, [user, isoderpageopen]);

  const fetchUserOrders = async () => {
    try {
      const userOrdersData = await firebase.fetchData(`userOrders/${user.uid}`);
      if (userOrdersData?.orders) {
        const ordersPromises = userOrdersData.orders.map(orderId =>
          firebase.fetchData(`orders/${orderId}`)
        );
        const ordersData = await Promise.all(ordersPromises);
        for (let i = 0; i < ordersData.length; i++) {
          const order = ordersData[i];
          const order_id = order.orderId;
          const temp = await firebase.fetchProducts();
          // const productPromises = order.orderWorkList[order_id].map(product =>
          //   firebase.fetchData(`products/${product.productId}`)
          // );
          // const productsData = await Promise.all(productPromises);
          const productsData = order.orderWorkList[order_id].map(product => {
            return temp.find(p => p.id === product.productId);
          });
          ordersData[i].products = productsData;
          const customerData = await firebase.fetchData(`customers/${order.additionalDetails.customerId}`);
          ordersData[i].customerDetails = customerData || {};
        }
        const sortedOrders = ordersData.sort((a, b) => new Date(b.updatedOn) - new Date(a.updatedOn));
        console.log(sortedOrders);
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleExpandClick = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleProductClick = (product) => {
    scrollPosition.current = window.scrollY;  // Save scroll position
    setSelectedProduct(product);  // Set selected product when clicked
  };

  useEffect(() => {
    if (!selectedProduct) {
      window.scrollTo(0, scrollPosition.current);  // Restore scroll position
    }
  }, [selectedProduct]);

  const renderTimeline = (orderData) => {
    const timelineData = Object.entries(orderData?.timeline || {}).map(([timestamp, status]) => ({
      timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
      status,
    }));

    return (
      <Timeline>
        {timelineData.map((entry, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={getStatusColor(entry.status)} />
              {index < timelineData.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box fontWeight="bold">{entry.status}</Box>
              <Box>{entry.timestamp}</Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default', p: 3, mt: 3, mb: 3 }}>
      {selectedProduct ? (  // Show ProductPage if a product is selected
        <ProductPage product={selectedProduct} onBack={() => setSelectedProduct(null)} userData={{ role: currentUserRole }} />
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton color='primary' onClick={orderclose}>
              <ArrowBack />
            </IconButton>
            <Typography component="div" ml={2} variant="h5">My Orders</Typography>
          </Box>
          <List component="nav">
            {orders.map((order) => (
              <Paper key={order.orderId} elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
                <ListItem
                  button
                  onClick={() => handleExpandClick(order.orderId)}
                  sx={{
                    borderLeft: 6,
                    borderColor: `${getStatusColor(order.status)}.main`,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={2} sm={1}>
                      <CardMedia
                        component="img"
                        sx={{ width: 60, height: 60, borderRadius: 1 }}
                        image={images[order.products[0]?.images[0]] || 'placeholder-image-url'}
                        alt={order.products[0]?.name || 'Product image'}
                      />
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Box ml={2}>
                        <Typography component="div" variant="h6" color={theme.palette.primary.main}>
                          # {order.orderId}
                        </Typography>
                        <Box component="span" variant="body2" color={theme.palette.primary.main}>
                          {formatDate(order.createdOn)} {" — "}
                        </Box>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}>
                      {expandedOrderId === order.orderId ? <ExpandLess /> : <ExpandMore />}
                    </Grid>
                  </Grid>
                </ListItem>
                <Collapse in={expandedOrderId === order.orderId} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={5}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography component="div" variant="h6" gutterBottom color={theme.palette.primary.main}>Customer Details</Typography>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Name: </Typography>
                              <Typography component="span" color="text.primary">{order.customerDetails.customerName}</Typography>
                            </Box>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Contact: </Typography>
                              <Typography component="span" color="text.primary">{order.customerDetails.customerPhone}</Typography>
                            </Box>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Email: </Typography>
                              <Typography component="span" color="text.primary">{order.customerDetails.customerEmail}</Typography>
                            </Box>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Address: </Typography>
                              <Typography component="span" color="text.primary">{order.customerDetails.customerAddress}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={8} md={2}>
                        <Card variant="outlined" >
                          <CardContent>
                            <Typography component="div" variant="h6" gutterBottom color={theme.palette.primary.main} >Order Details</Typography>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Type: </Typography>
                              <Typography component="span" color="text.primary">{order.additionalDetails.order_type}</Typography>
                            </Box>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Ordered By: </Typography>
                              <Typography component="span" color="text.primary">{order.additionalDetails.ordered_by}</Typography>
                            </Box>
                            <Box component="div" variant="body2">
                              <Typography component="span" color={theme.palette.primary.main}>Note: </Typography>
                              <Typography component="span" color="text.primary">{order.additionalDetails.orderNote}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        {renderTimeline(order)}
                      </Grid>
                    </Grid>
                    <Typography component="div" variant="h6" sx={{ mt: 3, mb: 2 }} color={theme.palette.primary.main}>Products</Typography>
                    <Grid container spacing={2}>
                      {order.products.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} key={product.partNo}>
                          <Card variant="outlined" onClick={() => handleProductClick(product)}>
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <CardMedia
                                    component="img"
                                    sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                                    // image={product.images[0] || 'placeholder-image-url'}
                                    image={images[product.images[0]] || 'placeholder-image-url'}
                                    alt={product.name}
                                  />
                                </Grid>
                                <Grid item xs={8}>
                                  <Typography component="div" variant="h6" color={theme.palette.primary.main} >{product.name}</Typography>
                                  <Box component="div" variant="body2">Item No: {product.partNo}</Box>
                                  <Box component="div" variant="body2">
                                    Quantity: {order.orderWorkList[order.orderId][index].quantity}
                                  </Box>
                                  <Box component="div" variant="body2">Price Range: {product.priceRange}</Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default MyOrders;