import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { LuxeHeader } from '../components/LuxeHeader';
import { ProductCard } from '../components/ProductCard';
import { Product, Banner, Category } from '../types';

const { width } = Dimensions.get('window');

// Luxury Category Styling
const CATEGORY_STYLES: Record<string, { icon: any; bg: string; color: string }> = {
  mobiles: { icon: 'phone-portrait-outline', bg: '#181820', color: '#D4AF37' },
  electronics: { icon: 'laptop-outline', bg: '#181820', color: '#D4AF37' },
  fashion: { icon: 'shirt-outline', bg: '#181820', color: '#D4AF37' },
  appliances: { icon: 'tv-outline', bg: '#181820', color: '#D4AF37' },
  home: { icon: 'home-outline', bg: '#181820', color: '#D4AF37' },
  beauty: { icon: 'sparkles-outline', bg: '#181820', color: '#D4AF37' },
  default: { icon: 'grid-outline', bg: '#181820', color: '#D4AF37' }
};

interface HomeScreenProps {
  onNavigateProduct: (product: Product) => void;
  onNavigateCart: () => void;
  onNavigateProfile: () => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateProduct,
  onNavigateCart,
  onNavigateProfile,
  onSelectCategory
}) => {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dealsOfDay, setDealsOfDay] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Live countdown timer for Curated Privilèges (ticking)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });

  // Search state
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetchHomeData();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [bannerRes, catRes, sectionsRes, productsRes] = await Promise.all([
        mobileApi.get('/banners'),
        mobileApi.get('/categories?parent=root'),
        mobileApi.get('/products/home-sections'),
        mobileApi.get('/products?limit=20')
      ]);

      if (bannerRes.data.success) setBanners(bannerRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (sectionsRes.data.success) {
        setDealsOfDay(sectionsRes.data.data.dealsOfDay || []);
        setTrending(sectionsRes.data.data.trendingProducts || []);
        setFeatured(sectionsRes.data.data.featuredProducts || []);
      }
      if (productsRes.data.success) {
        setAllProducts(productsRes.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching home data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredProducts(null);
    } else {
      const q = text.toLowerCase();
      const filtered = allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (typeof p.brand === 'object' && p.brand?.name?.toLowerCase().includes(q)) ||
          (typeof p.category === 'object' && p.category?.name?.toLowerCase().includes(q))
      );
      setFilteredProducts(filtered);
    }
  };

  const getCategoryMeta = (slug?: string) => {
    if (!slug) return CATEGORY_STYLES.default;
    const key = slug.toLowerCase();
    for (const k of Object.keys(CATEGORY_STYLES)) {
      if (key.includes(k)) return CATEGORY_STYLES[k];
    }
    return CATEGORY_STYLES.default;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>AURELIA LUXE</Text>
        <Text style={styles.loadingSub}>Curating Maison Collections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LuxeHeader
        searchQuery={search}
        onSearchChange={handleSearch}
        onCartPress={onNavigateCart}
        onProfilePress={onNavigateProfile}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* If Search is Active */}
        {filteredProducts !== null ? (
          <View style={styles.searchSection}>
            <Text style={styles.searchTitle}>
              Curated {filteredProducts.length} pieces for "{search}"
            </Text>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptySearch}>
                <Ionicons name="sparkles-outline" size={48} color="#D4AF37" />
                <Text style={styles.emptySearchText}>No matching pieces found.</Text>
                <Text style={styles.emptySearchSub}>Try searching for high-end brands, timepieces, or jewellery.</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {filteredProducts.map((p) => (
                  <View key={p._id} style={styles.gridItem}>
                    <ProductCard product={p} onPress={() => onNavigateProduct(p)} />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Luxury Category Carousel */}
            <View style={styles.categoriesSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                {categories.map((c) => {
                  const meta = getCategoryMeta(c.slug);
                  return (
                    <TouchableOpacity
                      key={c._id}
                      onPress={() => onSelectCategory(c.slug)}
                      style={styles.categoryItem}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryIconCircle, { backgroundColor: meta.bg }]}>
                        {c.image ? (
                          <Image source={{ uri: c.image }} style={styles.categoryIconImage} resizeMode="cover" />
                        ) : (
                          <Ionicons name={meta.icon} size={20} color={meta.color} />
                        )}
                      </View>
                      <Text numberOfLines={1} style={styles.categoryName}>
                        {c.name.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Editorial Hero Banners Slider */}
            {banners.length > 0 && (
              <View style={styles.bannerSection}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 24));
                    setActiveBannerIdx(slide);
                  }}
                  scrollEventThrottle={16}
                >
                  {banners.map((b) => (
                    <TouchableOpacity
                      key={b._id}
                      activeOpacity={0.92}
                      onPress={() => onSelectCategory(b.targetValue || 'mobiles')}
                      style={styles.bannerSlide}
                    >
                      <Image source={{ uri: b.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
                      <View style={styles.bannerOverlay}>
                        <View style={styles.bannerPill}>
                          <Ionicons name="diamond" size={10} color="#D4AF37" style={{ marginRight: 4 }} />
                          <Text style={styles.bannerPillText}>MAISON SHOWCASE</Text>
                        </View>
                        <Text style={styles.bannerTitle}>{b.title}</Text>
                        <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Banner Dot Indicators */}
                <View style={styles.dotsRow}>
                  {banners.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === activeBannerIdx ? styles.dotActive : styles.dotInactive
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Maison Privileges Ticker */}
            <View style={styles.benefitsTicker}>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={13} color="#D4AF37" />
                <Text style={styles.benefitText}>100% Certified Origin</Text>
              </View>
              <View style={styles.tickerDivider} />
              <View style={styles.benefitItem}>
                <Ionicons name="sparkles" size={13} color="#D4AF37" />
                <Text style={styles.benefitText}>Bespoke Concierge</Text>
              </View>
              <View style={styles.tickerDivider} />
              <View style={styles.benefitItem}>
                <Ionicons name="airplane" size={13} color="#D4AF37" />
                <Text style={styles.benefitText}>Global Express Delivery</Text>
              </View>
            </View>

            {/* Curated Privilèges (Timed Selection) */}
            {dealsOfDay.length > 0 && (
              <View style={styles.dealSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.dealBadge}>
                      <Ionicons name="diamond" size={13} color="#D4AF37" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Curated Privilèges</Text>
                      <View style={styles.timerRow}>
                        <Ionicons name="time-outline" size={12} color="#8A8A93" />
                        <Text style={styles.timerText}>
                          {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s remaining
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => onSelectCategory('all')}
                  >
                    <Text style={styles.viewAllText}>DISCOVER ALL</Text>
                    <Ionicons name="chevron-forward" size={12} color="#D4AF37" />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsList}>
                  {dealsOfDay.map((p) => (
                    <View key={p._id} style={{ marginRight: 12 }}>
                      <ProductCard product={p} onPress={() => onNavigateProduct(p)} horizontal />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trending Flagships & Haute Horlogerie */}
            {trending.length > 0 && (
              <View style={styles.trendingSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.dealBadge}>
                      <Ionicons name="flame" size={13} color="#D4AF37" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>The Sovereign Collection</Text>
                      <Text style={styles.sectionSubtitle}>Most coveted haute pieces of the season</Text>
                    </View>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsList}>
                  {trending.map((p) => (
                    <View key={p._id} style={{ marginRight: 12 }}>
                      <ProductCard product={p} onPress={() => onNavigateProduct(p)} horizontal />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Maison VIP Privilège Strip */}
            <View style={styles.promoBannerCard}>
              <View style={styles.promoLeft}>
                <View style={styles.priveTagRow}>
                  <Ionicons name="sparkles" size={11} color="#D4AF37" style={{ marginRight: 4 }} />
                  <Text style={styles.promoTag}>AURELIA PRIVÉ INVITATION</Text>
                </View>
                <Text style={styles.promoHeading}>The Autumn Soirée Privilège</Text>
                <Text style={styles.promoDesc}>Use invitation code AURELIA10 at checkout for privileged atelier courtesies.</Text>
              </View>
              <View style={styles.promoRight}>
                <View style={styles.discountCircle}>
                  <Text style={styles.discountCircleNumber}>10%</Text>
                  <Text style={styles.discountCircleOff}>PRIVÉ</Text>
                </View>
              </View>
            </View>

            {/* Curated Recommendations */}
            <View style={styles.recommendedSection}>
              <View style={styles.recommendedHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Maison Curation</Text>
                  <Text style={styles.sectionSubtitle}>Iconic creations handpicked for discerning connoisseurs</Text>
                </View>
              </View>

              <View style={styles.gridContainer}>
                {(featured.length > 0 ? featured : allProducts).slice(0, 8).map((p) => (
                  <View key={p._id} style={styles.gridItem}>
                    <ProductCard product={p} onPress={() => onNavigateProduct(p)} />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF9F6'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0E'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FAF9F6',
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  loadingSub: {
    marginTop: 6,
    fontSize: 12,
    color: '#D4AF37',
    letterSpacing: 1
  },
  scrollContent: {
    paddingBottom: 30
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  categoriesList: {
    paddingHorizontal: 12,
    gap: 14
  },
  categoryItem: {
    alignItems: 'center',
    width: 68
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  categoryIconImage: {
    width: '100%',
    height: '100%'
  },
  categoryName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#111115',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.6
  },
  bannerSection: {
    padding: 12,
    backgroundColor: '#FAF9F6'
  },
  bannerSlide: {
    width: width - 24,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 14, 0.78)',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)'
  },
  bannerPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  bannerPillText: {
    color: '#D4AF37',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1
  },
  bannerTitle: {
    color: '#FAF9F6',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  bannerSubtitle: {
    color: '#D4D4D8',
    fontSize: 11.5,
    marginTop: 3
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10
  },
  dot: {
    height: 4,
    borderRadius: 2
  },
  dotActive: {
    width: 20,
    backgroundColor: '#D4AF37'
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D4D4D8'
  },
  benefitsTicker: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE7DF'
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  benefitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111115',
    letterSpacing: 0.3
  },
  tickerDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#EAE7DF'
  },
  dealSection: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE7DF'
  },
  trendingSection: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE7DF'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dealBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A0A0E',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#8A8A93',
    marginTop: 2
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  timerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8C7335',
    letterSpacing: 0.5
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3
  },
  viewAllText: {
    color: '#8C7335',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  horizontalProductsList: {
    paddingHorizontal: 14
  },
  promoBannerCard: {
    marginHorizontal: 12,
    marginTop: 14,
    backgroundColor: '#0A0A0E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  promoLeft: {
    flex: 1
  },
  priveTagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  promoTag: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  promoHeading: {
    color: '#FAF9F6',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  promoDesc: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15
  },
  promoRight: {
    marginLeft: 14
  },
  discountCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#16161E',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  discountCircleNumber: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '900'
  },
  discountCircleOff: {
    color: '#FAF9F6',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: -2
  },
  recommendedSection: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAE7DF'
  },
  recommendedHeader: {
    marginBottom: 12,
    paddingHorizontal: 2
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48.5%',
    marginBottom: 12
  },
  searchSection: {
    padding: 14
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111115',
    marginBottom: 12
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  emptySearchText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111115',
    marginTop: 12
  },
  emptySearchSub: {
    fontSize: 12,
    color: '#8A8A93',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20
  }
});
