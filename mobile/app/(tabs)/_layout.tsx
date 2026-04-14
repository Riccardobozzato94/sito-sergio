import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useCart } from '../../lib/cart-context';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center justify-center pt-1">
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        className={`text-[10px] mt-0.5 font-medium ${focused ? 'text-primary' : 'text-text-faint'}`}
      >
        {label}
      </Text>
    </View>
  );
}

function CartTabIcon({ focused }: { focused: boolean }) {
  const { totalCount } = useCart();
  return (
    <View className="items-center justify-center pt-1">
      <View>
        <Text style={{ fontSize: 20 }}>🛒</Text>
        {totalCount > 0 && (
          <View className="absolute -top-1 -right-2 bg-primary rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-[9px] font-bold text-bg">{totalCount > 9 ? '9+' : totalCount}</Text>
          </View>
        )}
      </View>
      <Text className={`text-[10px] mt-0.5 font-medium ${focused ? 'text-primary' : 'text-text-faint'}`}>
        Carrello
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0e0e0e',
          borderTopColor: '#2a2725',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍞" label="Prodotti" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="ℹ️" label="Info" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
