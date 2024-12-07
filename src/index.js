import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FirebaseProvider } from './context/Firebase';
import { OrderProvider } from './context/OrderContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ImageCacheProvider } from './context/ImageCacheContext';
const theme = createTheme({
  palette: {
    primary: {
      main: '#FFD369', // Used for accent or highlight elements
      dark: '#222831', // Dark background
      contrastText: '#EEEEEE', // Text against the primary dark background
    },
    secondary: {
      main: '#393E46', // Secondary elements and components
      contrastText: '#EEEEEE', // Text against the secondary background
    },
    background: {
      default: '#222831', // Main dark background
      paper: '#393E46', // Background for components like cards, using the secondary color
    },
    error: {
      main: '#f44336', // Keeping the default error color for visibility
    },
    black:{
      main: '#000000', // Keeping the default black color for visibility
    },
    warning: {
      main: '#ff9800', // Keeping the default warning color for visibility
    },
    info: {
      main: '#2196f3', // Keeping the default info color for visibility
    },
    success: {
      main: '#4caf50', // Keeping the default success color for visibility
    },
    text: {
      primary: '#EEEEEE', // Primary text color for high contrast
      secondary: '#FFD369', // Secondary text color for accent
      disabled: '#9e9e9e', // Disabled text color, slightly dimmed
      hint: '#9e9e9e', // Hint text color, same as disabled for consistency
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <ImageCacheProvider>
  <FirebaseProvider>
    <OrderProvider>
    <App />
    </OrderProvider>
  </FirebaseProvider>
    </ImageCacheProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();