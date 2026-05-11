import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, updateCart } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on mount or when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setLoading(true);
        try {
          const res = await getCart(user.id);
          if (res.success) {
            setCart(res.cart);
          }
        } catch (err) {
          console.error("Failed to fetch cart:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for guests
        const savedCart = localStorage.getItem('cart');
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    };

    fetchCart();
  }, [user]);

  // Sync cart with backend or localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const syncCart = async () => {
        try {
          await updateCart(user.id, cart);
        } catch (err) {
          console.error("Failed to sync cart:", err);
        }
      };
      syncCart();
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const productId = product._id || product.id;
      const existingItem = prevCart.find((item) => (item._id || item.id) === productId);
      
      const currentQty = existingItem ? existingItem.quantity : 0;
      const stock = product.stock_quantity ?? product.stock ?? 0;

      if (currentQty + quantity > stock) {
        alert(`Only ${stock} items available in stock. You already have ${currentQty} in cart.`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== productId));
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity < 1) return;
    if (quantity > stock) {
      alert(`Only ${stock} items available in stock.`);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item._id || item.id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
