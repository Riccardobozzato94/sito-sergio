import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../lib/cart-context';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="light" backgroundColor="#0e0e0e" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0e0e0e' } }} />
    </CartProvider>
  );
}
