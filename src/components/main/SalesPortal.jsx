import React, { useEffect, useState, useRef } from 'react';
import { Box, AppBar, Toolbar, IconButton, InputBase, Snackbar, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useAuth } from '../../controllers/userState';
import { useFirebase } from '../../context/Firebase';
import useProductSearchEngine from '../engines/ProductSearchEngine';
import ProductRender from '../product/ProductRender';
import CartPage from '../order/CartPage';
import { useOrderContext } from '../../context/OrderContext';
import Sidebar from '../utils/Sidebar';
import MyOrders from '../order/MyOrders';

const SalesPortal = () => {
  const { user } = useAuth();
  const firebase = useFirebase();
  const { productList, searchProducts, loading, error } = useProductSearchEngine();
  const [salespersonData, setSalespersonData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setuserName] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPageOpen, setOrderPageOpen] = useState(false);
  const scrollPosition = useRef(0);
  const {
    handleAddToCart,
    handleRemoveFromCart,
    isProductInCart,
    getTotalQuantity,
    getProductQuantityInCart
  } = useOrderContext();

  const menuProps = {
    PaperProps: {
      style: {
        backgroundColor: '#333',
        color: 'primary',
      },
    },
  };

  const fetchUsers = async (uid) => {
    try {
      const usersData = await firebase.fetchData('users/' + uid);
      setSalespersonData(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers(user.uid);
    }
  }, [user, firebase]);

  useEffect(() => {
    if (salespersonData) {
      setuserName(
        String(salespersonData.name).charAt(0).toUpperCase() + String(salespersonData.name).slice(1)
      );
    }
  }, [salespersonData]);

  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setIsCartOpen(false);
      setOrderPageOpen(false);
      searchProducts(searchQuery, searchField);
    }
  };

  const handleSearchIconClick = () => {
    setIsCartOpen(false);
    setOrderPageOpen(false);
    searchProducts(searchQuery, searchField);
  };

  useEffect(() => {
    if (!isCartOpen && !orderPageOpen) {
      window.scrollTo(0, scrollPosition.current);  // Restore scroll position
    }
  }, [isCartOpen,orderPageOpen]);

  const handleCartClick = () => {
    scrollPosition.current = window.scrollY;
    setIsCartOpen(true);
  };

  const handleBackToProducts = () => {
    setIsCartOpen(false);
  };

  const handleOrderPageOpen = () => {
    console.log("hjdfhqGDFH FWjdftyed fwydt wr6rde6r6HUUUUUUUUUUUUU")
    scrollPosition.current = window.scrollY;
    setIsCartOpen(false);
    setOrderPageOpen(true);
  }
  const handleOrderPageClose = () => {
    setOrderPageOpen(false);
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderBottom: 2,
          borderColor: 'primary.main',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center',padding:'0' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.default',
              borderRadius: 1,
              boxShadow: 1,
              p: 1,
              width: '100%',
              height: '90%',
              maxWidth: 800
            }}
          >
            <IconButton color="primary" aria-label="open drawer" onClick={handleSidebarOpen} sx={{ p: 0.5 }}>
              <MenuIcon />
            </IconButton>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="search-field-label">Search By</InputLabel>
              <Select
                labelId="search-field-label"
                id="search-field"
                value={searchField}
                label="Search By"
                // style={{color: 'primary'}}
                onChange={(e) => setSearchField(e.target.value)}
                MenuProps={menuProps}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="partNo">Item no</MenuItem>
                <MenuItem value="brand">Brand</MenuItem>
              </Select>
            </FormControl>
            <InputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              sx={{ ml: 1, flex: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <IconButton color="primary" aria-label="search" onClick={handleSearchIconClick} sx={{ p: 0.5 }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <div style={{marginTop:'50px'}}>

      {isCartOpen ? (
        <CartPage orderpage={handleOrderPageOpen} userName={userName} iscartopen={handleBackToProducts} />
      ) : orderPageOpen ? (
        <MyOrders user={user} orderclose={handleOrderPageClose} isoderpageopen={orderPageOpen} />
      ) : (
        <>
          {productList ? (
            <Box sx={{ padding: 4,marginBottom:5 }}>
              {/* <Typography variant="h5" color="primary" gutterBottom>
                Product List
              </Typography> */}
              <ProductRender productList={productList} userData={salespersonData} />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 35 }}>
              <Typography variant="h4">Welcome</Typography>
              <Typography variant="h4" color='primary'>{userName}</Typography>
              <Typography variant="h5" mt={2}>Try searching for products to get started</Typography>
            </Box>
          )}
        </>
      )}

      <Sidebar orderpage={handleOrderPageOpen} user={user} open={sidebarOpen} onClose={handleSidebarClose} />

      <AppBar position="fixed" color="primary" style={{ color: 'black' }} sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar>
          {!isCartOpen && (
            <>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Total Items: {getTotalQuantity()}
              </Typography>
              <IconButton color="inherit" onClick={handleCartClick}>
                <ShoppingCartIcon />
              </IconButton>
            </>
          )}
          {isCartOpen && (
            <Button color="inherit" onClick={handleBackToProducts}>
              Back to Products
            </Button>
          )}
        </Toolbar>
      </AppBar>
        </div>
    </Box>
  );
};

export default SalesPortal;
