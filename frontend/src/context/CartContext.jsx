import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'artsyWithLoveCart';

const getStoredCart = () => {
  if (typeof window === 'undefined') return [];

  const savedCart = window.localStorage.getItem(STORAGE_KEY);
  if (!savedCart) return [];

  try {
    return JSON.parse(savedCart);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getStoredCart);

  // Sync to localStorage on change
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      const normalizedProduct = {
        ...product,
        price: Number(product.price) || 0,
        image: product.images?.[0] || product.image || '',
      };

      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, ...normalizedProduct, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getCartCount,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
