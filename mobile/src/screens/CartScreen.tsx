import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartScreenProps {
  onBack: () => void;
  onProceedCheckout: () => void;
  onNavigateHome: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onProceedCheckout,
  onNavigateHome
}) => {
  const { user } = useAuth();
  const {
    cartItems,
    pricing,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setApplying(true);
      const msg = await applyCoupon(couponInput.trim());
      setCouponMessage(msg);
      setCouponInput('');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Invalid or ineligible coupon');
    } finally {
      setApplying(false);
    }
  };

  const handleQuickCoupon = (code: string) => {
    setCouponInput(code);
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={54} color="#D4AF37" />
          </View>
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySub}>
            Explore our curated haute horlogerie, couture, and fine jewelry collections.
          </Text>
          <TouchableOpacity onPress={onNavigateHome} style={styles.shopNowBtn} activeOpacity={0.85}>
            <Text style={styles.shopNowBtnText}>DISCOVER ATELIER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalSavings = (pricing.totalDiscount || 0) + (pricing.couponDiscount || 0);

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Shopping Bag ({cartItems.length})</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Deliver to banner */}
        <View style={styles.deliverBanner}>
          <View style={styles.deliverLeft}>
            <Ionicons name="location-sharp" size={18} color="#2874F0" />
            <Text style={styles.deliverText}>Deliver to Bengaluru - 560034</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeAddressText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Savings banner if discount exists */}
        {totalSavings > 0 && (
          <View style={styles.savingsStrip}>
            <Ionicons name="sparkles" size={15} color="#15803D" />
            <Text style={styles.savingsStripText}>
              You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
            </Text>
          </View>
        )}

        {/* Cart Item Cards */}
        <View style={styles.itemsSection}>
          {cartItems.map((item) => {
            const product = item.product;
            const currentItemPrice = item.price || product.price;
            const currentItemMrp = item.mrp || product.mrp;
            const discount =
              currentItemMrp > currentItemPrice
                ? Math.round(((currentItemMrp - currentItemPrice) / currentItemMrp) * 100)
                : 0;

            return (
              <View key={item._id} style={styles.cartCard}>
                <View style={styles.cardMain}>
                  <Image
                    source={{
                      uri: product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
                    }}
                    style={styles.productThumb}
                    resizeMode="contain"
                  />

                  <View style={styles.itemInfo}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {product.title}
                    </Text>

                    {item.variantName && (
                      <Text style={styles.variantTag}>Variant: {item.variantName}</Text>
                    )}

                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>
                        ₹{(currentItemPrice * item.quantity).toLocaleString('en-IN')}
                      </Text>
                      {currentItemMrp > currentItemPrice && (
                        <>
                          <Text style={styles.itemMrp}>
                            ₹{(currentItemMrp * item.quantity).toLocaleString('en-IN')}
                          </Text>
                          <Text style={styles.itemDiscount}>{discount}% off</Text>
                        </>
                      )}
                    </View>

                    <Text style={styles.deliveryNote}>Delivery by Tomorrow | FREE</Text>
                  </View>
                </View>

                {/* Quantity Controls & Remove */}
                <View style={styles.cardActions}>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item._id, item.quantity - 1)}
                      style={styles.stepperBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="remove" size={14} color="#424242" />
                    </TouchableOpacity>

                    <Text style={styles.stepperValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item._id, item.quantity + 1)}
                      style={styles.stepperBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="add" size={14} color="#424242" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeFromCart(item._id)}
                    style={styles.removeActionBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#757575" />
                    <Text style={styles.removeActionText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Coupons Box */}
        <View style={styles.couponCard}>
          <Text style={styles.couponHeading}>Apply Discount Coupon</Text>
          {coupon?.code ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.appliedLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                <View>
                  <Text style={styles.appliedCode}>Coupon "{coupon.code}" Applied</Text>
                  <Text style={styles.appliedSaving}>
                    You saved ₹{coupon.discountAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  placeholder="Enter Privilège Code (e.g. AURELIA10)"
                  placeholderTextColor="#8A8A93"
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                  style={styles.couponInput}
                />
                <TouchableOpacity
                  onPress={handleApplyCoupon}
                  disabled={applying}
                  style={styles.applyBtn}
                >
                  {applying ? (
                    <ActivityIndicator size="small" color="#D4AF37" />
                  ) : (
                    <Text style={styles.applyBtnText}>APPLY</Text>
                  )}
                </TouchableOpacity>
              </View>

              {couponMessage ? (
                <Text style={styles.couponSuccessMsg}>{couponMessage}</Text>
              ) : null}

              {/* Quick Coupon Chips */}
              <View style={styles.couponChipsRow}>
                {['AURELIA10', 'PRIVE500', 'MAISON2026'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    onPress={() => handleQuickCoupon(code)}
                    style={styles.couponChip}
                  >
                    <Ionicons name="sparkles" size={11} color="#D4AF37" />
                    <Text style={styles.couponChipText}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Price Details Breakdown */}
        <View style={styles.priceDetailsCard}>
          <Text style={styles.priceDetailsTitle}>Price Details</Text>
          <View style={styles.divider} />

          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Price ({cartItems.length} items)</Text>
            <Text style={styles.priceVal}>
              ₹{(pricing.mrpTotal || pricing.subtotal).toLocaleString('en-IN')}
            </Text>
          </View>

          {pricing.totalDiscount > 0 && (
            <View style={styles.priceLine}>
              <Text style={styles.priceLabel}>Discount on MRP</Text>
              <Text style={styles.priceDiscount}>
                - ₹{pricing.totalDiscount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {pricing.couponDiscount > 0 && (
            <View style={styles.priceLine}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={styles.priceDiscount}>
                - ₹{pricing.couponDiscount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Delivery Charges</Text>
            <Text style={styles.priceFree}>FREE</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>₹{pricing.totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {totalSavings > 0 && (
            <Text style={styles.savingsFooter}>
              You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
            </Text>
          )}
        </View>

        {/* Safe & Secure Payment Trust Badge */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#757575" />
          <Text style={styles.trustText}>
            Safe and Secure Payments. 100% Authentic products guaranteed.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomTotalAmount}>
            ₹{pricing.totalAmount.toLocaleString('en-IN')}
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.viewPriceDetails}>View Price Details</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onProceedCheckout}
          style={styles.placeOrderBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.placeOrderText}>PROCEED TO PRIVATE CHECKOUT</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    gap: 14
  },
  backBtn: {
    padding: 2
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FAF9F6',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0A0A0E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111115',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  emptySub: {
    fontSize: 13,
    color: '#6B6862',
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
    paddingBottom: 85
  },
  deliverBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  deliverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  deliverText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121'
  },
  changeAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2874F0'
  },
  savingsStrip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7'
  },
  savingsStripText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D'
  },
  itemsSection: {
    gap: 10,
    marginTop: 10
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  cardMain: {
    flexDirection: 'row',
    gap: 14
  },
  productThumb: {
    width: 80,
    height: 80
  },
  itemInfo: {
    flex: 1
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    lineHeight: 18
  },
  variantTag: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121'
  },
  itemMrp: {
    fontSize: 12,
    color: '#878787',
    textDecorationLine: 'line-through'
  },
  itemDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#388E3C'
  },
  deliveryNote: {
    fontSize: 11,
    color: '#388E3C',
    fontWeight: '600',
    marginTop: 4
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    paddingHorizontal: 10
  },
  removeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4
  },
  removeActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575'
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  couponHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  appliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  appliedCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D'
  },
  appliedSaving: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  removeCouponText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700'
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6,
    paddingLeft: 12
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    color: '#212121',
    paddingVertical: 8
  },
  applyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  applyBtnText: {
    color: '#2874F0',
    fontSize: 13,
    fontWeight: '700'
  },
  couponSuccessMsg: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 6
  },
  couponChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4
  },
  couponChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2874F0'
  },
  priceDetailsCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  priceDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  priceLabel: {
    fontSize: 13,
    color: '#424242'
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121'
  },
  priceDiscount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#388E3C'
  },
  priceFree: {
    fontSize: 13,
    fontWeight: '700',
    color: '#388E3C'
  },
  dashedDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121'
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121'
  },
  savingsFooter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#388E3C',
    marginTop: 6
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center'
  },
  trustText: {
    fontSize: 11,
    color: '#757575',
    flex: 1
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8
  },
  bottomPriceInfo: {
    justifyContent: 'center'
  },
  bottomTotalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121'
  },
  viewPriceDetails: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2874F0'
  },
  placeOrderBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  placeOrderText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1
  }
});
