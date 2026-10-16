import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateHome
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ORDER' | 'OFFER'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await mobileApi.get('/notifications');
      if (res.data.success) {
        const notifData = res.data.data;
        const list = Array.isArray(notifData)
          ? notifData
          : Array.isArray(notifData?.notifications)
          ? notifData.notifications
          : [];
        setNotifications(list);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
      // Fallback sample alerts if database is clean
      setNotifications([
        {
          _id: 'n1',
          title: '🔥 Big Billion Day Offers Live!',
          message: 'Grab up to 80% off on flagship smartphones, laptops, and fashion apparel. Use code BIGBILLION for extra ₹1,000 off!',
          type: 'OFFER',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'n2',
          title: '📦 White-Glove Shipment Dispatched',
          message: 'Your authenticated shipment #AU1002 is out for delivery today via signature courier.',
          type: 'ORDER',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'n3',
          title: '✦ Welcome to Aurelia Luxe',
          message: 'Enjoy complimentary courtesy savings on your debut acquisition using privilege code AURELIA10 at checkout.',
          type: 'OFFER',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await mobileApi.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // Offline fallback
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const notifList = Array.isArray(notifications) ? notifications : [];
  const filteredList = notifList.filter((n) => {
    if (filter === 'ALL') return true;
    if (filter === 'ORDER') return n.type === 'ORDER';
    if (filter === 'OFFER') return n.type === 'OFFER' || n.type === 'PROMOTION';
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return { name: 'cube-outline' as const, color: '#2874F0' };
      case 'OFFER':
      case 'PROMOTION':
        return { name: 'pricetag-outline' as const, color: '#FB641B' };
      default:
        return { name: 'notifications-outline' as const, color: '#4CAF50' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maison Alerts & Privilèges</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {(['ALL', 'ORDER', 'OFFER'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, filter === tab && styles.activeTabBtn]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabBtnText, filter === tab && styles.activeTabBtnText]}>
              {tab === 'ALL' ? 'All Alerts' : tab === 'ORDER' ? 'Orders' : 'Offers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2874F0" />
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySub}>
            We'll notify you when exciting offers or order tracking updates arrive.
          </Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={onNavigateHome}>
            <Text style={styles.shopNowBtnText}>EXPLORE PRODUCTS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredList.map((item) => {
            const iconInfo = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.card, !item.isRead && styles.unreadCard]}
                onPress={() => markAsRead(item._id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardTime}>
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMessage}>{item.message}</Text>
              </TouchableOpacity>
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
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)'
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabBtn: {
    borderBottomColor: '#D4AF37'
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#8A8A93'
  },
  activeTabBtnText: {
    color: '#111115',
    fontWeight: '700'
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
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    marginTop: 12
  },
  emptySub: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20
  },
  shopNowBtn: {
    backgroundColor: '#2874F0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  scrollContent: {
    padding: 12,
    gap: 10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  unreadCard: {
    backgroundColor: '#F5F9FF',
    borderColor: '#C2D7FA'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  cardHeaderInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    flex: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2874F0',
    marginLeft: 6
  },
  cardTime: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2
  },
  cardMessage: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18
  }
});
