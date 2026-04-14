import { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Alert, Linking,
} from 'react-native';
import { useCart } from '../../lib/cart-context';
import { BUSINESS } from '../../lib/config';

const WHATSAPP_COOLDOWN_MS = 8_000;
let lastSentAt = 0;

export default function CartScreen() {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  const priceStr = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

  const handleSendOrder = () => {
    if (items.length === 0) return;
    if (!name.trim()) { Alert.alert('Nome richiesto', 'Inserisci il tuo nome per completare l\'ordine'); return; }

    const now = Date.now();
    if (now - lastSentAt < WHATSAPP_COOLDOWN_MS) {
      Alert.alert('Attendi', 'Hai già inviato un ordine di recente. Aspetta qualche secondo.');
      return;
    }

    setSending(true);
    lastSentAt = now;

    const itemLines = items
      .map(i => `• ${i.product.name} × ${i.quantity} — ${priceStr(i.product.price * i.quantity)}`)
      .join('\n');

    const msg = [
      `🍞 *Nuovo Ordine — Panificio Da Sergio*`,
      ``,
      `👤 Nome: ${name.trim()}`,
      phone.trim() ? `📞 Telefono: ${phone.trim()}` : '',
      ``,
      `*Prodotti:*`,
      itemLines,
      ``,
      `💰 *Totale: ${priceStr(totalPrice)}*`,
      notes.trim() ? `\n📝 Note: ${notes.trim()}` : '',
      ``,
      `_(Ordine inviato dall'app Panificio Da Sergio)_`,
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    Linking.openURL(url)
      .then(() => {
        clearCart();
        setName('');
        setPhone('');
        setNotes('');
      })
      .catch(() => Alert.alert('Errore', 'Impossibile aprire WhatsApp'))
      .finally(() => {
        setTimeout(() => setSending(false), WHATSAPP_COOLDOWN_MS);
      });
  };

  if (totalCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="text-5xl mb-4">🛒</Text>
        <Text className="text-text-main text-xl font-bold mb-2">Carrello vuoto</Text>
        <Text className="text-text-dim text-sm text-center">
          Aggiungi prodotti dal menu per iniziare il tuo ordine
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="px-4 pt-6 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-text-main text-2xl font-bold">Il tuo Ordine</Text>
            <Text className="text-text-dim text-sm mt-0.5">{totalCount} prodott{totalCount === 1 ? 'o' : 'i'}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Svuota carrello', 'Rimuovere tutti i prodotti?', [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Svuota', style: 'destructive', onPress: clearCart },
          ])}>
            <Text className="text-red-400 text-sm">Svuota</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View className="mx-4 bg-bg-card rounded-2xl border border-border overflow-hidden mb-4">
          {items.map((item, index) => (
            <View
              key={item.product.id}
              className={`p-4 flex-row items-center gap-3 ${index < items.length - 1 ? 'border-b border-border/30' : ''}`}
            >
              <View className="flex-1">
                <Text className="text-text-main font-medium text-sm" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text className="text-primary text-xs mt-0.5 font-bold">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(item.product.price)} / {item.product.unit}
                </Text>
              </View>

              {/* Quantity controls */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-bg-card border border-border items-center justify-center"
                >
                  <Text className="text-text-main font-bold text-base leading-none">−</Text>
                </TouchableOpacity>
                <Text className="text-text-main font-bold w-6 text-center">{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 items-center justify-center"
                >
                  <Text className="text-primary font-bold text-base leading-none">+</Text>
                </TouchableOpacity>
              </View>

              {/* Subtotal */}
              <Text className="text-text-main font-bold text-sm w-16 text-right">
                {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(item.product.price * item.quantity)}
              </Text>

              {/* Remove */}
              <TouchableOpacity onPress={() => removeItem(item.product.id)} className="ml-1">
                <Text className="text-text-faint text-base">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Total */}
        <View className="mx-4 bg-bg-card rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-text-main font-bold text-lg">Totale</Text>
            <Text className="text-primary font-bold text-2xl">{priceStr(totalPrice)}</Text>
          </View>
          <Text className="text-text-faint text-xs mt-1">
            * Il prezzo finale sarà confermato dal panificio su WhatsApp
          </Text>
        </View>

        {/* Customer info */}
        <View className="mx-4 bg-bg-card rounded-2xl border border-border p-4 mb-4 gap-3">
          <Text className="text-text-muted text-xs uppercase tracking-wider">I tuoi dati</Text>
          <View>
            <Text className="text-text-dim text-xs mb-1">Nome *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Come ti chiami?"
              placeholderTextColor="#5a5650"
              className="bg-bg border border-border rounded-xl px-4 py-3 text-text-main text-sm"
            />
          </View>
          <View>
            <Text className="text-text-dim text-xs mb-1">Telefono (opzionale)</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 ..."
              placeholderTextColor="#5a5650"
              keyboardType="phone-pad"
              className="bg-bg border border-border rounded-xl px-4 py-3 text-text-main text-sm"
            />
          </View>
          <View>
            <Text className="text-text-dim text-xs mb-1">Note (opzionale)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Orario ritiro, richieste speciali..."
              placeholderTextColor="#5a5650"
              multiline
              numberOfLines={3}
              className="bg-bg border border-border rounded-xl px-4 py-3 text-text-main text-sm"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 bg-bg border-t border-border px-4 py-4">
        <TouchableOpacity
          onPress={handleSendOrder}
          disabled={sending}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            sending ? 'bg-primary/50' : 'bg-primary'
          }`}
        >
          <Text className="text-bg font-bold text-base">
            {sending ? 'Apertura WhatsApp...' : '📲 Invia ordine su WhatsApp'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
