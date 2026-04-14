import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { BUSINESS, HOURS } from '../../lib/config';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mx-4 mb-4 bg-bg-card rounded-2xl border border-border overflow-hidden">
      <View className="px-4 py-3 border-b border-border/50">
        <Text className="text-text-faint text-[10px] uppercase tracking-widest">{title}</Text>
      </View>
      <View className="p-4">{children}</View>
    </View>
  );
}

function InfoRow({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress?: () => void }) {
  const content = (
    <View className="flex-row items-center gap-3 py-2">
      <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</Text>
      <View className="flex-1">
        <Text className="text-text-faint text-[10px] uppercase tracking-wider">{label}</Text>
        <Text className={`text-text-main text-sm mt-0.5 ${onPress ? 'text-primary' : ''}`}>{value}</Text>
      </View>
      {onPress && <Text className="text-text-faint text-xs">›</Text>}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
}

export default function InfoScreen() {
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  // Map Sunday=0 → index 6, Mon=1 → 0 ... Sat=6 → 5
  const todayHoursIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const openPhone = () => Linking.openURL(`tel:${BUSINESS.phone}`).catch(() => {});
  const openWhatsApp = () => Linking.openURL(`https://wa.me/${BUSINESS.whatsappNumber}`).catch(() => {});
  const openMaps = () => Linking.openURL(BUSINESS.mapsUrl).catch(() => {});
  const openEmail = () => Linking.openURL(`mailto:${BUSINESS.email}`).catch(() => {});

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero */}
        <View className="items-center py-8 px-4">
          <Text style={{ fontSize: 52 }}>🏪</Text>
          <Text className="text-primary text-2xl font-bold mt-3">{BUSINESS.name}</Text>
          <Text className="text-text-dim text-sm mt-1">{BUSINESS.slogan}</Text>
          <View className="flex-row items-center gap-1.5 mt-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">Dal {BUSINESS.since}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View className="flex-row gap-3 mx-4 mb-4">
          {[
            { icon: '📞', label: 'Chiama', onPress: openPhone },
            { icon: '💬', label: 'WhatsApp', onPress: openWhatsApp },
            { icon: '📍', label: 'Mappa', onPress: openMaps },
          ].map(btn => (
            <TouchableOpacity
              key={btn.label}
              onPress={btn.onPress}
              className="flex-1 bg-bg-card border border-border rounded-2xl py-4 items-center gap-1"
            >
              <Text style={{ fontSize: 24 }}>{btn.icon}</Text>
              <Text className="text-text-muted text-xs font-medium">{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orari */}
        <Section title="Orari di apertura">
          {HOURS.map((h, i) => {
            const isToday = i === todayHoursIndex;
            const isClosed = h.hours === 'Chiuso';
            return (
              <View
                key={h.day}
                className={`flex-row justify-between items-center py-2 ${
                  i < HOURS.length - 1 ? 'border-b border-border/30' : ''
                } ${isToday ? 'bg-primary/5 -mx-2 px-2 rounded-lg' : ''}`}
              >
                <View className="flex-row items-center gap-2">
                  {isToday && <View className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  <Text className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-main'}`}>
                    {h.day}
                    {isToday ? ' (oggi)' : ''}
                  </Text>
                </View>
                <Text className={`text-sm ${isClosed ? 'text-text-faint' : isToday ? 'text-primary font-bold' : 'text-text-muted'}`}>
                  {h.hours}
                </Text>
              </View>
            );
          })}
        </Section>

        {/* Contatti */}
        <Section title="Contatti">
          <InfoRow icon="📞" label="Telefono" value={BUSINESS.phone} onPress={openPhone} />
          <View className="border-b border-border/30" />
          <InfoRow icon="💬" label="WhatsApp" value={`wa.me/${BUSINESS.whatsappNumber}`} onPress={openWhatsApp} />
          <View className="border-b border-border/30" />
          <InfoRow icon="✉️" label="Email" value={BUSINESS.email} onPress={openEmail} />
          <View className="border-b border-border/30" />
          <InfoRow icon="📍" label="Indirizzo" value={BUSINESS.address} onPress={openMaps} />
        </Section>

        {/* Chi siamo */}
        <Section title="Chi siamo">
          <Text className="text-text-muted text-sm leading-relaxed">
            Il Panificio Da Sergio è una realtà artigianale a Chioggia attiva dal {BUSINESS.since}.
            Con oltre {new Date().getFullYear() - Number(BUSINESS.since)} anni di tradizione, produciamo
            ogni giorno pane fresco, dolci tipici e specialità veneziane con ingredienti selezionati
            e metodi tradizionali.
          </Text>
          <Text className="text-text-muted text-sm leading-relaxed mt-3">
            I nostri prodotti di punta includono la bussola veneziana, i pevarini e le torte di
            mandorle — specialità che da generazioni rendono speciale la tavola dei Chioggiotti.
          </Text>
        </Section>

        {/* Come ordinare */}
        <Section title="Come ordinare">
          {[
            { n: '1', text: 'Sfoglia il catalogo nella scheda Prodotti' },
            { n: '2', text: 'Aggiungi i prodotti che vuoi al carrello' },
            { n: '3', text: 'Vai al carrello e inserisci il tuo nome' },
            { n: '4', text: 'Premi "Invia ordine su WhatsApp"' },
            { n: '5', text: 'Il panificio confermerà il tuo ordine entro breve' },
          ].map(step => (
            <View key={step.n} className="flex-row gap-3 py-2 items-start">
              <View className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 items-center justify-center mt-0.5">
                <Text className="text-primary text-[11px] font-bold">{step.n}</Text>
              </View>
              <Text className="text-text-muted text-sm flex-1 leading-relaxed">{step.text}</Text>
            </View>
          ))}
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}
