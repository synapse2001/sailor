import React, { useEffect, useState } from 'react';
import {
  Card, CardMedia, CardContent, Typography, Box, IconButton, Button, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ArrowRight, ArrowLeft } from '@mui/icons-material';
import { useImageCache } from '../../context/ImageCacheContext';

const ProductCard = ({ product, handleAddToCart,userData, isProductInCart, getProductQuantityInCart, handleRemoveFromCart, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(0);
  const productQuantity = getProductQuantityInCart(product.id)
  const [loading, setLoading] = useState(true);
  const { images, loadImage } = useImageCache();

  // useEffect(() => {
  //   product.images.forEach(imageUrl => {
  //     loadImage(imageUrl);
  //   });
  // }, [product.images, loadImage]);

  const handlePrevImage = () => {
    setLoading(true);
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1);
  };

  const handleNextImage = () => {
    setLoading(true);
    setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0);
  };

  
  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    handleAddToCart(product, localQuantity);
    // setLocalQuantity(0);
  };
  
  const handleRemoveFromCartClick = (e) => {
    e.stopPropagation();
    handleRemoveFromCart(product.id);
  };

  useEffect(()=>{
    if (localQuantity != 0 && productQuantity != localQuantity){
      handleRemoveFromCart(product.id)
    }
  },[localQuantity])

  React.useEffect(() => {
    if(productQuantity != 0){
      setLocalQuantity(productQuantity);
    }
  },[productQuantity])
  
  const handleLocalQuantityChange = (change) => {
    setLocalQuantity(prev => Math.max(0, prev + change));
  };
  const handleImageLoad = () => {
    setLoading(false);
  };

  const maskPartNumber = (partNo) => {
    if (userData.role === 'salesperson') {
        return partNo;
    }
    const partNoArray = partNo.split('');
    const middleStart = Math.floor(partNoArray.length / 3);
    const middleEnd = Math.ceil(partNoArray.length * 2 / 3);

    for (let i = middleStart; i < middleEnd; i++) {
      partNoArray[i] = 'X';
    }

    return partNoArray.join('');
  };

  return (
    <Card sx={{ borderRadius: '8px', maxWidth: 345, position: 'relative' }} onClick={onClick}>
      <Box>
        {product.images && product.images.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
              </Box>
            )}
            <CardMedia
              component="img"
              height="200"
              image={images[product.images[currentImageIndex]]}
              alt={product.name}
              onLoad={handleImageLoad}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; setLoading(false); }}
              style={{ display: loading ? 'none' : 'block' }}
            />
            {product.images.length > 1 && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 10px',
              }}>
                <IconButton onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} color='primary' sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '50%' }}>
                  <ArrowLeft />
                </IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); handleNextImage(); }} color='primary' sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '50%' }}>
                  <ArrowRight />
                </IconButton>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', padding: '10px' }}>
            No Image Available
          </Typography>
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Part Number: {maskPartNumber(product.partNo)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Brand: {product.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: {product.priceRange}
          </Typography>
        </CardContent>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <IconButton onClick={(e) => { e.stopPropagation(); handleLocalQuantityChange(-1); }} color='primary' sx={{ backgroundColor: 'primary.main', borderRadius: '50%' }}>
            <RemoveIcon style={{ color: 'black' }} />
          </IconButton>
          <Typography>{localQuantity}</Typography>
          <IconButton onClick={(e) => { e.stopPropagation(); handleLocalQuantityChange(1); }} color='primary' sx={{ backgroundColor: 'primary.main', borderRadius: '50%' }}>
            <AddIcon style={{ color: 'black' }} />
          </IconButton>
        </Box>
        {isProductInCart(product.id) ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            {/* <Typography variant="body2" color="text.secondary" sx={{ mr: 8, ml: 4 }}>
              {getProductQuantityInCart(product.id)}
            </Typography> */}
            <Button
              variant="contained"
              color="error"
              style={{ color: 'black' }}
              sx={{ color: 'black' }}
              fullWidth
              onClick={handleRemoveFromCartClick}
            >
              Remove from Cart
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            style={{ color: 'black' }}
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleAddToCartClick}
            disabled={localQuantity === 0}
          >
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
