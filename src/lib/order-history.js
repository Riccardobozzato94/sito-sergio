// Order history utilities — saves last cart for reorder
const STORAGE_KEY = 'panificio-order-history';

export function saveOrderHistory(items) {
  if (!items || items.length === 0) return;
  try {
    var history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.unshift({
      items: items.map(function(i) { return { id: i.id, name: i.name, price: i.price, quantity: i.quantity, unit: i.unit, image_url: i.image_url }; }),
      date: new Date().toISOString()
    });
    // Keep last 5 orders
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch(e) { /* localStorage unavailable */ }
}

export function getOrderHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch(e) { return []; }
}

export function clearOrderHistory() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}
