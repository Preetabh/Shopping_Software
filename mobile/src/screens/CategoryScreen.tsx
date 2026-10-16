import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CategoryScreenProps {
  initialCategorySlug?: string;
  onNavigateProduct: (product: Product) => void;
  onNavigateCart: () => void;
  onBack?: () => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  initialCategorySlug,
  onNavigateProduct,
  onNavigateCart,
  onBack
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await mobileApi.get('/categories?parent=root');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products?limit=50';
      if (selectedCategory && selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      if (sortBy === 'price_low') {
        url += `&sort=price`;
      } else if (sortBy === 'price_high') {
        url += `&sort=-price`;
      } else if (sortBy === 'rating') {
        url += `&sort=-rating.average`;
      }

      const res = await mobileApi.get(url);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load category products:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Maison Collections</Text>
        </View>

        <TouchableOpacity style={styles.cartBtn} onPress={onNavigateCart}>
          <Ionicons name="bag-handle-outline" size={22} color="#FAF9F6" />
        </TouchableOpacity>
      </View>

      {/* In-Category Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#757575" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search within products..."
          placeholderTextColor="#9E9E9E"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Strip */}
      <View style={styles.pillsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedCategory === 'all' && styles.activePill]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.pillText, selectedCategory === 'all' && styles.activePillText]}>
              All Departments
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.pill, selectedCategory === cat._id && styles.activePill]}
              onPress={() => setSelectedCategory(cat._id)}
            >
              <Text style={[styles.pillText, selectedCategory === cat._id && styles.activePillText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {(
            [
              { id: 'featured', label: 'Popular' },
              { id: 'price_low', label: 'Price: Low to High' },
              { id: 'price_high', label: 'Price: High to Low' },
              { id: 'rating', label: 'Customer Rating' }
            ] as const
          ).map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sortChip, sortBy === s.id && styles.activeSortChip]}
              onPress={() => setSortBy(s.id)}
            >
              <Text style={[styles.sortChipText, sortBy === s.id && styles.activeSortChipText]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2874F0" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={60} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySub}>
            Try selecting another category or adjusting your search filters.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.productsScroll}>
          <View style={styles.grid}>
            {filteredProducts.map((p) => (
              <View key={p._id} style={styles.gridItem}>
                <ProductCard product={p} onPress={() => onNavigateProduct(p)} />
              </View>
            ))}
          </View>
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
    paddingBottom: 14,
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
  cartBtn: {
    padding: 6
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111115',
    padding: 0
  },
  pillsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  pillsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  activePill: {
    backgroundColor: '#0A0A0E',
    borderColor: '#D4AF37'
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B6862'
  },
  activePillText: {
    color: '#D4AF37',
    fontWeight: '700'
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A93',
    marginRight: 8,
    letterSpacing: 0.5
  },
  sortScroll: {
    gap: 6
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAE7DF'
  },
  activeSortChip: {
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  sortChipText: {
    fontSize: 11,
    color: '#6B6862',
    fontWeight: '500'
  },
  activeSortChipText: {
    color: '#D4AF37',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4
  },
  productsScroll: {
    padding: 10
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48.5%',
    marginBottom: 10
  }
});
