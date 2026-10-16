import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product, Order } from '../types';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AuthScreen } from '../screens/AuthScreen';

type TabType = 'HOME' | 'CATEGORIES' | 'NOTIFICATIONS' | 'ACCOUNT' | 'CART';

export default function AppEntry() {
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();

  // Navigation states
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [categoryFilterSlug, setCategoryFilterSlug] = useState<string>('all');

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSelectCategory = (catSlug: string) => {
    setCategoryFilterSlug(catSlug);
    setActiveTab('CATEGORIES');
  };

  const handleBuyNow = async () => {
    if (selectedProduct) {
      try {
        await addToCart(selectedProduct, 1);
      } catch (e) {
        // ignore
      }
      setSelectedProduct(null);
      if (!user) {
        setShowAuth(true);
      } else {
        setShowCheckout(true);
      }
    }
  };

  const handleProceedCheckout = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowCheckout(true);
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setShowCheckout(false);
    setShowOrders(true);
  };

  // Render Overlay / Modal Screens
  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNavigateCart={() => {
          setSelectedProduct(null);
          setActiveTab('CART');
        }}
        onBuyNow={handleBuyNow}
      />
    );
  }

  if (showCheckout) {
    return (
      <CheckoutScreen
        onBack={() => setShowCheckout(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (showOrders) {
    return (
      <OrdersScreen
        onBack={() => setShowOrders(false)}
        onNavigateHome={() => {
          setShowOrders(false);
          setActiveTab('HOME');
        }}
      />
    );
  }

  if (showWishlist) {
    return (
      <WishlistScreen
        onBack={() => setShowWishlist(false)}
        onNavigateHome={() => {
          setShowWishlist(false);
          setActiveTab('HOME');
        }}
        onNavigateCart={() => {
          setShowWishlist(false);
          setActiveTab('CART');
        }}
        onNavigateProduct={(product) => {
          setShowWishlist(false);
          setSelectedProduct(product);
        }}
      />
    );
  }

  if (showSupport) {
    return (
      <SupportScreen
        onBack={() => setShowSupport(false)}
        onNavigateAuth={() => {
          setShowSupport(false);
          setShowAuth(true);
        }}
      />
    );
  }

  if (showAuth) {
    return (
      <AuthScreen
        onSuccess={() => setShowAuth(false)}
        onClose={() => setShowAuth(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Active Tab Screen */}
      <View style={styles.content}>
        {activeTab === 'HOME' && (
          <HomeScreen
            onNavigateProduct={handleSelectProduct}
            onNavigateCart={() => setActiveTab('CART')}
            onNavigateProfile={() => setActiveTab('ACCOUNT')}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activeTab === 'CATEGORIES' && (
          <CategoryScreen
            initialCategorySlug={categoryFilterSlug}
            onNavigateProduct={handleSelectProduct}
            onNavigateCart={() => setActiveTab('CART')}
          />
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <NotificationsScreen
            onBack={() => setActiveTab('HOME')}
            onNavigateHome={() => setActiveTab('HOME')}
          />
        )}

        {activeTab === 'ACCOUNT' && (
          <ProfileScreen
            onNavigateHome={() => setActiveTab('HOME')}
            onNavigateOrders={() => setShowOrders(true)}
            onNavigateWishlist={() => setShowWishlist(true)}
            onNavigateSupport={() => setShowSupport(true)}
            onNavigateNotifications={() => setActiveTab('NOTIFICATIONS')}
            onNavigateAuth={() => setShowAuth(true)}
          />
        )}

        {activeTab === 'CART' && (
          <CartScreen
            onBack={() => setActiveTab('HOME')}
            onProceedCheckout={handleProceedCheckout}
            onNavigateHome={() => setActiveTab('HOME')}
          />
        )}
      </View>

      {/* Aurelia Luxe Signature Bottom Tab Bar */}
      <SafeAreaView style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('HOME')}
          >
            <Ionicons
              name={activeTab === 'HOME' ? 'sparkles' : 'sparkles-outline'}
              size={21}
              color={activeTab === 'HOME' ? '#D4AF37' : '#8A8A93'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'HOME' && styles.activeNavLabel
              ]}
            >
              Maison
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('CATEGORIES')}
          >
            <Ionicons
              name={activeTab === 'CATEGORIES' ? 'grid' : 'grid-outline'}
              size={21}
              color={activeTab === 'CATEGORIES' ? '#D4AF37' : '#8A8A93'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'CATEGORIES' && styles.activeNavLabel
              ]}
            >
              Collections
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('NOTIFICATIONS')}
          >
            <Ionicons
              name={activeTab === 'NOTIFICATIONS' ? 'notifications' : 'notifications-outline'}
              size={21}
              color={activeTab === 'NOTIFICATIONS' ? '#D4AF37' : '#8A8A93'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'NOTIFICATIONS' && styles.activeNavLabel
              ]}
            >
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('ACCOUNT')}
          >
            <Ionicons
              name={activeTab === 'ACCOUNT' ? 'person' : 'person-outline'}
              size={21}
              color={activeTab === 'ACCOUNT' ? '#D4AF37' : '#8A8A93'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'ACCOUNT' && styles.activeNavLabel
              ]}
            >
              Privé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('CART')}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons
                name={activeTab === 'CART' ? 'bag-handle' : 'bag-handle-outline'}
                size={21}
                color={activeTab === 'CART' ? '#D4AF37' : '#8A8A93'}
              />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'CART' && styles.activeNavLabel
              ]}
            >
              Bag
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6'
  },
  content: {
    flex: 1
  },
  bottomNavContainer: {
    backgroundColor: '#0A0A0E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8
  },
  bottomNav: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5
  },
  navLabel: {
    fontSize: 10,
    color: '#8A8A93',
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  activeNavLabel: {
    color: '#D4AF37',
    fontWeight: '700'
  },
  cartIconContainer: {
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#0A0A0E'
  },
  cartBadgeText: {
    color: '#0A0A0E',
    fontSize: 9,
    fontWeight: '900'
  }
});
