import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useFirebase } from '../../context/Firebase';
import { useImageCache } from '../../context/ImageCacheContext';

const ProductDetailsPopup = ({ open, onClose, productDetails }) => {
  const [detailedProducts, setDetailedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const firebase = useFirebase();
  const { images, loadImage } = useImageCache();
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!open || !Array.isArray(productDetails) || productDetails.length === 0) {
        setLoading(false); // Stop loading if invalid data
        return;
      }

      setLoading(true);
      try {
        const products = await firebase.fetchProducts(); // Ensure data is fetched
        console.log('Fetched products:', products);
        console.log('Product details prop:', productDetails);

        // Match fetched products with productDetails
        const filteredProducts = products.filter(product =>
          productDetails.some(detail => detail.productId === product.id)
        );

        // Merge quantity from productDetails
        const enrichedProducts = filteredProducts.map(product => {
          const matchingDetail = productDetails.find(detail => detail.productId === product.id);
          return { ...product, quantity: matchingDetail?.quantity || 0 };
        });

        setDetailedProducts(enrichedProducts);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [open, productDetails, firebase]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Product Details
        <IconButton onClick={onClose} aria-label="close" color='primary'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : detailedProducts.length > 0 ? (
          <Grid container spacing={2}>
            {detailedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.images && product.images[0] ? images[product.images[0]] : 'placeholder-image-url'}
                    alt={product.name}
                    sx={{ objectFit: 'contain', borderRadius: 1 }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Part No: {product.partNo}</Typography>
                    <Typography variant="body2" color="textSecondary">Quantity: {product.quantity}</Typography>
                    <Typography variant="body2" color="textSecondary">Price Range: {product.priceRange}</Typography>
                    <Typography variant="body2" color="textSecondary">Brand: {product.ogBrandName}</Typography>
                    <Typography variant="body2" color="textSecondary">Part No.: {product.partNo}</Typography>
                    <Typography variant="body2" color="textSecondary">HSN Code.: {product.HSNCode}</Typography>
                    <Typography variant="body2" color="textSecondary">MRP : {product.MRP}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No product details available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsPopup;
