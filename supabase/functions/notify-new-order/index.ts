// ═══════════════════════════════════════════════════════════
// Edge Function: notify-new-order
// Triggered by Supabase Database Webhook on INSERT into orders
//
// Setup in Supabase Dashboard:
//   Database → Webhooks → Create webhook
//   Table: orders | Event: INSERT
//   URL: https://<project>.supabase.co/functions/v1/notify-new-order
//
// Env vars needed (Dashboard → Settings → Edge Functions):
//   RESEND_API_KEY — from resend.com (free tier: 100 emails/day)
//   NOTIFY_EMAIL   — email where to receive notifications
//   FROM_EMAIL     — verified sender email on Resend (e.g. ordini@panificiodasergio.it)
// ═══════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const order = body.record;

    if (!order) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    // Fetch full order details (customer + items)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, customers(name, phone, email), order_items(quantity, unit_price, subtotal, products(name))')
      .eq('id', order.id)
      .single();

    const o = fullOrder || order;
    const customer = o.customers;
    const items = o.order_items || [];

    const deliveryLabels: Record<string, string> = {
      pickup: 'Ritiro in negozio',
      courier: 'Spedizione corriere',
      reservation: 'Prenotazione',
    };

    const itemsHtml = items.map((item: { products: { name: string } | null; quantity: number; unit_price: number; subtotal: number }) =>
      `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${item.products?.name || 'Prodotto'}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${Number(item.unit_price).toFixed(2)}€</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${Number(item.subtotal).toFixed(2)}€</td>
      </tr>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Georgia,serif;background:#f5f5f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:#0e0e0e;padding:24px;text-align:center">
      <h1 style="color:#d4a574;margin:0;font-size:24px">Panificio Da Sergio</h1>
      <p style="color:#7a7570;margin:6px 0 0;font-size:14px">Nuovo ordine ricevuto</p>
    </div>
    <div style="padding:24px">
      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-between">
        <div>
          <p style="margin:0;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Ordine</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#111">#${o.id}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888">${new Date(o.created_at).toLocaleString('it-IT')}</p>
        </div>
        <div style="text-align:right">
          <p style="margin:0;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Totale</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#d4a574">${Number(o.total).toFixed(2)}€</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888">${deliveryLabels[o.delivery_method] || o.delivery_method}</p>
        </div>
      </div>

      ${customer ? `
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888">Cliente</h3>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#111">${customer.name || 'Anonimo'}</p>
        ${customer.phone ? `<p style="margin:4px 0 0;color:#555">📞 ${customer.phone}</p>` : ''}
        ${customer.email ? `<p style="margin:2px 0 0;color:#555">✉️ ${customer.email}</p>` : ''}
        ${o.pickup_time ? `<p style="margin:4px 0 0;color:#555">🕐 Ritiro: ${o.pickup_time}</p>` : ''}
      </div>` : ''}

      ${items.length > 0 ? `
      <div style="margin-bottom:20px">
        <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#888">Prodotti</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888">Prodotto</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;color:#888">Q.tà</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#888">Prezzo</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#888">Sub</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right;padding:12px;border-top:2px solid #eee;margin-top:8px">
          ${o.shipping > 0 ? `<p style="margin:0 0 4px;color:#555;font-size:13px">Spedizione: ${Number(o.shipping).toFixed(2)}€</p>` : ''}
          <p style="margin:0;font-size:18px;font-weight:bold;color:#d4a574">Totale: ${Number(o.total).toFixed(2)}€</p>
        </div>
      </div>` : ''}

      ${o.notes ? `
      <div style="background:#fffbf0;border:1px solid #f0d090;border-radius:6px;padding:12px;margin-bottom:20px">
        <h3 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;color:#888">Note</h3>
        <p style="margin:0;color:#555">${o.notes}</p>
      </div>` : ''}

      ${customer?.phone ? `
      <a href="https://wa.me/${customer.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Buongiorno ${customer.name || ''}! Riguardo il suo ordine #${o.id} dal Panificio Da Sergio.`)}"
        style="display:block;background:#25d366;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
        💬 Rispondi su WhatsApp
      </a>` : ''}
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:11px;color:#aaa">
      Panificio Da Sergio · Calle Ponte Caneva 626, Chioggia (VE)
    </div>
  </div>
</body>
</html>`;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'ordini@panificiodasergio.it';

    if (!resendKey || !notifyEmail) {
      console.warn('RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email');
      return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: notifyEmail,
        subject: `🍞 Nuovo ordine #${o.id} — ${customer?.name || 'Cliente'} — ${Number(o.total).toFixed(2)}€`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ sent: true, orderId: o.id }), { headers: corsHeaders });

  } catch (err) {
    console.error('Edge Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
