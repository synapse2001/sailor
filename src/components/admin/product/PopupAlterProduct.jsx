import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Autocomplete,
  Paper
} from '@mui/material';
import { Image, Close } from '@mui/icons-material';
import { useFirebase } from '../../../context/Firebase';
const PopupAlterProduct = ({ open, handleClose, productData, handleSave }) => {
  const [editedProduct, setEditedProduct] = useState({ ...productData });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brandOptions, setBrandOptions] = useState([]);
  const [brand, setBrand] = useState(null);
  const [errors, setErrors] = useState({});
  const firebase = useFirebase();

  useEffect(() => {
    setEditedProduct({ ...productData });
    setUploadedImages(productData?.images || []);
    setErrors({});

    if (productData?.priceRange) {
      const [min, max] = productData.priceRange.split('-');
      setMinPrice(min || '');
      setMaxPrice(max || '');
    } else {
      setMinPrice('');
      setMaxPrice('');
      setBrand(null);
    }
  }, [productData]);

  useEffect(() => {
    if (productData?.ogBrandName && brandOptions.length > 0) {
      const selectedBrand = brandOptions.find(option => option.label === productData.ogBrandName);
      setBrand(selectedBrand || null);
    } else {
      setBrand(null);
    }
  }, [brandOptions, productData?.ogBrandName]);

  const validateField = (field, value) => {
    switch (field) {
      case 'partNo':
        return value.trim() === '' ? 'Part No is required' : '';
      case 'name':
        return !/^[a-zA-Z0-9\s()]*$/.test(value) 
          ? 'Only letters, numbers, spaces, and brackets allowed'
          : value.trim() === '' ? 'Name is required' : '';
      case 'HSNCode':
        return !/^[a-zA-Z0-9]*$/.test(value) 
          ? 'Only alphanumeric characters allowed'
          : value.trim() === '' ? 'HSN Code is required' : '';
      case 'MRP':
        return !/^\d*$/.test(value) 
          ? 'Only numbers allowed'
          : value.trim() === '' ? 'MRP is required' : '';
      case 'minPrice':
      case 'maxPrice':
        return !/^\d*$/.test(value) ? 'Only numbers allowed' : '';
      case 'partDesc':
        return !/^[a-zA-Z0-9\s()]*$/.test(value) 
          ? 'Only letters, numbers, spaces, and brackets allowed'
        : value.trim() === '' ? 'Part Description is required' : '';
      case 'aliasName':
        return !/^[a-zA-Z0-9\s()]*$/.test(value) ? 'Only letters, numbers, spaces, and brackets allowed' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    setEditedProduct(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePriceChange = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    if (field === 'minPrice') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const fetchBrandMappings = async () => {
    try {
      const data = await firebase.fetchData('/brandmaskmappings');
      const formattedData = Object.entries(data || {}).map(([key, mask]) => ({
        id: mask,
        label: key?.key || key,
      }));
      setBrandOptions(formattedData);
    } catch (error) {
      console.error('Error fetching brand mappings:', error);
    }
  };
  useEffect(()=>{
    fetchBrandMappings()
    if(productData === null){
      // console.log("HIII")
      setEditedProduct({})
      setMinPrice('')
      setMaxPrice('')
    }
  },[open])

  const handleBrandSelect = (event, selectedOption) => {
    if (selectedOption) {
      setBrand(selectedOption);
      setEditedProduct((prevState) => ({
        ...prevState,
        brand: selectedOption.id.mask,
        ogBrandName: selectedOption.label,
      }));
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const uploadPromises = files.map(file => {
      const storagePath = `product-images/${file.name}`;
      return firebase.uploadImage(file, storagePath);
    });

    try {
      const imageUrls = await Promise.all(uploadPromises);
      setUploadedImages([...uploadedImages, ...imageUrls]);
      setEditedProduct(prevState => ({
        ...prevState,
        images: [...uploadedImages, ...imageUrls],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const imageToRemove = uploadedImages[indexToRemove];
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);

    setUploadedImages(updatedImages);
    setEditedProduct(prevState => ({
      ...prevState,
      images: updatedImages,
    }));

    const url = new URL(imageToRemove);
    const pathParts = url.pathname.split('/');
    const storagePath = decodeURIComponent(pathParts.slice(5).join('/'));

    try {
      await firebase.deleteImage(storagePath);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {
      partNo: validateField('partNo', editedProduct.partNo || ''),
      name: validateField('name', editedProduct.name || ''),
      HSNCode: validateField('HSNCode', editedProduct.HSNCode || ''),
      MRP: validateField('MRP', editedProduct.MRP || ''),
      partDesc: validateField('partDesc', editedProduct.partDesc || ''),
      minPrice: validateField('minPrice', minPrice),
      maxPrice: validateField('maxPrice', maxPrice),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleAction = () => {
    if (validateForm()) {
      const priceRange = `${minPrice}-${maxPrice}`;
      handleSave({ ...editedProduct, priceRange });
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{productData ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Part No"
          value={editedProduct?.partNo || ''}
          onChange={(e) => handleFieldChange('partNo', e.target.value)}
          fullWidth
          required
          variant="outlined"
          error={!!errors.partNo}
          helperText={errors.partNo}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Name"
          value={editedProduct.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          fullWidth
          required
          variant="outlined"
          error={!!errors.name}
          helperText={errors.name}
          style={{ marginBottom: '1rem' }}
        />
        <Autocomplete
          options={brandOptions}
          getOptionLabel={(option) => option.label || ''}
          value={brand}
          onChange={handleBrandSelect}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Brand"
              required
              variant="outlined"
              style={{ marginBottom: '1rem' }}
            />
          )}
          PaperComponent={(props) => (
            <Paper {...props} style={{ backgroundColor: '#333', color: '#fff', elevation: 3 }} />
          )}
          fullWidth
        />
        <TextField
          label="Part Description"
          value={editedProduct.partDesc || ''}
          onChange={(e) => handleFieldChange('partDesc', e.target.value)}
          fullWidth
          required
          variant="outlined"
          error={!!errors.partDesc}
          helperText={errors.partDesc}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Alias Name"
          value={editedProduct.aliasName || ''}
          onChange={(e) => handleFieldChange('aliasName', e.target.value)}
          fullWidth
          variant="outlined"
          error={!!errors.aliasName}
          helperText={errors.aliasName}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="MRP"
          value={editedProduct.MRP || ''}
          onChange={(e) => handleFieldChange('MRP', e.target.value)}
          fullWidth
          required
          variant="outlined"
          error={!!errors.MRP}
          helperText={errors.MRP}
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="HSN Code"
          value={editedProduct.HSNCode || ''}
          onChange={(e) => handleFieldChange('HSNCode', e.target.value)}
          fullWidth
          required
          variant="outlined"
          error={!!errors.HSNCode}
          helperText={errors.HSNCode}
          style={{ marginBottom: '1rem' }}
        />
        <Box display="flex" justifyContent="space-between" style={{ marginBottom: '1rem' }}>
          <TextField
            label="Min Price"
            value={minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            variant="outlined"
            error={!!errors.minPrice}
            helperText={errors.minPrice}
            style={{ marginRight: '0.5rem' }}
            fullWidth
          />
          <TextField
            label="Max Price"
            value={maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            variant="outlined"
            error={!!errors.maxPrice}
            helperText={errors.maxPrice}
            style={{ marginLeft: '0.5rem' }}
            fullWidth
          />
        </Box>
        <Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<Image />}
            style={{ marginBottom: '1rem', color: 'black' }}
          >
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageUpload}
            />
          </Button>
          {uploadedImages.length > 0 && (
            <Box>
              {uploadedImages.map((image, index) => (
                <Box key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  <IconButton
                    aria-label="delete"
                    style={{ position: 'absolute', height: '5px', width: '5px', top: -1, right: 0, backgroundColor: 'white', opacity: '0.6' }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Close />
                  </IconButton>
                  <img
                    src={image}
                    alt={`Product Image ${index}`}
                    style={{ width: '50px', height: '50px', marginRight: '5px' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAction} color="primary">
          {productData ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupAlterProduct;