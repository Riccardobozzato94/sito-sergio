/**
 * Excel Import Utility for Panificio Da Sergio CRM
 * Handles importing products and customers from Excel files (.xlsx, .xls)
 */

import * as XLSX from 'xlsx';
import { createBrowserClient } from './supabase-client';
import { generateSlug, isValidEmail, validateExcelFile } from './utils';

// ═══════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════

export interface ExcelImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface ProductRow {
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  stock_weight_kg?: number | null;
  is_available?: boolean;
}

export interface CustomerRow {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  is_vip?: boolean;
}

// ═══════════════════════════════════════════════
// EXCEL FILE PARSING
// ═══════════════════════════════════════════════

/**
 * Parse an Excel file and return sheet data.
 * Validates file type and size before reading.
 */
export function parseExcelFile(file: File): Promise<Record<string, any[]>> {
  // Validate file before any I/O
  const validation = validateExcelFile(file);
  if (!validation.valid) {
    return Promise.reject(new Error(validation.error));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheets: Record<string, any[]> = {};
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          sheets[sheetName] = XLSX.utils.sheet_to_json(sheet);
        });

        resolve(sheets);
      } catch {
        reject(new Error('Errore nella lettura del file Excel: il file potrebbe essere corrotto'));
      }
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsArrayBuffer(file);
  });
}

// ═══════════════════════════════════════════════
// DATA VALIDATION
// ═══════════════════════════════════════════════

const validCategories = ['pane', 'dolci', 'specialita', 'salato', 'stagionale'];

/**
 * Validate a product row from Excel
 */
export function validateProductRow(row: any): { valid: boolean; data?: ProductRow; error?: string } {
  // Name is required
  if (!row.name || typeof row.name !== 'string' || row.name.trim().length < 2) {
    return { valid: false, error: `Nome mancante o troppo corto: "${row.name}"` };
  }

  // Category validation
  const category = (row.category || 'dolci').toLowerCase().trim();
  const normalizedCategory = validCategories.includes(category) ? category : 'dolci';

  // Price validation
  const price = parseFloat(row.price);
  if (isNaN(price) || price <= 0) {
    return { valid: false, error: `Prezzo non valido per "${row.name}": ${row.price}` };
  }

  return {
    valid: true,
    data: {
      name: row.name.trim(),
      category: normalizedCategory,
      price,
      unit: row.unit || 'al kg',
      description: row.description || '',
      stock_weight_kg: row.stock_weight_kg ? parseFloat(row.stock_weight_kg) : null,
      is_available: row.is_available !== false,
    }
  };
}

/**
 * Validate a customer row from Excel
 */
export function validateCustomerRow(row: any): { valid: boolean; data?: CustomerRow; error?: string } {
  if (!row.name || typeof row.name !== 'string' || row.name.trim().length < 2) {
    return { valid: false, error: `Nome mancante o troppo corto: "${row.name}"` };
  }

  // Email validation if provided (uses shared RFC-compliant regex)
  if (row.email && !isValidEmail(row.email)) {
    return { valid: false, error: `Email non valida per "${row.name}": ${row.email}` };
  }

  return {
    valid: true,
    data: {
      name: row.name.trim(),
      phone: row.phone?.trim() || null,
      email: row.email?.trim() || null,
      notes: row.notes || '',
      is_vip: row.is_vip === true || row.is_vip === 'SI' || row.is_vip === 'Sì',
    }
  };
}

// ═══════════════════════════════════════════════
// IMPORT FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Import products from Excel file
 */
export async function importProductsFromExcel(file: File): Promise<ExcelImportResult> {
  const result: ExcelImportResult = { success: 0, failed: 0, errors: [] };
  
  try {
    const sheets = await parseExcelFile(file);
    const supabase = createBrowserClient();
    
    // Use first sheet or 'prodotti' sheet
    const sheetName = Object.keys(sheets).find(s => s.toLowerCase().includes('prodott')) || Object.keys(sheets)[0];
    const rows = sheets[sheetName] || [];
    
    if (rows.length === 0) {
      result.errors.push('Il foglio Excel è vuoto');
      return result;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = validateProductRow(row);
      
      if (!validation.valid || !validation.data) {
        result.failed++;
        result.errors.push(`Riga ${i + 2}: ${validation.error}`);
        continue;
      }

      // Generate slug using shared utility
      const slug = generateSlug(validation.data.name);

      const { error } = await supabase
        .from('products')
        .insert([{
          ...validation.data,
          slug,
          display_order: i,
        }]);

      if (error) {
        result.failed++;
        result.errors.push(`Riga ${i + 2}: ${error.message}`);
      } else {
        result.success++;
      }
    }
  } catch (error: any) {
    result.errors.push(error.message || 'Errore sconosciuto');
  }

  return result;
}

/**
 * Import customers from Excel file
 */
export async function importCustomersFromExcel(file: File): Promise<ExcelImportResult> {
  const result: ExcelImportResult = { success: 0, failed: 0, errors: [] };
  
  try {
    const sheets = await parseExcelFile(file);
    const supabase = createBrowserClient();
    
    // Use first sheet or 'clienti' sheet
    const sheetName = Object.keys(sheets).find(s => s.toLowerCase().includes('client')) || Object.keys(sheets)[0];
    const rows = sheets[sheetName] || [];
    
    if (rows.length === 0) {
      result.errors.push('Il foglio Excel è vuoto');
      return result;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = validateCustomerRow(row);
      
      if (!validation.valid || !validation.data) {
        result.failed++;
        result.errors.push(`Riga ${i + 2}: ${validation.error}`);
        continue;
      }

      const { error } = await supabase
        .from('customers')
        .insert([validation.data]);

      if (error) {
        result.failed++;
        result.errors.push(`Riga ${i + 2}: ${error.message}`);
      } else {
        result.success++;
      }
    }
  } catch (error: any) {
    result.errors.push(error.message || 'Errore sconosciuto');
  }

  return result;
}

// ═══════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Download an Excel template for products
 */
export function downloadProductTemplate() {
  const headers = ['name', 'category', 'price', 'unit', 'description', 'stock_weight_kg', 'is_available'];
  const exampleRow = ['Bussolà', 'dolci', 2.20, 'al pacco', 'Frollini artigianali...', null, true];
  
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Prodotti');
  
  // Column widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 12 }
  ];
  
  XLSX.writeFile(wb, 'template_prodotti.xlsx');
}

/**
 * Download an Excel template for customers
 */
export function downloadCustomerTemplate() {
  const headers = ['name', 'phone', 'email', 'notes', 'is_vip'];
  const exampleRow = ['Mario Rossi', '+39 333 1234567', 'mario@email.it', 'Cliente VIP', 'SI'];
  
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clienti');
  
  ws['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 25 }, { wch: 30 }, { wch: 10 }
  ];
  
  XLSX.writeFile(wb, 'template_clienti.xlsx');
}

/**
 * Export all products to Excel
 */
export async function exportProductsToExcel() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order');
  
  if (error || !data) {
    throw new Error('Errore nell\'esportazione: ' + (error?.message || 'Nessun dato'));
  }

  const headers = ['name', 'category', 'price', 'unit', 'description', 'stock_weight_kg', 'is_available', 'display_order'];
  const rows = data.map(p => [
    p.name,
    p.category,
    p.price,
    p.unit,
    p.description,
    p.stock_weight_kg,
    p.is_available ? 'SI' : 'NO',
    p.display_order
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Prodotti');
  
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `prodotti_${date}.xlsx`);
}

/**
 * Export all customers to Excel
 */
export async function exportCustomersToExcel() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('total_spent', { ascending: false });
  
  if (error || !data) {
    throw new Error('Errore nell\'esportazione: ' + (error?.message || 'Nessun dato'));
  }

  const headers = ['name', 'phone', 'email', 'notes', 'loyalty_points', 'is_vip', 'total_orders', 'total_spent'];
  const rows = data.map(c => [
    c.name,
    c.phone || '',
    c.email || '',
    c.notes || '',
    c.loyalty_points,
    c.is_vip ? 'SI' : 'NO',
    c.total_orders,
    c.total_spent
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clienti');
  
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `clienti_${date}.xlsx`);
}
