import React, { createContext, useContext, useState, useEffect } from 'react';
import { FruitProduct, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: FruitProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('factfruit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { success, warning, error } = useToast();

  useEffect(() => {
    localStorage.setItem('factfruit_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: FruitProduct, quantity = 1) => {
    if (!product.isAvailable || product.stock <= 0) {
      error(`ขออภัย สินค้า "${product.name}" สินค้าหมดหรือปิดจำหน่ายชั่วคราว`);
      return;
    }

    const qty = Math.max(0.1, Math.round(quantity * 100) / 100);

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.round((currentQty + qty) * 100) / 100;

        if (newQty > product.stock) {
          warning(`มีสต็อกคงเหลือ ${product.stock} ${product.unit} (ปรับจำนวนให้สูงสุดตามสต็อก)`);
          const updated = [...prev];
          updated[existingIndex].quantity = product.stock;
          return updated;
        }

        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (qty > product.stock) {
          warning(`สินค้ามีสต็อกคงเหลือเพียง ${product.stock} ${product.unit}`);
          return [...prev, { product, quantity: product.stock }];
        }
        return [...prev, { product, quantity: qty }];
      }
    });

    success(`เพิ่ม "${product.name}" (${qty} ${product.unit}) ลงตะกร้าแล้ว`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const qty = Math.round(quantity * 100) / 100;
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (qty > item.product.stock) {
            warning(`สินค้ามีสต็อกสูงสุด ${item.product.stock} ${item.product.unit}`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        success(`นำ "${item.product.name}" ออกจากตะกร้าแล้ว`);
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100
  ) / 100;

  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
