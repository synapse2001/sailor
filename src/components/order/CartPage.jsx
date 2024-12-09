import React, { useState,useEffect } from 'react';
import {
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductPage from '../product/ProductPage';
import { useOrderContext } from '../../context/OrderContext';
import { useFirebase } from '../../context/Firebase';
import carImage from '../../assets/images/running_car.gif';
import { useAuth } from '../../controllers/userState';
import PopupAdditionalDetails from './PopupAdditionalDetails';
import { useImageCache } from '../../context/ImageCacheContext';

const CartPage = ({ userName, orderpage, iscartopen }) => {
  const {
    orderWorkList,
    handleQuantityChange,
    handleRemoveFromCart,
    getTotalQuantity,
    handleAddToCart,
    addAdditionalDetails,
    placeOrder
  } = useOrderContext();
  const firebase = useFirebase();
  const [productList, setProductList] = useState([]);
  const { user } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { images, loadImage } = useImageCache();
  
  const fetchUserRole = async (user) => {
    const userRole = await firebase.getUserRole(user.uid);
    setCurrentUserRole(userRole);
  };

  React.useEffect(() => { 
    if (user !== null) {
      fetchUserRole(user);
    }
  }, [user]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      const temp = await firebase.fetchProducts();
      setProductList(Object.values(temp));
    };

    fetchProducts();
  }, [firebase]);

  const orderId = orderWorkList ? Object.keys(orderWorkList)[0] : null;
  const cartItems = (orderId && orderWorkList[orderId]) ? orderWorkList[orderId] : [];

  const getProductById = (productId) => {
    return productList.find(product => product.id === productId);
  };

  const handlePlaceOrder = () => {
    if (currentUserRole === 'salesperson') {
      setOpen(true);
    } else {
      setTimeout(() => {
        placeOrder();
      }, 1000);
      setTimeout(() => {
        iscartopen();
        orderpage();}, 2000);
    }
  };

  const handleAdditionalDetailsSubmit = ({ customerId, orderNote }) => {
    addAdditionalDetails('customerId', customerId);
    addAdditionalDetails('orderNote', orderNote);
    addAdditionalDetails('created_by', user.uid);
    addAdditionalDetails('updated_by', user.uid);
    addAdditionalDetails('ordered_by', userName);
    addAdditionalDetails('order_type', currentUserRole === 'salesperson' ? 'sales_assisted' : 'self_service');
    setOpen(false);
    setTimeout(() => {
      placeOrder();
    }, 1000);
    setTimeout(() => {
    iscartopen();
    orderpage();}, 2000);
  };

  const handleProductSelection = (product) => {
    setSelectedProduct(product);
  }


  return (
    <>
      {selectedProduct ? (
        <Box sx ={{my:5}}>
        <ProductPage product={selectedProduct} onBack={() => setSelectedProduct(null)} userData={{ role: currentUserRole }} />
        </Box>
      ) : (
        <DialogContent>
          {cartItems.length > 0 ? (
            <List>
              {cartItems.map((item) => {
                const product = getProductById(item.productId);

                if (!product) {
                  return (
                    <ListItem key={item.productId}>
                      <ListItemText primary="Product not found" secondary={`Quantity: ${item.quantity}`} />
                      <Divider />
                    </ListItem>
                  );
                }

                return (
                  <div key={item.productId}>
                  <ListItem>
                    <Avatar
                    src={images[product.images[0]]}
                    alt={product.name}
                    sx={{ width: 48, height: 48, cursor: 'pointer', marginRight: 2, borderRadius: '0' }}
                    onClick={() => handleProductSelection(product)}
                    />
                    <ListItemText
                    primary={product.name}
                    secondary={`Quantity: ${item.quantity}`}
                    onClick={() => handleProductSelection(product)}
                    style={{ cursor: 'pointer' }}
                    />
                    <ListItemSecondaryAction style={{marginTop:14}}>
                    <IconButton color='primary' edge="end" aria-label="decrease" onClick={() => handleQuantityChange(product.id, -1)}>
                      <RemoveIcon />
                    </IconButton>
                    <IconButton color='primary' edge="end" aria-label="increase" onClick={() => handleQuantityChange(product.id, 1)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton color='primary' edge="end" aria-label="delete" onClick={() => handleRemoveFromCart(item.productId)}>
                      <DeleteIcon />
                    </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  </div>
                );
              })}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' ,mt: 20}}>
              <Box alignContent="center" maxWidth="200px" sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={carImage} alt="Empty Cart" style={{ width: '100%', height: 'auto' }} />
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>Kudos on keeping your car neat 😉</Typography>
              </Box>
            </Box>
          )}
          {cartItems.length > 0 && (
            <>
              <Typography variant="h6" align="right" sx={{ mt: 2 }}>Total Items: {getTotalQuantity()}</Typography>
              {cartItems.every(item => item.quantity > 0) && (
                <Button variant="contained" color="primary" style={{ color: 'black' }} onClick={handlePlaceOrder} sx={{ mt: 2 }}>
                  Place Order
                </Button>
              )}
            </>
          )}
          <PopupAdditionalDetails open={open} onClose={() => setOpen(false)} onSubmit={handleAdditionalDetailsSubmit} />
        </DialogContent>
      )}
    </>
  );
};

export default CartPage;
