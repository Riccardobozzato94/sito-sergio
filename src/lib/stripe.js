// ═══════════════════════════════════════════════════════════
// Stripe Configuration
// Set VITE_STRIPE_PUBLISHABLE_KEY in .env
// ═══════════════════════════════════════════════════════════

import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise = null;

export function getStripe() {
  if (!stripeKey) {
    console.warn('[Stripe] Missing VITE_STRIPE_PUBLISHABLE_KEY. Payments disabled.');
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
}

export async function createCheckoutSession(items, customerInfo) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${supabaseUrl}/functions/v1/create-checkout`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.image_url,
      })),
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      delivery_method: customerInfo.deliveryMethod,
      pickup_time: customerInfo.pickupTime,
      notes: customerInfo.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create checkout session');
  }

  return response.json();
}
