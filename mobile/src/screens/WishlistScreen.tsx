import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { mobileApi } from '../api/client';
import { Product } from '../types';

interface WishlistScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateCart: () => void;
  onNavigateProduct: (product: Product) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onBack,
  onNavigateHome,
  onNavigateCart,
  onNavigateProduct
}) => {
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistProducts();
  }, [wishlistIds]);

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      const res = await mobileApi.get('/wishlist');
      if (res.data.success && res.data.data) {
        // Backend returns wishlist document with populated products
        const items = res.data.data.products || [];
        setProducts(items);
      }
    } catch (e) {
      console.error('Error fetching wishlist products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product._id);
  };

  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Curated Wishlist</Text>
            <Text style={styles.headerSub}>{products.length} {products.length === 1 ? 'creation' : 'creations'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cartIconBtn} onPress={onNavigateCart}>
          <Ionicons name="bag-handle-outline" size={22} color="#FAF9F6" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2874F0" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={50} color="#D4AF37" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySub}>
            Discover and reserve timeless creations from the Aurelia Luxe collections.
          </Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={onNavigateHome}>
            <Text style={styles.shopNowBtnText}>DISCOVER ATELIER</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {products.map((item) => {
            const discount =
              item.mrp > item.price
                ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                : 0;

            return (
              <View key={item._id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() => onNavigateProduct(item)}
                >
                  <Image
                    source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }}
                    style={styles.thumb}
                    resizeMode="contain"
                  />
                  <View style={styles.details}>
                    {item.brand && (
                      <Text style={styles.brandText}>
                        {typeof item.brand === 'string' ? item.brand : item.brand.name}
                      </Text>
                    )}
                    <Text style={styles.titleText} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.ratingRow}>
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>
                          {(item.rating as any)?.average?.toFixed?.(1) || (typeof item.rating === 'number' ? (item.rating as number).toFixed(1) : '4.2')}
                        </Text>
                        <Ionicons name="star" size={10} color="#FFFFFF" />
                      </View>
                      <Text style={styles.ratingCount}>
                        ({(item.rating as any)?.count || (item as any).reviewCount || 120})
                      </Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
                      {discount > 0 && (
                        <>
                          <Text style={styles.mrpText}>₹{item.mrp.toLocaleString('en-IN')}</Text>
                          <Text style={styles.discountText}>{discount}% off</Text>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#757575" />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>

                  <View style={styles.actionDivider} />

                  <TouchableOpacity
                    style={styles.moveToCartBtn}
                    onPress={() => handleMoveToCart(item)}
                  >
                    <Ionicons name="cart-outline" size={16} color="#2874F0" />
                    <Text style={styles.moveToCartBtnText}>Move to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6'
  },
  header: {
    backgroundColor: '#0A0A0E',
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    color: '#FAF9F6',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  headerSub: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 1
  },
  cartIconBtn: {
    padding: 4,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#D4AF37',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    color: '#0A0A0E',
    fontSize: 10,
    fontWeight: '900'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8
  },
  emptySub: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  shopNowBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8
  },
  shopNowBtnText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1
  },
  scrollContent: {
    padding: 12,
    gap: 10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden'
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 14
  },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: 4
  },
  details: {
    flex: 1,
    justifyContent: 'center'
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginTop: 2,
    lineHeight: 17
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  ratingBadge: {
    backgroundColor: '#388E3C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 2
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  ratingCount: {
    fontSize: 11,
    color: '#757575'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121'
  },
  mrpText: {
    fontSize: 12,
    color: '#9E9E9E',
    textDecorationLine: 'line-through'
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#388E3C'
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center'
  },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575'
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEEEEE'
  },
  moveToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6
  },
  moveToCartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C7335'
  }
});
