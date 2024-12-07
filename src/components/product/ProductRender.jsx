import React, { useEffect, useState,useRef } from 'react';
import { Grid, Typography } from '@mui/material';
import ProductCard from './ProductCard';
import ProductPage from './ProductPage';
import { useOrderContext } from '../../context/OrderContext';


const ProductRender = ({ productList = [] ,userData = {}}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const scrollPosition = useRef(0);

  const {
    handleAddToCart,
    handleRemoveFromCart,
    isProductInCart,
    getProductQuantityInCart
  } = useOrderContext();

  useEffect(() => {
    console.log("Product list updated:", productList);
  }, [productList]);

  useEffect(() => {
    if (!selectedProduct) {
      window.scrollTo(0, scrollPosition.current);
    }
  },[selectedProduct]);

  const handleProductClick = (product) => {
    scrollPosition.current = window.scrollY;
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {selectedProduct ? (
        <ProductPage product={selectedProduct} onBack={handleBack} userData = {userData}/>
      ) : (
        <Grid container spacing={2}>
          {productList.length === 0 ? (
            <Typography variant="h6" component="div" sx={{ margin: '20px auto' }}>
              No products available.
            </Typography>
          ) : (
            productList.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  handleAddToCart={handleAddToCart}
                  userData = {userData}
                  isProductInCart={isProductInCart}
                  getProductQuantityInCart={getProductQuantityInCart}
                  handleRemoveFromCart={handleRemoveFromCart}
                  onClick={() => handleProductClick(product)}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </>
  );
};

export default ProductRender;
