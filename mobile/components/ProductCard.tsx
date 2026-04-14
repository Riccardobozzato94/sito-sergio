import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import type { Product } from '../lib/supabase';
import { BUSINESS } from '../lib/config';

const ALLERGEN_LABELS: Record<string, string> = {
  glutine: 'Glutine',
  lattosio: 'Latte',
  uova: 'Uova',
  frutta_guscio: 'Frutta s.guscio',
  arachidi: 'Arachidi',
  sesamo: 'Sesamo',
  soia: 'Soia',
  sedano: 'Sedano',
};

interface Props {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: Props) {
  const [justAdded, setJustAdded] = useState(false);

  const price = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(product.price);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleShare = () => {
    const msg = `Ciao! Ho visto questo prodotto sul sito del Panificio Da Sergio 🍞\n\n*${product.name}*\n${product.description ? product.description + '\n' : ''}Prezzo: ${price} ${product.unit}\n\nOrdina su WhatsApp: https://wa.me/${BUSINESS.whatsappNumber}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const allergenList = Array.isArray(product.allergens) ? product.allergens : [];

  return (
    <View className="bg-bg-card rounded-2xl overflow-hidden border border-border mb-4">
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: product.image_url || 'https://placehold.co/400x400/161616/d4a574?text=🍞' }}
          className="w-full aspect-square"
          resizeMode="cover"
        />
        {product.is_featured && (
          <View className="absolute top-2 left-2 bg-primary px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <Text className="text-bg text-[10px] font-bold uppercase tracking-wide">✦ Del Giorno</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleShare}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 items-center justify-center"
        >
          <Text style={{ fontSize: 14 }}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-text-main text-base font-semibold mb-1" numberOfLines={2}>
          {product.name}
        </Text>
        {product.description ? (
          <Text className="text-text-dim text-xs mb-3 leading-relaxed" numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}

        {/* Price */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-primary font-bold text-lg">{price}</Text>
          <Text className="text-text-faint text-xs uppercase">{product.unit}</Text>
        </View>

        {/* Allergens */}
        {allergenList.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-3">
            {allergenList.map((a) => {
              const label = ALLERGEN_LABELS[a];
              return label ? (
                <View key={a} className="bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  <Text className="text-amber-400 text-[9px] font-semibold uppercase">{label}</Text>
                </View>
              ) : null;
            })}
          </View>
        )}

        {/* Add to cart */}
        <TouchableOpacity
          onPress={handleAdd}
          disabled={justAdded}
          className={`w-full py-3 rounded-xl items-center ${
            justAdded ? 'bg-green-600' : 'bg-primary'
          }`}
        >
          <Text className={`font-bold text-sm ${justAdded ? 'text-white' : 'text-bg'}`}>
            {justAdded ? '✓ Aggiunto!' : 'Aggiungi al carrello'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
