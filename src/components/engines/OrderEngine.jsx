// OrderEngine.jsx
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useOrderEngine = () => {
  const [quantities, setQuantities] = useState(() => {
    const storedQuantities = localStorage.getItem('quantities');
    return storedQuantities ? JSON.parse(storedQuantities) : [];
  });

  const [orderWorkList, setOrderWorkList] = useState(() => {
    const storedOrderWorkList = localStorage.getItem('orderWorkList');
    return storedOrderWorkList ? JSON.parse(storedOrderWorkList) : { [uuidv4()]: [] };
  });

  useEffect(() => {
    localStorage.setItem('orderWorkList', JSON.stringify(orderWorkList));
  }, [orderWorkList]);

  useEffect(() => {
    localStorage.setItem('quantities', JSON.stringify(quantities));
  }, [quantities]);

  const initializeQuantities = (productList) => {
    setQuantities(productList.map(() => 0));
  };

  const handleQuantityChange = (index, change) => {
    setQuantities(prevQuantities => {
      const newQuantities = [...prevQuantities];
      newQuantities[index] = Math.max(0, newQuantities[index] + change);
      return newQuantities;
    });
  };

  const getProductQuantityInCart = (productId) => {
    const orderId = Object.keys(orderWorkList)[0];
    const item = orderWorkList[orderId].find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product, quantity) => {
    if (quantity > 0) {
      setOrderWorkList(prevOrderWorkList => {
        const orderId = Object.keys(prevOrderWorkList)[0];
        const updatedOrder = [...prevOrderWorkList[orderId]];
        const existingProductIndex = updatedOrder.findIndex(item => item.productId === product.id);

        if (existingProductIndex !== -1) {
          updatedOrder[existingProductIndex].quantity = quantity;
        } else {
          updatedOrder.push({ productId: product.id, quantity });
        }

        return { [orderId]: updatedOrder };
      });
    }
  };

  const handleRemoveFromCart = (productId) => {
    setOrderWorkList(prevOrderWorkList => {
      const orderId = Object.keys(prevOrderWorkList)[0];
      const updatedOrder = prevOrderWorkList[orderId].filter(item => item.productId !== productId);
      return { [orderId]: updatedOrder };
    });
  };

  const isProductInCart = (productId) => {
    const orderId = Object.keys(orderWorkList)[0];
    return orderWorkList[orderId].some(item => item.productId === productId);
  };

  const getTotalQuantity = () => {
    const orderId = Object.keys(orderWorkList)[0];
    return orderWorkList[orderId].reduce((total, item) => total + item.quantity, 0);
  };

  return {
    quantities,
    orderWorkList,
    initializeQuantities,
    handleQuantityChange,
    handleAddToCart,
    handleRemoveFromCart,
    isProductInCart,
    getTotalQuantity,
    getProductQuantityInCart
  };
};

export default useOrderEngine;