import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../api/client';
import { Address } from '../types';

interface ProfileScreenProps {
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onNavigateWishlist: () => void;
  onNavigateSupport: () => void;
  onNavigateNotifications: () => void;
  onNavigateAuth: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateHome,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateSupport,
  onNavigateNotifications,
  onNavigateAuth
}) => {
  const { user, token, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // New address state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('560034');
  const [locality, setLocality] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await mobileApi.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = async () => {
    if (!fullName || !phone || !pincode || !addressLine || !city || !state) {
      alert('Please fill all required address fields');
      return;
    }
    try {
      setSavingAddress(true);
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
        setShowAddressModal(false);
        setFullName('');
        setPhone('');
        setLocality('');
        setAddressLine('');
        fetchAddresses();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await mobileApi.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (e) {
      console.error('Failed to delete address:', e);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await mobileApi.put(`/addresses/${id}/default`);
      fetchAddresses();
    } catch (e) {
      console.error('Failed to set default address:', e);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        await logout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => await logout() }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onNavigateHome}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        {user ? (
          <View style={styles.userCard}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>+91 {user.phone || '9876543210'}</Text>
              </View>
            </View>

            <View style={styles.plusMembershipBanner}>
              <View style={styles.plusTag}>
                <Ionicons name="diamond" size={13} color="#D4AF37" />
                <Text style={styles.plusTagText}>Aurelia Privé • Black Tier</Text>
              </View>
              <Text style={styles.plusCoinsText}>2,500 Privilège Coins</Text>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <Ionicons name="sparkles" size={44} color="#D4AF37" />
            <Text style={styles.guestTitle}>Welcome to Aurelia Luxe</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to access your bespoke orders, curated wishlist and exclusive atelier privileges.
            </Text>
            <TouchableOpacity style={styles.guestLoginBtn} onPress={onNavigateAuth}>
              <Text style={styles.guestLoginBtnText}>SIGN IN / PRIVÉ ACCESS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Account Links */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.menuItem} onPress={onNavigateOrders}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="cube-outline" size={20} color="#2874F0" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSubtitle}>Track, return or cancel past orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateWishlist}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="heart-outline" size={20} color="#E91E63" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Wishlist</Text>
              <Text style={styles.menuSubtitle}>Saved items you want to buy later</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateNotifications}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications & Offers</Text>
              <Text style={styles.menuSubtitle}>Discounts, price drops and shipping alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateSupport}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="headset-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>24x7 Customer Support</Text>
              <Text style={styles.menuSubtitle}>Help with orders, returns, payments & tickets</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Saved Addresses Section (Only if logged in) */}
        {user && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved Delivery Addresses</Text>
              <TouchableOpacity
                style={styles.addAddressHeaderBtn}
                onPress={() => setShowAddressModal(true)}
              >
                <Ionicons name="add" size={16} color="#2874F0" />
                <Text style={styles.addAddressHeaderText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {loadingAddresses ? (
              <ActivityIndicator style={{ marginVertical: 14 }} color="#2874F0" />
            ) : addresses.length === 0 ? (
              <View style={styles.emptyAddressBox}>
                <Ionicons name="location-outline" size={32} color="#BDBDBD" />
                <Text style={styles.emptyAddressText}>No saved addresses found</Text>
                <TouchableOpacity
                  style={styles.inlineAddBtn}
                  onPress={() => setShowAddressModal(true)}
                >
                  <Text style={styles.inlineAddBtnText}>+ Add Delivery Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              addresses.map((addr) => (
                <View key={addr._id} style={styles.addressItem}>
                  <View style={styles.addressTop}>
                    <Text style={styles.addressName}>{addr.fullName}</Text>
                    <View style={styles.addressTag}>
                      <Text style={styles.addressTagText}>{addr.addressType || 'HOME'}</Text>
                    </View>
                    {addr.isDefault && (
                      <View style={styles.defaultTag}>
                        <Text style={styles.defaultTagText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressLine}>
                    {addr.addressLine}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                  <Text style={styles.addressPhone}>Mobile: {addr.phone}</Text>

                  <View style={styles.addressActions}>
                    {!addr.isDefault && (
                      <TouchableOpacity
                        style={styles.setDefaultBtn}
                        onPress={() => handleSetDefault(addr._id)}
                      >
                        <Text style={styles.setDefaultText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteAddressBtn}
                      onPress={() => handleDeleteAddress(addr._id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                      <Text style={styles.deleteAddressText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Logout or Switch Account */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            <Text style={styles.logoutBtnText}>Log Out from this Device</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerAppVersion}>Aurelia Luxe • Haute Concierge v1.0.0</Text>
          <Text style={styles.footerSub}>Protected by 256-bit Swiss Banking Grade Encryption</Text>
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={22} color="#424242" />
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

              <Text style={styles.inputLabel}>10-Digit Mobile Number *</Text>
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

              <Text style={styles.inputLabel}>Flat, House No., Building, Street *</Text>
              <TextInput
                style={styles.input}
                placeholder="House No., Street name"
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

              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.typeSelectorRow}>
                {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, addressType === t && styles.activeTypeBtn]}
                    onPress={() => setAddressType(t)}
                  >
                    <Text
                      style={[styles.typeBtnText, addressType === t && styles.activeTypeBtnText]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveAddressBtn}
                onPress={handleAddAddress}
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveAddressBtnText}>SAVE ADDRESS</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 16,
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
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  scrollContent: {
    paddingBottom: 30
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0A0A0E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4AF37'
  },
  avatarText: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111115'
  },
  userEmail: {
    fontSize: 13,
    color: '#6B6862',
    marginTop: 2
  },
  userPhone: {
    fontSize: 12,
    color: '#8A8A93',
    marginTop: 2
  },
  plusMembershipBanner: {
    marginTop: 14,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  plusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  plusTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5
  },
  plusCoinsText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#FAF9F6'
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111115',
    marginTop: 10,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  guestSubtitle: {
    fontSize: 12.5,
    color: '#6B6862',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 20
  },
  guestLoginBtn: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16
  },
  guestLoginBtnText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE7DF'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121'
  },
  addAddressHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  addAddressHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2874F0'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121'
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 66
  },
  emptyAddressBox: {
    padding: 24,
    alignItems: 'center'
  },
  emptyAddressText: {
    fontSize: 13,
    color: '#757575',
    marginTop: 8
  },
  inlineAddBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F0FE',
    borderRadius: 4
  },
  inlineAddBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2874F0'
  },
  addressItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121'
  },
  addressTag: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  addressTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#616161'
  },
  defaultTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  defaultTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32'
  },
  addressLine: {
    fontSize: 12,
    color: '#424242',
    lineHeight: 18
  },
  addressPhone: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8
  },
  setDefaultBtn: {
    paddingVertical: 4
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2874F0'
  },
  deleteAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4
  },
  deleteAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D32F2F'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    gap: 8
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F'
  },
  footerNote: {
    marginTop: 24,
    alignItems: 'center'
  },
  footerAppVersion: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500'
  },
  footerSub: {
    fontSize: 10,
    color: '#BDBDBD',
    marginTop: 2
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6
  },
  activeTypeBtn: {
    borderColor: '#2874F0',
    backgroundColor: '#E8F0FE'
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161'
  },
  activeTypeBtnText: {
    color: '#2874F0'
  },
  saveAddressBtn: {
    backgroundColor: '#FB641B',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
