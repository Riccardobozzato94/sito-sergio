/**
 * Shared utility functions for Panificio Da Sergio CRM
 */

// ═══════════════════════════════════════════════
// SLUG GENERATION
// ═══════════════════════════════════════════════

/**
 * Generate a URL-safe slug from an Italian text string.
 * Handles accented characters common in Italian.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ═══════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════

/** RFC-compliant email regex requiring at least 2-char TLD */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/** Italian phone numbers: optional +39, 3xx mobile or landline */
const PHONE_REGEX = /^(\+39\s?)?(\d[\s\-]?){6,14}\d$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

// ═══════════════════════════════════════════════
// STRING SANITIZATION
// ═══════════════════════════════════════════════

/**
 * Escape single quotes in a string for use in Google Drive API queries.
 * The API uses `name='value'` syntax — unescaped quotes break the query.
 */
export function escapeDriveQueryString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ═══════════════════════════════════════════════
// FILE VALIDATION
// ═══════════════════════════════════════════════

export const FILE_LIMITS = {
  EXCEL_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  IMAGE_MAX_BYTES: 5 * 1024 * 1024,  // 5 MB
  DOC_MAX_BYTES: 20 * 1024 * 1024,   // 20 MB
} as const;

export const ALLOWED_EXCEL_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
] as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateExcelFile(file: File): FileValidationResult {
  if (!ALLOWED_EXCEL_TYPES.includes(file.type as typeof ALLOWED_EXCEL_TYPES[number])) {
    return { valid: false, error: 'Il file deve essere in formato Excel (.xlsx o .xls)' };
  }
  if (file.size > FILE_LIMITS.EXCEL_MAX_BYTES) {
    return { valid: false, error: `Il file supera il limite di ${FILE_LIMITS.EXCEL_MAX_BYTES / 1024 / 1024} MB` };
  }
  return { valid: true };
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { valid: false, error: 'Il file deve essere un\'immagine (JPEG, PNG, WebP o GIF)' };
  }
  if (file.size > FILE_LIMITS.IMAGE_MAX_BYTES) {
    return { valid: false, error: `L\'immagine supera il limite di ${FILE_LIMITS.IMAGE_MAX_BYTES / 1024 / 1024} MB` };
  }
  return { valid: true };
}
