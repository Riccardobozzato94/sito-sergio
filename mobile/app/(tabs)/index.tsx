import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, RefreshControl,
} from 'react-native';
import { getProducts, type Product } from '../../lib/supabase';
import { useCart } from '../../lib/cart-context';
import { CATEGORIES, type CategoryKey } from '../../lib/config';
import ProductCard from '../../components/ProductCard';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('tutti');
  const [search, setSearch] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastName, setToastName] = useState('');
  const { addItem } = useCart();

  const fetchProducts = useCallback(async (cat: CategoryKey) => {
    try {
      const data = await getProducts(cat === 'tutti' ? undefined : cat);
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts(activeCategory).finally(() => setLoading(false));
  }, [activeCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(activeCategory);
    setRefreshing(false);
  }, [activeCategory]);

  const handleAdd = (product: Product) => {
    addItem(product);
    setToastName(product.name);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCategoryChange = (cat: CategoryKey) => {
    setActiveCategory(cat);
    setSearch('');
  };

  const searchLower = search.trim().toLowerCase();
  const filtered = searchLower
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      )
    : products;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Toast */}
      {toastVisible && (
        <View className="absolute top-16 left-4 right-4 z-50 bg-green-600 rounded-xl px-4 py-3 flex-row items-center gap-2">
          <Text className="text-white font-bold flex-1" numberOfLines={1}>
            ✓ {toastName} aggiunto al carrello
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4a574" />}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard product={item} onAdd={handleAdd} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="px-4 pt-6 pb-4">
              <Text className="text-primary text-2xl font-bold">Panificio Da Sergio</Text>
              <Text className="text-text-dim text-sm mt-0.5">Tradizione con Passione dal 1977</Text>
            </View>

            {/* Search */}
            <View className="mx-4 mb-4 flex-row items-center bg-bg-card border border-border rounded-xl px-3 py-2.5 gap-2">
              <Text className="text-text-faint text-base">🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cerca un prodotto..."
                placeholderTextColor="#5a5650"
                className="flex-1 text-text-main text-sm"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text className="text-text-faint text-base">✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category tabs */}
            <View className="flex-row gap-2 px-4 mb-4 flex-wrap">
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => handleCategoryChange(cat.key)}
                  className={`px-4 py-2 rounded-full border ${
                    activeCategory === cat.key
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-transparent border-border'
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    activeCategory === cat.key ? 'text-primary' : 'text-text-dim'
                  }`}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search result count */}
            {search.length > 0 && (
              <Text className="text-text-faint text-xs text-center mb-3">
                {filtered.length === 0
                  ? 'Nessun prodotto trovato'
                  : `${filtered.length} risultat${filtered.length === 1 ? 'o' : 'i'} per "${search}"`}
              </Text>
            )}

            {/* Loading */}
            {loading && (
              <View className="py-20 items-center">
                <ActivityIndicator color="#d4a574" />
                <Text className="text-text-dim text-sm mt-3">Caricamento prodotti...</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="py-20 items-center px-4">
              <Text className="text-4xl mb-4">🍞</Text>
              <Text className="text-text-muted text-base text-center">
                {search ? `Nessun risultato per "${search}"` : 'Nessun prodotto disponibile'}
              </Text>
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} className="mt-3">
                  <Text className="text-primary text-sm">Cancella ricerca</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
