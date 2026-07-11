// ═══════════════════════════════════════════════════════════
// Supabase Edge Function: Create Stripe Checkout Session
// Deploy with: npx supabase functions deploy create-checkout
// Set secrets: npx supabase secrets set STRIPE_SECRET_KEY=sk_...
//              npx supabase secrets set SUPABASE_SERVICE_KEY=eyJ... (service_role)
// ═══════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || '';
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:4173';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only accept POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const { items, customer_name, customer_email, customer_phone, delivery_method, pickup_time, notes } = await req.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }

    if (!customer_name || !customer_email) {
      return new Response(JSON.stringify({ error: 'Name and email required' }), { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shipping = delivery_method === 'courier' ? 590 : 0; // Stripe uses cents
    const total = subtotal * 100 + shipping; // Convert EUR to cents

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.unit ? `€${item.price.toFixed(2)} ${item.unit}` : undefined,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Spedizione', description: 'Corriere espresso 24-48h' },
          unit_amount: shipping,
        },
        quantity: 1,
      });
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer_email,
      line_items: lineItems,
      payment_method_types: ['card', 'ideal', 'bancontact'],
      payment_intent_data: {
        metadata: {
          customer_name,
          customer_phone: customer_phone || '',
          delivery_method,
          pickup_time: pickup_time || '',
          notes: notes || '',
        },
      },
      metadata: {
        customer_name,
        customer_phone: customer_phone || '',
        delivery_method,
        pickup_time: pickup_time || '',
        notes: notes || '',
      },
      success_url: `${SITE_URL}/#/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/#/checkout?canceled=true`,
    });

    // Save order to Supabase
    const { error: dbError } = await supabase.from('orders').insert({
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
      items: items,
      subtotal: subtotal,
      shipping: shipping / 100,
      total: total / 100,
      delivery_method: delivery_method || 'pickup',
      pickup_time: pickup_time || null,
      notes: notes || null,
      status: 'pending',
      payment_intent_id: session.payment_intent as string,
      payment_status: 'unpaid',
    });

    if (dbError) {
      console.error('Failed to save order to database:', dbError);
      // Don't fail the checkout, but log the error
    }

    // Return the session ID
    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
