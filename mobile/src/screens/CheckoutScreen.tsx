import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { Address, Order } from '../types';

interface CheckoutScreenProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onBack, onOrderSuccess }) => {
  const { cartItems, pricing, clearCart, coupon } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_RAZORPAY'>('ONLINE_RAZORPAY');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Address Modal
  const [addAddressModal, setAddAddressModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('560034');
  const [locality, setLocality] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await mobileApi.get('/addresses');
      if (res.data.success && res.data.data) {
        setAddresses(res.data.data);
        const def = res.data.data.find((a: Address) => a.isDefault);
        if (def) {
          setSelectedAddressId(def._id);
        } else if (res.data.data.length > 0) {
          setSelectedAddressId(res.data.data[0]._id);
        }
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async () => {
    if (!fullName || !phone || !pincode || !addressLine || !city || !state) {
      alert('Please fill all required address fields');
      return;
    }
    try {
      const res = await mobileApi.post('/addresses', {
        fullName,
        phone,
        pincode,
        locality,
        addressLine,
        city,
        state,
        addressType,
        isDefault: addresses.length === 0
      });
      if (res.data.success) {
        setAddAddressModal(false);
        setAddresses([...addresses, res.data.data]);
        setSelectedAddressId(res.data.data._id);
        setFullName('');
        setPhone('');
        setAddressLine('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address to proceed');
      return;
    }
    try {
      setSubmitting(true);
      const res = await mobileApi.post('/orders', {
        shippingAddressId: selectedAddressId,
        paymentMethod,
        couponCode: coupon?.code || undefined
      });

      if (res.data.success) {
        const orderData = res.data.data;
        await clearCart();
        onOrderSuccess(orderData);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order. Please check item stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSavings = (pricing.totalDiscount || 0) + (pricing.couponDiscount || 0);

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Private Checkout</Text>
      </View>

      {/* Aurelia 3-Step Checkout Bar */}
      <View style={styles.stepsBar}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumActive}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Destination</Text>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumActive}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Review</Text>
        </View>

        <View style={styles.stepConnector} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumActive}>3</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Payment</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Deliver To Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Deliver To This Address</Text>
            <TouchableOpacity
              onPress={() => setAddAddressModal(true)}
              style={styles.addAddressBtn}
            >
              <Ionicons name="add" size={15} color="#2874F0" />
              <Text style={styles.addAddressText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 14 }} color="#2874F0" />
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressBox}>
              <Ionicons name="location-outline" size={36} color="#BDBDBD" />
              <Text style={styles.noAddressTitle}>No saved delivery addresses</Text>
              <TouchableOpacity
                onPress={() => setAddAddressModal(true)}
                style={styles.addNewAddressNowBtn}
              >
                <Text style={styles.addNewAddressNowText}>+ Add Delivery Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              return (
                <TouchableOpacity
                  key={addr._id}
                  onPress={() => setSelectedAddressId(addr._id)}
                  style={[styles.addressItem, isSelected && styles.addressItemSelected]}
                  activeOpacity={0.88}
                >
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>

                  <View style={styles.addressContent}>
                    <View style={styles.addressNameRow}>
                      <Text style={styles.addressName}>{addr.fullName}</Text>
                      <View style={styles.addressTypeBadge}>
                        <Text style={styles.addressTypeText}>{addr.addressType || 'HOME'}</Text>
                      </View>
                    </View>
                    <Text style={styles.addressLine}>
                      {addr.addressLine}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                    </Text>
                    <Text style={styles.addressPhone}>Mobile: {addr.phone}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Order Items Preview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Order Summary ({cartItems.length} items)</Text>
          <View style={styles.itemsPreviewList}>
            {cartItems.map((item) => (
              <View key={item._id} style={styles.summaryItemRow}>
                <Text numberOfLines={1} style={styles.summaryItemTitle}>
                  {item.product.title} (x{item.quantity})
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ₹{((item.price || item.product.price) * item.quantity).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Select Payment Option</Text>

          {/* Razorpay Online */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('ONLINE_RAZORPAY')}
            style={[
              styles.paymentOptionCard,
              paymentMethod === 'ONLINE_RAZORPAY' && styles.paymentOptionActive
            ]}
            activeOpacity={0.88}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'ONLINE_RAZORPAY' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentTitleRow}>
                <Text style={styles.paymentTitle}>Razorpay Online Payment</Text>
                <View style={styles.razorpayBadge}>
                  <Text style={styles.razorpayText}>Instant UPI / Cards</Text>
                </View>
              </View>
              <Text style={styles.paymentSub}>
                Google Pay, PhonePe, Paytm, Credit/Debit Cards & NetBanking
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('COD')}
            style={[
              styles.paymentOptionCard,
              paymentMethod === 'COD' && styles.paymentOptionActive
            ]}
            activeOpacity={0.88}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'COD' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>Pay with cash or UPI upon delivery at doorstep</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price ({cartItems.length} items)</Text>
            <Text style={styles.priceVal}>
              ₹{(pricing.mrpTotal || pricing.subtotal).toLocaleString('en-IN')}
            </Text>
          </View>

          {pricing.totalDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={styles.priceDiscount}>
                - ₹{pricing.totalDiscount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {pricing.couponDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={styles.priceDiscount}>
                - ₹{pricing.couponDiscount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charges</Text>
            <Text style={styles.priceFree}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{pricing.totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          {totalSavings > 0 && (
            <Text style={styles.savingsText}>
              You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>₹{pricing.totalAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.bottomFreeShipping}>Includes all taxes & FREE delivery</Text>
        </View>

        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={submitting}
          style={styles.confirmOrderBtn}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.confirmOrderText}>CONFIRM ORDER</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add Address Modal */}
      <Modal visible={addAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddAddressModal(false)}>
                <Ionicons name="close" size={24} color="#424242" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Receiver name"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 560034"
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />

              <Text style={styles.inputLabel}>Flat, House No., Building *</Text>
              <TextInput
                style={styles.input}
                placeholder="House No., Building"
                value={addressLine}
                onChangeText={setAddressLine}
              />

              <Text style={styles.inputLabel}>Area, Colony, Landmark</Text>
              <TextInput
                style={styles.input}
                placeholder="Near landmark"
                value={locality}
                onChangeText={setLocality}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleCreateAddress} style={styles.saveAddressBtn}>
                <Text style={styles.saveAddressText}>SAVE AND DELIVER HERE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  stepsBar: {
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)'
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E1E26',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleActive: {
    backgroundColor: '#0A0A0E',
    borderColor: '#D4AF37'
  },
  stepNumActive: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800'
  },
  stepLabel: {
    fontSize: 11.5,
    color: '#8A8A93',
    fontWeight: '600',
    letterSpacing: 0.3
  },
  stepLabelActive: {
    color: '#FAF9F6',
    fontWeight: '700'
  },
  stepConnector: {
    width: 20,
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginHorizontal: 8
  },
  scrollContent: {
    paddingBottom: 85
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121'
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  addAddressText: {
    color: '#2874F0',
    fontSize: 12,
    fontWeight: '700'
  },
  noAddressBox: {
    alignItems: 'center',
    paddingVertical: 16
  },
  noAddressTitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 6
  },
  addNewAddressNowBtn: {
    marginTop: 10,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  addNewAddressNowText: {
    color: '#2874F0',
    fontSize: 12,
    fontWeight: '700'
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    gap: 10
  },
  addressItemSelected: {
    borderColor: '#2874F0',
    backgroundColor: '#F8FAFF'
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2874F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2874F0'
  },
  addressContent: {
    flex: 1
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121'
  },
  addressTypeBadge: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3
  },
  addressTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#616161'
  },
  addressLine: {
    fontSize: 12,
    color: '#424242',
    lineHeight: 17,
    marginTop: 4
  },
  addressPhone: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4
  },
  itemsPreviewList: {
    marginTop: 8,
    gap: 6
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  summaryItemTitle: {
    fontSize: 12.5,
    color: '#424242',
    flex: 1,
    marginRight: 10
  },
  summaryItemPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#212121'
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
    gap: 10
  },
  paymentOptionActive: {
    borderColor: '#2874F0',
    backgroundColor: '#F8FAFF'
  },
  paymentInfo: {
    flex: 1
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121'
  },
  razorpayBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3
  },
  razorpayText: {
    color: '#2874F0',
    fontSize: 10,
    fontWeight: '700'
  },
  paymentSub: {
    fontSize: 11,
    color: '#757575',
    marginTop: 3
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#388E3C',
    marginTop: 6
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
  bottomTotal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#212121'
  },
  bottomFreeShipping: {
    fontSize: 10,
    color: '#757575'
  },
  confirmOrderBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  confirmOrderText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121'
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 40
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#212121'
  },
  row: {
    flexDirection: 'row'
  },
  saveAddressBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  saveAddressText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1
  }
});
