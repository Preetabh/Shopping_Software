import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onNavigateCart: () => void;
  onBuyNow: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onNavigateCart,
  onBuyNow
}) => {
  const { addToCart, isInWishlist, toggleWishlist, cartCount } = useCart();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [activeTab, setActiveTab] = useState<'highlights' | 'specs' | 'reviews'>('highlights');
  const [pincode, setPincode] = useState('560034');
  const [pincodeChecked, setPincodeChecked] = useState(true);

  const wishlisted = isInWishlist(product._id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const discountPercent =
    currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const savings = currentMrp - currentPrice;
  const images =
    product.images && product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1, selectedVariant?._id, selectedVariant?.name);
      alert(`"${product.title}" has been added to your Aurelia Shopping Bag.`);
    } catch (e: any) {
      alert(e.message || 'Added to shopping bag');
    }
  };

  const handleBuyNowPress = () => {
    onBuyNow();
  };

  const ratingAvg =
    typeof product.rating === 'object' && product.rating?.average
      ? product.rating.average
      : typeof product.rating === 'number'
      ? product.rating
      : 4.9;

  const ratingCount =
    typeof product.rating === 'object' && product.rating?.count
      ? product.rating.count
      : 142;

  return (
    <View style={styles.screen}>
      {/* Top App Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>A U R E L I A</Text>
        </View>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => toggleWishlist(product._id)} style={styles.iconButton}>
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlisted ? '#E11D48' : '#FAF9F6'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateCart} style={styles.cartButton}>
            <Ionicons name="bag-handle-outline" size={22} color="#FAF9F6" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery Carousel */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIdx(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUrl, i) => (
              <View key={i} style={styles.gallerySlide}>
                <Image source={{ uri: imgUrl }} style={styles.productImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.galleryDots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.galleryDot, i === activeImageIdx && styles.galleryDotActive]}
                />
              ))}
            </View>
          )}

          {/* Authentique Badge Overlay */}
          <View style={styles.authentiquePill}>
            <Ionicons name="diamond" size={10} color="#D4AF37" style={{ marginRight: 4 }} />
            <Text style={styles.authentiqueText}>Aurelia Authentique</Text>
          </View>
        </View>

        {/* Product Details Main Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.brandTitle}>
            {product.brand ? (typeof product.brand === 'object' ? product.brand.name : product.brand) : 'MAISON AURELIA'}
          </Text>
          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Star Rating & Verified Connoisseurs */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#D4AF37" style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>{Number(ratingAvg).toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingCountText}>
              {ratingCount.toLocaleString()} Connoisseur Reviews
            </Text>
          </View>

          {/* Special Privilège Tag */}
          <View style={styles.specialPriceTag}>
            <Ionicons name="sparkles" size={11} color="#8C7335" />
            <Text style={styles.specialPriceText}>Aurelia Privé Courtesy</Text>
          </View>

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <Text style={styles.currentPrice}>₹{currentPrice?.toLocaleString('en-IN')}</Text>
            {currentMrp > currentPrice && (
              <>
                <Text style={styles.mrpText}>₹{currentMrp?.toLocaleString('en-IN')}</Text>
                <Text style={styles.discountText}>−{discountPercent}% PRIVILÈGE</Text>
              </>
            )}
          </View>

          {/* Savings Highlight */}
          {savings > 0 && (
            <View style={styles.savingsBanner}>
              <Ionicons name="shield-checkmark" size={14} color="#8C7335" />
              <Text style={styles.savingsText}>
                Privileged Courtesy savings of ₹{savings.toLocaleString('en-IN')} applied.
              </Text>
            </View>
          )}

          {/* Stock Alert */}
          {product.stock <= 5 && product.stock > 0 && (
            <Text style={styles.lowStockWarning}>
              Limited Atelier Availability • Only {product.stock} pieces remaining
            </Text>
          )}
        </View>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Select Edition / Specification</Text>
            <View style={styles.variantChipsContainer}>
              {product.variants.map((v) => {
                const isSelected = selectedVariant?._id === v._id;
                return (
                  <TouchableOpacity
                    key={v._id || v.sku}
                    onPress={() => setSelectedVariant(v)}
                    style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.variantChipText, isSelected && styles.variantChipTextSelected]}
                    >
                      {v.name}
                    </Text>
                    <Text style={[styles.variantChipPrice, isSelected && styles.variantChipPriceSelected]}>
                      ₹{v.price.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Delivery & White-Glove Concierge Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Concierge & Delivery Service</Text>
          <View style={styles.pincodeRow}>
            <Ionicons name="location-outline" size={18} color="#D4AF37" />
            <TextInput
              style={styles.pincodeInput}
              value={pincode}
              onChangeText={setPincode}
              placeholder="Enter Destination Postal Code"
              placeholderTextColor="#8A8A93"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.checkPincodeBtn}
              onPress={() => setPincodeChecked(true)}
            >
              <Text style={styles.checkPincodeText}>Verify</Text>
            </TouchableOpacity>
          </View>

          {pincodeChecked && (
            <View style={styles.deliveryEstimateBox}>
              <View style={styles.estimateRow}>
                <Ionicons name="airplane" size={15} color="#8C7335" />
                <Text style={styles.estimateTitle}>Complimentary White-Glove Delivery by Tomorrow</Text>
              </View>
              <Text style={styles.estimateSub}>Insured signature courier • Gift packaging included</Text>
            </View>
          )}
        </View>

        {/* Tabs: Highlights | Specs | Reviews */}
        <View style={styles.sectionCard}>
          <View style={styles.tabButtonsRow}>
            {(['highlights', 'specs', 'reviews'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab === 'highlights' ? 'Atelier Notes' : tab === 'specs' ? 'Specifications' : 'Reviews'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Highlights Tab */}
          {activeTab === 'highlights' && (
            <View style={styles.tabBody}>
              {product.highlights && product.highlights.length > 0 ? (
                product.highlights.map((h, idx) => (
                  <View key={idx} style={styles.highlightBullet}>
                    <Ionicons name="diamond" size={12} color="#D4AF37" style={{ marginTop: 3 }} />
                    <Text style={styles.highlightText}>{h}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.descriptionText}>{product.description}</Text>
              )}
            </View>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <View style={styles.tabBody}>
              {product.specs && product.specs.length > 0 ? (
                product.specs.map((s, idx) => (
                  <View
                    key={idx}
                    style={[styles.specRow, idx % 2 === 0 && styles.specRowAlt]}
                  >
                    <Text style={styles.specName}>{s.name}</Text>
                    <Text style={styles.specValue}>{s.value}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.subtleText}>Authentic Maison craftsmanship specifications applied.</Text>
              )}
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <View style={styles.tabBody}>
              <View style={styles.reviewSummaryBox}>
                <View style={styles.ratingBadgeLarge}>
                  <Text style={styles.ratingLargeText}>{Number(ratingAvg).toFixed(1)}</Text>
                  <Ionicons name="star" size={15} color="#D4AF37" style={{ marginLeft: 3 }} />
                </View>
                <View>
                  <Text style={styles.verifiedPurchaseTag}>Verified Connoisseur Ratings</Text>
                  <Text style={styles.reviewSub}>Based on {ratingCount.toLocaleString()} verified acquisitions</Text>
                </View>
              </View>

              <View style={styles.sampleReviewCard}>
                <View style={styles.sampleReviewHeader}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>5.0</Text>
                    <Ionicons name="star" size={9} color="#D4AF37" style={{ marginLeft: 2 }} />
                  </View>
                  <Text style={styles.sampleReviewTitle}>Exquisite craftsmanship!</Text>
                </View>
                <Text style={styles.sampleReviewBody}>
                  Exceptional presentation. Arrived in signature luxury gift casing with certified documentation. A true masterpiece!
                </Text>
                <Text style={styles.sampleReviewAuthor}>Vikramaditya S. • Aurelia Privé Member</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="bag-handle-outline" size={18} color="#0A0A0E" />
          <Text style={styles.addToCartText}>ADD TO BAG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNowPress}
          style={styles.buyNowBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={16} color="#D4AF37" />
          <Text style={styles.buyNowText}>ACQUIRE NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF9F6'
  },
  topHeader: {
    backgroundColor: '#0A0A0E',
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitleText: {
    color: '#FAF9F6',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  iconButton: {
    padding: 6
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cartButton: {
    padding: 6,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#D4AF37',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
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
  },
  scrollContent: {
    paddingBottom: 90
  },
  galleryContainer: {
    backgroundColor: '#FFFFFF',
    height: 330,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  gallerySlide: {
    width: width,
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  galleryDots: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    gap: 6
  },
  galleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4D4D8'
  },
  galleryDotActive: {
    width: 18,
    backgroundColor: '#D4AF37'
  },
  authentiquePill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)'
  },
  authentiqueText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C7335',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111115',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  ratingBadge: {
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4
  },
  ratingText: {
    color: '#FAF9F6',
    fontSize: 11,
    fontWeight: '700'
  },
  ratingCountText: {
    fontSize: 11.5,
    color: '#8A8A93'
  },
  specialPriceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12
  },
  specialPriceText: {
    color: '#8C7335',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A0A0E',
    letterSpacing: -0.5
  },
  mrpText: {
    fontSize: 14,
    color: '#9E9E9E',
    textDecorationLine: 'line-through'
  },
  discountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C7335'
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  savingsText: {
    color: '#8C7335',
    fontSize: 11.5,
    fontWeight: '600'
  },
  lowStockWarning: {
    color: '#B91C1C',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 8
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE7DF'
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111115',
    marginBottom: 10,
    letterSpacing: 0.3
  },
  variantChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    backgroundColor: '#FAF9F6'
  },
  variantChipSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#0A0A0E'
  },
  variantChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111115'
  },
  variantChipTextSelected: {
    color: '#D4AF37',
    fontWeight: '700'
  },
  variantChipPrice: {
    fontSize: 11,
    color: '#8A8A93',
    marginTop: 2
  },
  variantChipPriceSelected: {
    color: '#FAF9F6',
    fontWeight: '600'
  },
  pincodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FAF9F6'
  },
  pincodeInput: {
    flex: 1,
    fontSize: 13,
    color: '#111115',
    marginLeft: 8
  },
  checkPincodeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  checkPincodeText: {
    color: '#8C7335',
    fontSize: 13,
    fontWeight: '700'
  },
  deliveryEstimateBox: {
    marginTop: 10,
    backgroundColor: '#FAF9F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  estimateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111115'
  },
  estimateSub: {
    fontSize: 11,
    color: '#8A8A93',
    marginTop: 3,
    marginLeft: 21
  },
  tabButtonsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF',
    marginBottom: 12
  },
  tabButton: {
    paddingVertical: 8,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: '#D4AF37'
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A93'
  },
  tabButtonTextActive: {
    color: '#111115',
    fontWeight: '700'
  },
  tabBody: {
    paddingTop: 4
  },
  highlightBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: '#27272A',
    lineHeight: 18
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  specRowAlt: {
    backgroundColor: '#FAF9F6'
  },
  specName: {
    width: '40%',
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500'
  },
  specValue: {
    width: '60%',
    fontSize: 12,
    color: '#111115',
    fontWeight: '600'
  },
  subtleText: {
    fontSize: 12,
    color: '#8A8A93'
  },
  reviewSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  ratingBadgeLarge: {
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)'
  },
  ratingLargeText: {
    color: '#FAF9F6',
    fontSize: 18,
    fontWeight: '800'
  },
  verifiedPurchaseTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111115'
  },
  reviewSub: {
    fontSize: 11,
    color: '#8A8A93',
    marginTop: 2
  },
  sampleReviewCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  sampleReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  sampleReviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111115'
  },
  sampleReviewBody: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 6
  },
  sampleReviewAuthor: {
    fontSize: 11,
    color: '#8C7335',
    fontWeight: '600'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    borderTopColor: '#EAE7DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111115',
    letterSpacing: 0.5
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5
  }
});
