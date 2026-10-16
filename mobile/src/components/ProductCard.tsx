import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  horizontal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, horizontal = false }) => {
  const { isInWishlist, toggleWishlist, addToCart } = useCart();
  const wishlisted = isInWishlist(product._id);

  const handleWishlist = (e: any) => {
    e.stopPropagation?.();
    toggleWishlist(product._id);
  };

  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  };

  const ratingAvg = typeof product.rating === 'object' && product.rating?.average
    ? product.rating.average
    : typeof product.rating === 'number'
    ? product.rating
    : 4.8;

  const ratingCount = typeof product.rating === 'object' && product.rating?.count
    ? product.rating.count
    : 84;

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : product.discountPercent || 0;

  const brandName = typeof product.brand === 'object' && product.brand?.name
    ? product.brand.name
    : typeof product.brand === 'string'
    ? product.brand
    : 'AURELIA ATELIER';

  if (horizontal) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.horizontalCard}>
        <View style={styles.horizontalImageWrapper}>
          <Image
            source={{ uri: product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={handleWishlist} style={styles.wishlistBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={16}
              color={wishlisted ? '#E11D48' : '#6B6862'}
            />
          </TouchableOpacity>
          {discount > 0 && (
            <View style={styles.dealBadge}>
              <Text style={styles.dealBadgeText}>−{discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.horizontalInfo}>
          {brandName && <Text style={styles.brandText} numberOfLines={1}>{brandName}</Text>}
          <Text numberOfLines={2} style={styles.title}>
            {product.title}
          </Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#D4AF37" style={{ marginRight: 2 }} />
              <Text style={styles.ratingText}>{Number(ratingAvg).toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingCount}>({ratingCount})</Text>

            {ratingAvg >= 4.0 && (
              <View style={styles.authentiqueBadge}>
                <Ionicons name="diamond" size={9} color="#D4AF37" style={{ marginRight: 3 }} />
                <Text style={styles.authentiqueText}>Authentique</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price?.toLocaleString('en-IN')}</Text>
            {product.mrp > product.price && (
              <>
                <Text style={styles.mrp}>₹{product.mrp?.toLocaleString('en-IN')}</Text>
                <Text style={styles.discount}>−{discount}%</Text>
              </>
            )}
          </View>

          <View style={styles.cardBottomRow}>
            <Text style={styles.deliveryText}>Complimentary Shipping</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.verticalCard}>
      <View style={styles.verticalImageWrapper}>
        <Image
          source={{ uri: product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }}
          style={styles.verticalImage}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={handleWishlist} style={styles.wishlistBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={16}
            color={wishlisted ? '#E11D48' : '#71717A'}
          />
        </TouchableOpacity>
        {discount > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>−{discount}% PRIVÉ</Text>
          </View>
        )}
      </View>

      <View style={styles.verticalInfo}>
        {brandName && <Text style={styles.brandText} numberOfLines={1}>{brandName}</Text>}
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#D4AF37" style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{Number(ratingAvg).toFixed(1)}</Text>
          </View>
          <Text style={styles.ratingCount}>({ratingCount})</Text>

          {ratingAvg >= 4.0 && (
            <View style={styles.authentiqueBadge}>
              <Ionicons name="diamond" size={9} color="#D4AF37" style={{ marginRight: 3 }} />
              <Text style={styles.authentiqueText}>Authentique</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price?.toLocaleString('en-IN')}</Text>
          {product.mrp > product.price && (
            <Text style={styles.mrp}>₹{product.mrp?.toLocaleString('en-IN')}</Text>
          )}
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.deliveryText}>Complimentary Express</Text>
          <TouchableOpacity onPress={handleAdd} style={styles.quickAddBtn} activeOpacity={0.8}>
            <Ionicons name="bag-add-outline" size={13} color="#FAF9F6" />
            <Text style={styles.quickAddText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    overflow: 'hidden',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  horizontalImageWrapper: {
    width: 110,
    height: 140,
    backgroundColor: '#F8F7F4',
    position: 'relative'
  },
  horizontalImage: {
    width: '100%',
    height: '100%'
  },
  horizontalInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between'
  },
  verticalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  verticalImageWrapper: {
    width: '100%',
    height: 170,
    backgroundColor: '#F8F7F4',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  verticalImage: {
    width: '100%',
    height: '100%'
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2
  },
  offerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4
  },
  offerBadgeText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dealBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  dealBadgeText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '800'
  },
  verticalInfo: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F3EE'
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C7335',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111115',
    lineHeight: 18,
    height: 36
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6
  },
  ratingBadge: {
    backgroundColor: '#111115',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  ratingText: {
    color: '#FAF9F6',
    fontSize: 10.5,
    fontWeight: '700'
  },
  ratingCount: {
    fontSize: 10,
    color: '#8A8A93'
  },
  authentiqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 3
  },
  authentiqueText: {
    color: '#8C7335',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A0A0E',
    letterSpacing: -0.3
  },
  mrp: {
    fontSize: 11.5,
    color: '#9E9E9E',
    textDecorationLine: 'line-through'
  },
  discount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C7335'
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F3EE'
  },
  deliveryText: {
    fontSize: 10.5,
    color: '#6B6862',
    fontWeight: '500'
  },
  quickAddBtn: {
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4
  },
  quickAddText: {
    color: '#FAF9F6',
    fontSize: 11,
    fontWeight: '700'
  }
});
