import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useFirebase } from '../../../context/Firebase';
import { Box, Button, IconButton,Snackbar,Alert} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import PopupAlterProduct from './PopupAlterProduct';
import ImageIcon from '@mui/icons-material/Image';
import ViewFinder from '../../utils/ViewFinder';
import BrandMaskMappings from '../../utils/BrandMaskMappings';
import { useImageCache } from '../../../context/ImageCacheContext';

const ProductManagement = () => {
  const columns = [
    { field: 'id', headerName: 'Product ID', width: 150 },
    { field: 'partNo', headerName: 'Item No', width: 150, editable: true },
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'priceRange', headerName: 'Price Range', width: 150, editable: true },
    // { field: 'brand', headerName: 'Brand', width: 150, editable: true },
    { field: 'ogBrandName', headerName: 'Brand', width: 150, editable: true },
    { field: 'partDesc', headerName: 'Item Description', width: 200, editable: true },
    { field: 'aliasName', headerName: 'Alias Name', width: 200, editable: true },
    { field: 'MRP', headerName: 'MRP', width: 150, editable: true },
    { field: 'HSNCode', headerName: 'HSN Code', width: 150, editable: true },
    {
      field: 'images',
      headerName: 'Images',
      width: 150,
      renderCell: (params) => (
        <IconButton onClick={() => handleImageClick(params.row.images)}>
          <ImageIcon />
        </IconButton>
      ),
    },
  ];

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [openAlterProductDialog, setOpenAlterProductDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openBrandMaskDialog, setOpenBrandMaskDialog] = useState(false);
  const { images, loadImage } = useImageCache();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const firebase = useFirebase();
  const theme = useTheme();

  useEffect(() => {
    fetchProducts();
  }, [firebase]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const productsData = await firebase.fetchData('products');
      const formattedProducts = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key],
      }));
      setProducts(formattedProducts);
      console.log(formattedProducts)
      formattedProducts.forEach(product => product.images.forEach(imageUrl => loadImage(imageUrl)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const checkDuplicates = (productData) => {
    const otherProducts = products.filter(p => p.id !== productData.id);
    
    const duplicatePartNo = otherProducts.find(
      p => p.partNo?.toLowerCase() === productData.partNo?.toLowerCase()
    );
    if (duplicatePartNo) {
      return `Part number "${productData.partNo}" already exists`;
    }

    const duplicateHSN = otherProducts.find(
      p => p.HSNCode?.toLowerCase() === productData.HSNCode?.toLowerCase()
    );
    if (duplicateHSN) {
      return `HSN Code "${productData.HSNCode}" already exists`;
    }

    return null;
  };

  const handleEditCommit = async (updatedProduct) => {
    try {
      const updatedProducts = products.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);
      await firebase.putData(`products/${updatedProduct.id}`, updatedProduct);
      await firebase.updateProducts()
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleOpenAlterProductDialog = (product) => {
    setEditProduct(product);
    setOpenAlterProductDialog(true);
  };

  const handleCloseAlterProductDialog = () => {
    setEditProduct(null);
    setOpenAlterProductDialog(false);
  };

  // const handleSaveProduct = async (productData) => {
  //   try {
  //     if (productData.id) {
  //       await handleEditCommit(productData);
  //     } else {
  //       const randomId = uuidv4();
  //       await firebase.putData(`products/${randomId}`, productData);
  //       await firebase.updateProducts()
  //       productData.id = randomId;
  //       setProducts([...products, productData]);
  //     }
  //   } catch (error) {
  //     console.error('Error saving product:', error);
  //   }
  //   handleCloseAlterProductDialog();
  // };
  const handleSaveProduct = async (productData) => {
    try {
      const duplicateError = checkDuplicates(productData);
      
      if (duplicateError) {
        setSnackbar({
          open: true,
          message: duplicateError,
          severity: 'error'
        });
        return;
      }

      if (productData.id) {
        await handleEditCommit(productData);
      } else {
        // const randomId = uuidv4();
        const randomId = nanoid(11);
        await firebase.putData(`products/${randomId}`, productData);
        await firebase.updateProducts()
        productData.id = randomId;
        setProducts([...products, productData]);
      }

      setSnackbar({
        open: true,
        message: 'Product saved successfully',
        severity: 'success'
      });
      handleCloseAlterProductDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: 'Error saving product: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleImageClick = (images) => {
    setSelectedImages(images);
    setCurrentImageIndex(0);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setSelectedImages([]);
    setOpenImageDialog(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => Math.min(prevIndex + 1, selectedImages.length - 1));
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginRight: '10px', color: theme.palette.black.main }}
          onClick={() => setOpenBrandMaskDialog(true)} // Open Brand Mask Popup
        >
          Brand Mask
        </Button>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}
          onClick={() => setOpenAlterProductDialog(true)}
        >
          Add Product
        </Button>
      </Box>
      <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          onRowDoubleClick={(params) => handleOpenAlterProductDialog(params.row)}
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
        />
      </Box>
      <PopupAlterProduct
        open={openAlterProductDialog}
        handleClose={handleCloseAlterProductDialog}
        productData={editProduct}
        handleSave={handleSaveProduct}
      />
      <ViewFinder
        imagesList={selectedImages}
        initialIndex={0}
        open={openImageDialog}
        onClose={handleCloseImageDialog} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', color: theme.palette.black.main }}
          onClick={fetchProducts}
        >
          Refresh
        </Button>
      </Box>
      <BrandMaskMappings
        open={openBrandMaskDialog}
        onClose={() => setOpenBrandMaskDialog(false)}
      />
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductManagement;
