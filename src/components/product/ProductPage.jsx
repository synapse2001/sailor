import React, { useEffect, useState} from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ViewFinder from '../utils/ViewFinder';
import { useOrderContext } from '../../context/OrderContext';
import { useImageCache } from '../../context/ImageCacheContext';

const ProductPage = ({ product, onBack ,userData}) => {
  const {
    handleAddToCart,
    handleRemoveFromCart,
    isProductInCart,
    getProductQuantityInCart
  } = useOrderContext();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewFinderOpen, setViewFinderOpen] = useState(false);
  const productQuantity = getProductQuantityInCart(product.id);
  const { images, loadImage } = useImageCache();
  // console.log("Product Page",product)
  
  React.useEffect(() => {
    if(productQuantity != 0){
      setLocalQuantity(productQuantity);
    }
  },[productQuantity])
  
  React.useEffect(()=>{
    if (localQuantity != 0 && productQuantity != localQuantity){
      handleRemoveFromCart(product.id)
    }
  },[localQuantity])


  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!product) return null;

  const productInCart = isProductInCart(product.id);

  const handleImageLoad = () => {
    setLoading(false);
  };


  const maskPartNumber = (partNo) => {
    if(userData.role === 'salesperson') {
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
    <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: '1200px', margin: 'auto' ,mb:3}}>
      <Button
        onClick={onBack}
        variant="contained"
        color="primary"
        style={{ color: 'black' }}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Image Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
            {loading && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 400
              }}>
                <CircularProgress />
              </Box>
            )}
            {/* Clickable product image */}
            <Box
              onClick={() => setViewFinderOpen(true)}
              sx={{
                cursor: 'zoom-in',
                '&:hover': {
                  '& .zoom-hint': {
                    opacity: 1
                  }
                }
              }}
            >
              <img
                src={images[product.images[currentImageIndex]]}
                alt={product.name}
                onLoad={handleImageLoad}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600';
                  setLoading(false);
                }}
                style={{
                  maxHeight: '500px',
                  maxWidth: '100%',
                  display: loading ? 'none' : 'block',
                  objectFit: 'contain'
                }}
              />
              {/* Zoom hint overlay */}
              <Typography
                className="zoom-hint"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 1,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none'
                }}
              >
                Click to zoom
              </Typography>
            </Box>

            {/* Thumbnail navigation */}
            {product.images.length > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                flexWrap: 'wrap'
              }}>
                {product.images.map((image, index) => (
                  <Paper
                    key={index}
                    elevation={currentImageIndex === index ? 4 : 1}
                    sx={{
                      border: currentImageIndex === index ? 2 : 0,
                      borderColor: 'primary.main',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={images[image]}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover'
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product Details Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {product.name}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {product.aliasName}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Price and Quantity Section */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            my: 4,
            flexWrap: 'wrap'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Price: {product.priceRange} (MRP: {product.MRP})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setLocalQuantity((qty) => Math.max(1, qty - 1))}
                color="primary"
              >
                <RemoveIcon />
              </IconButton>
              <Typography variant="h6">{localQuantity}</Typography>
              <IconButton
                onClick={() => setLocalQuantity((qty) => qty + 1)}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Box>
            {productInCart ? (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleRemoveFromCart(product.id)}
              >
                Remove from Cart
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                style={{ color: 'black', marginLeft: '20px' }}
                onClick={() => handleAddToCart(product, localQuantity)}
                disabled={localQuantity === 0}
              >
                Add to Cart
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Additional Details Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Product Details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              Manufacturer: {product.brand}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              Item Number: {maskPartNumber(product.partNo)}
            </Typography>
            {/* <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              HSN Code: {product.HSNCode}
            </Typography> */}
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              Description: {product.partDesc}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* ViewFinder Modal */}
      <ViewFinder
        imagesList ={product.images}
        initialIndex={currentImageIndex}
        open={viewFinderOpen}
        onClose={() => setViewFinderOpen(false)}
      />
    </Box>
  );
};

export default ProductPage;