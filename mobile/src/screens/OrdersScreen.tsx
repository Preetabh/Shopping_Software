import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { Order } from '../types';

interface OrdersScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onBack, onNavigateHome }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await mobileApi.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const doCancelOrder = async (orderId: string) => {
    try {
      const res = await mobileApi.post(`/orders/${orderId}/cancel`, {
        reason: 'Requested by customer'
      });
      if (res.data.success) {
        if (Platform.OS === 'web') alert('Order has been cancelled successfully');
        else Alert.alert('Cancelled', 'Order has been cancelled successfully');
        fetchMyOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm && window.confirm('Are you sure you want to cancel this order?')) {
        doCancelOrder(orderId);
      }
    } else {
      Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => doCancelOrder(orderId) }
      ]);
    }
  };

  const doReturnOrder = async (orderId: string, reason = 'Customer return request via app') => {
    try {
      const res = await mobileApi.post(`/orders/${orderId}/return`, { reason });
      if (res.data.success) {
        const msg = 'Return request submitted. Our team will review within 24 hours.';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Return Requested', msg);
        fetchMyOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request return';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const handleRequestReturn = (orderId: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.prompt) {
      const reason = window.prompt('Please describe the return reason:');
      if (reason) doReturnOrder(orderId, reason);
    } else {
      Alert.alert('Request Return', 'Are you sure you want to request a return for this delivered item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Return', onPress: () => doReturnOrder(orderId) }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2874f0" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // Order Details & Tracking View
  if (selectedOrder) {
    const isCancellable = ['PLACED', 'CONFIRMED', 'PACKED'].includes(selectedOrder.orderStatus);
    const isReturnable = selectedOrder.orderStatus === 'DELIVERED';

    return (
      <View style={styles.screen}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{selectedOrder.orderNumber}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Alert Banner */}
          <View style={styles.statusBanner}>
            <Ionicons
              name={
                selectedOrder.orderStatus === 'DELIVERED'
                  ? 'checkmark-circle'
                  : selectedOrder.orderStatus === 'CANCELLED'
                  ? 'close-circle'
                  : 'cube'
              }
              size={24}
              color={
                selectedOrder.orderStatus === 'DELIVERED'
                  ? '#10b981'
                  : selectedOrder.orderStatus === 'CANCELLED'
                  ? '#ef4444'
                  : '#2874f0'
              }
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusBannerTitle}>{selectedOrder.orderStatus}</Text>
              <Text style={styles.statusBannerSub}>
                Courier: {selectedOrder.tracking?.courierName || 'Ekart Logistics'} • Tracking ID:{' '}
                {selectedOrder.tracking?.trackingNumber || 'Processing'}
              </Text>
            </View>
          </View>

          {/* Items In Order */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Items in Order ({selectedOrder.items?.length})</Text>
            {selectedOrder.items?.map((it, idx) => (
              <View key={idx} style={styles.orderItemRow}>
                <Image source={{ uri: it.image }} style={styles.orderItemThumb} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.orderItemTitle}>{it.title}</Text>
                  {it.variantName && <Text style={styles.variantBadge}>Variant: {it.variantName}</Text>}
                  <Text style={styles.orderItemPrice}>
                    ₹{it.price.toLocaleString('en-IN')} x {it.quantity} unit(s)
                  </Text>
                </View>
                <Text style={styles.orderItemTotal}>₹{it.itemTotal.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>

          {/* Tracking Milestones Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Ekart Courier Tracking Timeline</Text>
            <View style={styles.timeline}>
              {selectedOrder.tracking?.statusUpdates?.map((upd, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineTopRow}>
                      <Text style={styles.timelineStatus}>{upd.status}</Text>
                      <Text style={styles.timelineTime}>{new Date(upd.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.timelineNote}>{upd.note}</Text>
                    {upd.location && <Text style={styles.timelineLoc}>📍 {upd.location}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Delivery Address</Text>
            <Text style={styles.addressName}>{selectedOrder.shippingAddress?.fullName}</Text>
            <Text style={styles.addressLine}>{selectedOrder.shippingAddress?.addressLine}</Text>
            <Text style={styles.addressCity}>
              {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
            </Text>
            <Text style={styles.addressPhone}>Phone: {selectedOrder.shippingAddress?.phone}</Text>
          </View>

          {/* Price Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Total Payment Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Items Subtotal</Text>
              <Text style={styles.priceVal}>₹{selectedOrder.pricing?.subtotal?.toLocaleString('en-IN')}</Text>
            </View>
            {selectedOrder.pricing?.couponDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#10b981' }]}>Coupon Savings</Text>
                <Text style={[styles.priceVal, { color: '#10b981' }]}>
                  -₹{selectedOrder.pricing?.couponDiscount?.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charge</Text>
              <Text style={styles.priceVal}>{selectedOrder.pricing?.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.pricing?.deliveryCharge}`}</Text>
            </View>
            <View style={[styles.priceRow, styles.finalPriceRow]}>
              <Text style={styles.finalPriceLabel}>Total Paid ({selectedOrder.payment?.method})</Text>
              <Text style={styles.finalPriceVal}>₹{selectedOrder.pricing?.totalAmount?.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Action Buttons: Cancel or Return */}
          <View style={{ gap: 10, marginTop: 4 }}>
            {isCancellable && (
              <TouchableOpacity
                onPress={() => handleCancelOrder(selectedOrder._id)}
                style={styles.cancelBtn}
              >
                <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </TouchableOpacity>
            )}

            {isReturnable && (
              <TouchableOpacity
                onPress={() => handleRequestReturn(selectedOrder._id)}
                style={styles.returnBtn}
              >
                <Ionicons name="swap-horizontal" size={18} color="#2874f0" />
                <Text style={styles.returnBtnText}>Request 7-Day Return & Refund</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Order List View
  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acquisitions & Orders ({orders.length})</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={54} color="#D4AF37" />
            <Text style={styles.emptyTitle}>No acquisitions yet</Text>
            <Text style={styles.emptySub}>Explore the Aurelia Atelier for fine timepieces, couture, and jewelry</Text>
            <TouchableOpacity onPress={onNavigateHome} style={styles.shopNowBtn}>
              <Text style={styles.shopNowBtnText}>Discover Atelier Collections</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((ord) => {
            const firstItem = ord.items?.[0];
            return (
              <TouchableOpacity
                key={ord._id}
                onPress={() => setSelectedOrder(ord)}
                style={styles.orderCard}
                activeOpacity={0.8}
              >
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderNumberText}>{ord.orderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: ord.orderStatus === 'DELIVERED' ? '#ecfdf5' : '#eef5ff' }]}>
                    <Text style={[styles.statusBadgeText, { color: ord.orderStatus === 'DELIVERED' ? '#047857' : '#2874f0' }]}>
                      {ord.orderStatus}
                    </Text>
                  </View>
                </View>

                {firstItem && (
                  <View style={styles.orderCardBody}>
                    <Image source={{ uri: firstItem.image }} style={styles.thumbImage} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={styles.orderTitle}>{firstItem.title}</Text>
                      {ord.items.length > 1 && (
                        <Text style={styles.moreItemsText}>+{ord.items.length - 1} more item(s)</Text>
                      )}
                      <Text style={styles.orderTotal}>₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                  </View>
                )}

                <View style={styles.orderCardFooter}>
                  <Text style={styles.orderDateText}>
                    Ordered on {new Date(ord.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.trackOrderText}>Track Order →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b'
  },
  topHeader: {
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 14,
    backgroundColor: '#0A0A0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    gap: 12
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FAF9F6',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  scrollContent: {
    padding: 12,
    gap: 12
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    overflow: 'hidden'
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8
  },
  orderNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2874f0'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  orderCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f8fafc'
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a'
  },
  moreItemsText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8
  },
  orderDateText: {
    fontSize: 11.5,
    color: '#64748b'
  },
  trackOrderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2874f0'
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  statusBannerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  orderItemThumb: {
    width: 50,
    height: 50,
    borderRadius: 6
  },
  orderItemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a'
  },
  variantBadge: {
    fontSize: 11,
    color: '#2874f0'
  },
  orderItemPrice: {
    fontSize: 11.5,
    color: '#64748b'
  },
  orderItemTotal: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  timeline: {
    paddingLeft: 4
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2874f0',
    marginTop: 4
  },
  timelineContent: {
    flex: 1
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  timelineTime: {
    fontSize: 11,
    color: '#94a3b8'
  },
  timelineNote: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2
  },
  timelineLoc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  addressName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  addressLine: {
    fontSize: 12.5,
    color: '#475569'
  },
  addressCity: {
    fontSize: 12.5,
    color: '#475569'
  },
  addressPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  priceLabel: {
    fontSize: 13,
    color: '#475569'
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600'
  },
  finalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 4
  },
  finalPriceLabel: {
    fontSize: 14,
    fontWeight: '800'
  },
  finalPriceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 12
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700'
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    paddingVertical: 12
  },
  returnBtnText: {
    color: '#2874f0',
    fontSize: 14,
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4
  },
  shopNowBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 16
  },
  shopNowBtnText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8
  }
});
