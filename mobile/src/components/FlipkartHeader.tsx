import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LuxeTheme } from '../constants/theme';

export interface LuxeHeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSubmitSearch?: () => void;
  onCartPress: () => void;
  onProfilePress: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
}

export const LuxeHeader: React.FC<LuxeHeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  onSubmitSearch,
  onCartPress,
  onProfilePress,
  showBackButton = false,
  onBackPress,
  title
}) => {
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <View style={styles.headerContainer}>
      {/* Top Brand & Actions Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftRow}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.iconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.brandRow}>
                <Ionicons name="diamond" size={16} color="#D4AF37" style={{ marginRight: 6 }} />
                <Text style={styles.brandTitle}>A U R E L I A</Text>
                <View style={styles.priveBadge}>
                  <Text style={styles.priveText}>PRIVÉ</Text>
                  <Ionicons name="sparkles" size={9} color="#D4AF37" style={{ marginLeft: 3 }} />
                </View>
              </View>
              <View style={styles.taglineRow}>
                <Text style={styles.taglineText}>M A I S O N   D E   L U X E</Text>
              </View>
            </View>
          )}

          {title && <Text style={styles.titleText}>{title}</Text>}
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={onProfilePress} style={styles.iconButton} activeOpacity={0.8}>
            <View style={styles.profilePill}>
              <Ionicons
                name={user ? 'person-circle' : 'person-outline'}
                size={17}
                color={user ? '#D4AF37' : '#E4E4E7'}
              />
              <Text style={styles.profileText} numberOfLines={1}>
                {user ? user.name.split(' ')[0] : 'Sign In'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCartPress} style={styles.cartButton} activeOpacity={0.8}>
            <Ionicons name="bag-handle-outline" size={23} color="#FAF9F6" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Luxury Search Input Bar */}
      {!title && onSearchChange && (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={17} color="#D4AF37" style={styles.searchIcon} />
          <TextInput
            placeholder="Search Haute Couture, Timepieces & Jewels..."
            placeholderTextColor="#8A8A93"
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={17} color="#A1A1AA" />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchExtras}>
              <TouchableOpacity style={{ marginRight: 10 }}>
                <Ionicons name="mic-outline" size={18} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="scan-outline" size={18} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Also export as FlipkartHeader for backward-compatibility
export const FlipkartHeader = LuxeHeader;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0A0A0E',
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brandContainer: {
    justifyContent: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandTitle: {
    color: '#FAF9F6',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  priveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8
  },
  priveText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  taglineText: {
    color: '#A1A1AA',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 2
  },
  titleText: {
    color: '#FAF9F6',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconButton: {
    padding: 4
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5
  },
  profileText: {
    color: '#FAF9F6',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 80,
    letterSpacing: 0.3
  },
  cartButton: {
    padding: 6,
    position: 'relative'
  },
  badge: {
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
    borderWidth: 1.5,
    borderColor: '#0A0A0E'
  },
  badgeText: {
    color: '#0A0A0E',
    fontSize: 9.5,
    fontWeight: '900'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161D',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FAF9F6',
    paddingVertical: 0
  },
  clearBtn: {
    padding: 4
  },
  searchExtras: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
