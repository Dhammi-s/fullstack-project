import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../api/services';

export const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setCart({ items: [], total: 0 }); return; }
    try {
      const res = await cartApi.get();
      const data = res.data;
      // normalize: backend returns { id, items, total } or { items, total }
      setCart({ items: data.items || [], total: data.total || 0, id: data.id });
    } catch {
      setCart({ items: [], total: 0 });
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, serviceId, quantity = 1) => {
    await cartApi.add({ productId, serviceId, quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartApi.remove(itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    setCart({ items: [], total: 0 });
  };

  const updateQuantity = async (itemId, qty) => {
    await cartApi.update(itemId, qty);
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeItem, clearCart, updateQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}
