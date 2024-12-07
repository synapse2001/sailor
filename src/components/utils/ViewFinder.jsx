import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useImageCache } from '../../context/ImageCacheContext';

const ViewFinder = ({ imagesList, initialIndex = 0, open, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const transformWrapperRef = useRef(null);
  const { images, loadImage } = useImageCache();


  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex,open]);

  const handlePrevImage = () => {
    setLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNextImage = () => {
    setLoading(true);
    setCurrentIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  useEffect(()=>{
    if(imagesList === undefined){
      setLoading(false)
    }
  },[imagesList])

  const handleImageLoad = () => setLoading(false);

  const actionButtonStyle = {
    backgroundColor: 'primary.main',
    borderRadius: '50%',
    '& .MuiSvgIcon-root': {
      color: 'black'
    },
    '&:hover': {
      backgroundColor: 'primary.light'
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: '8px',
          maxWidth: '90vw !important',
          maxHeight: '90vh !important',
          width: 'auto !important',
          height: 'auto !important',
          minHeight: '400px',
          minWidth: '400px',
          m: 2,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Footer with zoom and close buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <IconButton onClick={() => transformWrapperRef.current.zoomIn()} sx={actionButtonStyle}>
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={() => transformWrapperRef.current.zoomOut()} sx={actionButtonStyle}>
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={() => transformWrapperRef.current.resetTransform()} sx={actionButtonStyle}>
          <RestartAltIcon />
        </IconButton>
        <IconButton onClick={onClose} sx={actionButtonStyle} >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main content area */}
      <DialogContent 
        sx={{ 
          p: '16px !important',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px', // Maintain minimum height during loading
          position: 'relative'
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        )}

        {/* Image with zoom functionality */}
        <TransformWrapper
          ref={transformWrapperRef}
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
        >
          <TransformComponent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}
            >{
                imagesList ? (
              <img
              src={images[imagesList[currentIndex]]}
              alt={`Product view ${currentIndex + 1}`}
              onLoad={handleImageLoad}
              onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600';
                  setLoading(false);
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 200px)',
                  objectFit: 'contain',
                  display: loading ? 'none' : 'block'
                }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  There are No Images Uploaded Please upload ImagesList
                </Typography>
              )
            }
            </Box>
          </TransformComponent>
        </TransformWrapper>
      </DialogContent>

      {/* Navigation bar at bottom */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {imagesList?.length > 1 && (
            <>
              <IconButton onClick={handlePrevImage} sx={actionButtonStyle}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={handleNextImage} sx={actionButtonStyle}>
                <ArrowForwardIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currentIndex + 1} / {imagesList?.length}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default ViewFinder;
