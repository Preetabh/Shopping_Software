import React, { createContext, useContext, useState, useEffect } from 'react';
import { mobileApi } from '../api/client';
import { useAuth } from './AuthContext';
import { CartItem, PricingSummary, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  pricing: PricingSummary;
  coupon: { code: string | null; discountAmount: number } | null;
  cartCount: number;
  wishlistIds: string[];
  addToCart: (product: Product, quantity?: number, variantId?: string, variantName?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const defaultPricing: PricingSummary = {
  subtotal: 0,
  mrpTotal: 0,
  totalDiscount: 0,
  couponDiscount: 0,
  deliveryCharge: 0,
  tax: 0,
  totalAmount: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pricing, setPricing] = useState<PricingSummary>(defaultPricing);
  const [coupon, setCoupon] = useState<{ code: string | null; discountAmount: number } | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      refreshCart();
      fetchWishlist();
    } else {
      // Retain guest cart or initialize empty
      setPricing((prev) => (cartItems.length > 0 ? calculateLocalPricing(cartItems) : defaultPricing));
    }
  }, [user]);

  const calculateLocalPricing = (items: CartItem[]): PricingSummary => {
    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
    const mrpTotal = items.reduce((sum, it) => sum + (it.mrp || it.price || 0) * it.quantity, 0);
    const totalDiscount = mrpTotal > subtotal ? mrpTotal - subtotal : 0;
    const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
    const totalAmount = subtotal + deliveryCharge;
    return {
      subtotal,
      mrpTotal,
      totalDiscount,
      couponDiscount: 0,
      deliveryCharge,
      tax: 0,
      totalAmount
    };
  };

  const refreshCart = async () => {
    if (!user) return;
    try {
      const res = await mobileApi.get('/cart');
      if (res.data.success && res.data.data) {
        setCartItems(res.data.data.items || []);
        setPricing(res.data.data.pricing || defaultPricing);
        setCoupon(res.data.data.coupon || null);
      }
    } catch (e) {
      // not logged in or empty
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await mobileApi.get('/wishlist');
      if (res.data.success && res.data.data) {
        const prods = res.data.data.products || res.data.data;
        if (Array.isArray(prods)) {
          setWishlistIds(prods.map((p: any) => p._id || p));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const addToCart = async (product: Product, quantity = 1, variantId?: string, variantName?: string) => {
    if (!user) {
      // Guest user: update state locally
      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (it) => it.product._id === product._id && it.variantId === (variantId || undefined)
        );
        let updated: CartItem[];
        if (existingIdx > -1) {
          updated = [...prev];
          updated[existingIdx].quantity += quantity;
        } else {
          const itemPrice =
            variantId && product.variants
              ? product.variants.find((v) => v._id === variantId)?.price || product.price
              : product.price;
          const itemMrp =
            variantId && product.variants
              ? product.variants.find((v) => v._id === variantId)?.mrp || product.mrp
              : product.mrp;
          const newItem: CartItem = {
            _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            product,
            variantId: variantId || null,
            variantName: variantName || undefined,
            quantity,
            price: itemPrice,
            mrp: itemMrp
          };
          updated = [...prev, newItem];
        }
        setPricing(calculateLocalPricing(updated));
        return updated;
      });
      return;
    }

    try {
      await mobileApi.post('/cart/add', {
        productId: product._id,
        variantId: variantId || undefined,
        quantity
      });
      await refreshCart();
    } catch (e) {
      console.error('Error adding to cart:', e);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) {
      setCartItems((prev) => {
        let updated: CartItem[];
        if (quantity <= 0) {
          updated = prev.filter((it) => it._id !== itemId);
        } else {
          updated = prev.map((it) => (it._id === itemId ? { ...it, quantity } : it));
        }
        setPricing(calculateLocalPricing(updated));
        return updated;
      });
      return;
    }

    try {
      await mobileApi.put(`/cart/items/${itemId}`, { quantity });
      await refreshCart();
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      setCartItems((prev) => {
        const updated = prev.filter((it) => it._id !== itemId);
        setPricing(calculateLocalPricing(updated));
        return updated;
      });
      return;
    }

    try {
      await mobileApi.delete(`/cart/items/${itemId}`);
      await refreshCart();
    } catch (e) {
      console.error('Error removing from cart:', e);
    }
  };

  const applyCoupon = async (code: string) => {
    if (!user) {
      throw new Error('Please sign in to apply coupon discounts');
    }
    const res = await mobileApi.post('/cart/apply-coupon', { code });
    await refreshCart();
    return res.data.message;
  };

  const removeCoupon = async () => {
    if (!user) {
      setCoupon(null);
      return;
    }
    await mobileApi.delete('/cart/coupon');
    await refreshCart();
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      let isAdded = false;
      setWishlistIds((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((id) => id !== productId);
        } else {
          isAdded = true;
          return [...prev, productId];
        }
      });
      return isAdded;
    }

    try {
      const res = await mobileApi.post('/wishlist/toggle', { productId });
      const inWishlist = res.data.data?.inWishlist;
      if (inWishlist) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      return inWishlist;
    } catch (e) {
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const clearCart = async () => {
    if (user) {
      try {
        await mobileApi.delete('/cart/clear');
      } catch (e) {
        // ignore
      }
    }
    setCartItems([]);
    setPricing(defaultPricing);
    setCoupon(null);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        pricing,
        coupon,
        cartCount,
        wishlistIds,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        refreshCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
