import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFirebase } from './Firebase';
import { nanoid } from 'nanoid';

// import firebase from './firebase'; // Assuming you have a firebase.js file with the necessary configuration

const OrderContext = createContext();

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const SET_ORDER_ID = 'SET_ORDER_ID';
const ADD_ADDITIONAL_DETAILS = 'ADD_ADDITIONAL_DETAILS';
const RESET_ORDER = 'RESET_ORDER';

// Reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      return {
        ...state,
        orderWorkList: {
          ...state.orderWorkList,
          [state.orderId]: [
            ...(state.orderWorkList[state.orderId] || []).filter(item => item.productId !== action.payload.productId),
            { productId: action.payload.productId, quantity: action.payload.quantity }
          ]
        }
      };
    case REMOVE_FROM_CART:
      return {
        ...state,
        orderWorkList: {
          ...state.orderWorkList,
          [state.orderId]: (state.orderWorkList[state.orderId] || []).filter(item => item.productId !== action.payload)
        }
      };
    case UPDATE_QUANTITY:
      return {
        ...state,
        orderWorkList: {
          ...state.orderWorkList,
          [state.orderId]: (state.orderWorkList[state.orderId] || []).map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: Math.max(0, item.quantity + action.payload.change) }
              : item
          )
        }
      };
    case SET_ORDER_ID:
      return { ...state, orderId: action.payload };
    case ADD_ADDITIONAL_DETAILS:
      return {
        ...state,
        additionalDetails: {
          ...state.additionalDetails,
          [action.payload.key]: action.payload.value
        }
      };
    case RESET_ORDER:
      return initialState;
    default:
      return state;
  }
};

const initialState = {
  orderWorkList: {},
  orderId: '',
  additionalDetails: {},
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const firebase = useFirebase();
  useEffect(() => {
    const storedState = JSON.parse(localStorage.getItem('orderState') || '{}');
    if (storedState.orderId) {
      dispatch({ type: SET_ORDER_ID, payload: storedState.orderId });
    } else {
      const newOrderId = nanoid(11);
      dispatch({ type: SET_ORDER_ID, payload: newOrderId });
    }
    if (storedState.orderWorkList) {
      Object.entries(storedState.orderWorkList).forEach(([orderId, items]) => {
        items.forEach(item => {
          dispatch({ type: ADD_TO_CART, payload: { productId: item.productId, quantity: item.quantity } });
        });
      });
    }
    if (storedState.additionalDetails) {
      Object.entries(storedState.additionalDetails).forEach(([key, value]) => {
        dispatch({ type: ADD_ADDITIONAL_DETAILS, payload: { key, value } });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orderState', JSON.stringify(state));
  }, [state]);

  const handleQuantityChange = (productId, change) => {
    dispatch({ type: UPDATE_QUANTITY, payload: { productId, change } });
  };

  const handleAddToCart = (product, quantity) => {
    if (quantity > 0) {
      dispatch({ type: ADD_TO_CART, payload: { productId: product.id, quantity } });
    }
  };

  const handleRemoveFromCart = (productId) => {
    dispatch({ type: REMOVE_FROM_CART, payload: productId });
  };

  const addAdditionalDetails = (key, value) => {
    dispatch({ type: ADD_ADDITIONAL_DETAILS, payload: { key, value } });
  };

  const isProductInCart = (productId) => {
    return (state.orderWorkList[state.orderId] || []).some(item => item.productId === productId);
  };

  const getTotalQuantity = () => {
    return (state.orderWorkList[state.orderId] || []).reduce((total, item) => total + item.quantity, 0);
  };

  const getProductQuantityInCart = (productId) => {
    const item = state.orderWorkList[state.orderId]?.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const placeOrder = async () => {
    const now = new Date().toISOString();
    const unixtimestamp = Math.floor(new Date().getTime() / 1000);
    const storedState = JSON.parse(localStorage.getItem('orderState') || '{}');
    const orderData = {
      ...storedState,
      // additionalDetails: state.additionalDetails, 
      createdOn: now,
      updatedOn: now,
      timeline:{[unixtimestamp] : 'pending'},
      status: 'pending',
    };

    try {
      await firebase.putData(`orders/${orderData.orderId}`, orderData);
      // console.log(`orders/${state.orderId}`, orderData);
      
      if (storedState.additionalDetails.created_by) {
        const prevorders = await firebase.fetchData(`userOrders/${storedState.additionalDetails.created_by}/orders`);
        // console.log(prevorders);
        await firebase.putData(`userOrders/${storedState.additionalDetails.created_by}`, { orders: [...(prevorders || []), orderData.orderId] });

        if(storedState.additionalDetails.customerId){
          const prevorders = await firebase.fetchData(`customerOrders/${storedState.additionalDetails.customerId}/orders`);
          // console.log(prevorders);
          await firebase.putData(`customerOrders/${storedState.additionalDetails.customerId}`, { orders: [...(prevorders || []), orderData.orderId] });
        }
        // console.log(`userOrders/${storedState.additionalDetails.created_by}`, state.orderId);
      }

      // Reset the order state
      dispatch({ type: RESET_ORDER });

      // Generate a new order ID
      const newOrderId = nanoid(11);
      dispatch({ type: SET_ORDER_ID, payload: newOrderId });

      return { success: true, message: 'Order placed successfully' };
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, message: 'Failed to place order' };
    }
  };

  return (
    <OrderContext.Provider value={{
      handleQuantityChange,
      handleAddToCart,
      handleRemoveFromCart,
      isProductInCart,
      getTotalQuantity,
      getProductQuantityInCart,
      addAdditionalDetails,
      placeOrder,
      orderWorkList: state.orderWorkList,
      orderId: state.orderId,
      additionalDetails: state.additionalDetails,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};