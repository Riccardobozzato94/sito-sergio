/**
 * Google Drive Integration for Panificio Da Sergio CRM
 *
 * Prerequisites:
 * 1. Enable Google Drive API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials
 * 3. Add to .env.local:
 *    - NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 *    - GOOGLE_CLIENT_SECRET=your-client-secret
 *    - GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback
 *
 * Usage:
 * - Upload product images to Drive
 * - Sync documents (invoices, receipts)
 * - Store backup files
 */

import { escapeDriveQueryString, validateImageFile, FILE_LIMITS, ALLOWED_IMAGE_TYPES } from './utils';

// ═══════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Refuse to start if redirect URI is not explicitly configured — prevents
// accidental localhost exposure in production builds.
const GOOGLE_REDIRECT_URI = (() => {
  const uri = process.env.GOOGLE_REDIRECT_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GOOGLE_REDIRECT_URI must be set in production');
    }
    // Development-only fallback (never reaches production)
    return 'http://localhost:3001/api/auth/callback';
  }
  return uri;
})();

const SCOPES = [
  // Scope minimale: accesso solo ai file creati/aperti da questa app
  'https://www.googleapis.com/auth/drive.file',
];

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export interface GoogleDriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
}

// ═══════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * This should be called from a server-side API route
 */
export async function exchangeCodeForTokens(authCode: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: authCode,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Errore durante l\'autenticazione Google');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Errore nel refresh del token');
  }

  const data = await response.json();
  return data.access_token;
}

// ═══════════════════════════════════════════════
// FILE OPERATIONS
// ═══════════════════════════════════════════════

/**
 * Upload a file to Google Drive
 */
export async function uploadToDrive(
  accessToken: string,
  file: File,
  folderId?: string
): Promise<GoogleDriveUploadResult> {
  const metadata = {
    name: file.name,
    ...(folderId && { parents: [folderId] }),
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Errore durante l\'upload su Google Drive');
  }

  return response.json();
}

/**
 * Upload a product image to Google Drive.
 * Validates file type/size before uploading, then stores it in the
 * "panificio-da-sergio/product-images" folder.
 */
export async function uploadProductImage(
  accessToken: string,
  file: File,
  productName: string
): Promise<GoogleDriveUploadResult> {
  // Validate before uploading
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const folderId = await getOrCreateFolder(accessToken, 'panificio-da-sergio', 'product-images');

  // Rename to a deterministic slug so Drive stays organised
  const ext = file.name.split('.').pop() ?? 'jpg';
  const { generateSlug } = await import('./utils');
  const renamedFile = new File([file], `${generateSlug(productName)}.${ext}`, { type: file.type });

  return uploadToDrive(accessToken, renamedFile, folderId);
}

/**
 * Get or create a folder in Google Drive
 */
export async function getOrCreateFolder(
  accessToken: string,
  parentFolderName: string,
  subFolderName: string
): Promise<string> {
  // Search for parent folder
  const parentFolder = await searchFolder(accessToken, parentFolderName, 'root');
  
  let parentId: string;
  if (parentFolder) {
    parentId = parentFolder.id;
  } else {
    // Create parent folder
    parentId = await createFolder(accessToken, parentFolderName, 'root');
  }

  // Search for subfolder
  const subFolder = await searchFolder(accessToken, subFolderName, parentId);
  
  if (subFolder) {
    return subFolder.id;
  }

  // Create subfolder
  return createFolder(accessToken, subFolderName, parentId);
}

/**
 * Search for a folder by name.
 * Escapes query parameters to prevent Drive API query injection.
 */
export async function searchFolder(
  accessToken: string,
  name: string,
  parentId: string
): Promise<GoogleDriveFile | null> {
  const safeName = escapeDriveQueryString(name);
  const safeParentId = escapeDriveQueryString(parentId);
  const query = `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${safeParentId}' in parents and trashed=false`;
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Errore nella ricerca della cartella');
  }

  const data = await response.json();
  return data.files[0] || null;
}

/**
 * Create a folder in Google Drive
 */
export async function createFolder(
  accessToken: string,
  name: string,
  parentId: string
): Promise<string> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });

  if (!response.ok) {
    throw new Error('Errore nella creazione della cartella');
  }

  const data = await response.json();
  return data.id;
}

/**
 * List files in a folder.
 * Escapes folderId to prevent Drive API query injection.
 */
export async function listDriveFiles(
  accessToken: string,
  folderId: string
): Promise<GoogleDriveFile[]> {
  const safeId = escapeDriveQueryString(folderId);
  const query = `'${safeId}' in parents and trashed=false`;
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,webContentLink,thumbnailLink)&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Errore nel recupero dei file');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Delete a file from Google Drive
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Errore nell\'eliminazione del file');
  }
}

// ═══════════════════════════════════════════════
// DOCUMENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * Upload a document (invoice, receipt, etc.) to Drive
 */
export async function uploadDocument(
  accessToken: string,
  file: File,
  documentType: 'invoice' | 'receipt' | 'order' | 'other'
): Promise<GoogleDriveUploadResult> {
  const folderName = `panificio-${documentType}s`;
  const folderId = await getOrCreateFolder(accessToken, 'panificio-da-sergio', folderName);
  
  return uploadToDrive(accessToken, file, folderId);
}

/**
 * Generate a shareable link for a file.
 * Throws if either the permission grant or the metadata fetch fails.
 */
export async function makeFilePublic(
  accessToken: string,
  fileId: string
): Promise<string> {
  // Grant "anyone with the link" read access
  const permResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }
  );

  if (!permResponse.ok) {
    const err = await permResponse.json();
    throw new Error(err.error?.message || 'Errore nell\'impostazione dei permessi');
  }

  // Retrieve the shareable link
  const metaResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=webViewLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaResponse.ok) {
    throw new Error('Errore nel recupero del link condivisibile');
  }

  const data = await metaResponse.json();
  return data.webViewLink as string;
}

// ═══════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Check if Google Drive is configured
 */
export function isGoogleDriveConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-client-id.apps.googleusercontent.com';
}

/**
 * Get the current configuration status
 */
export function getDriveConfigStatus(): {
  configured: boolean;
  missingVars: string[];
} {
  const missingVars: string[] = [];
  
  if (!GOOGLE_CLIENT_ID) missingVars.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missingVars.push('GOOGLE_CLIENT_SECRET');
  if (!process.env.GOOGLE_REDIRECT_URI) missingVars.push('GOOGLE_REDIRECT_URI');
  
  return {
    configured: missingVars.length === 0,
    missingVars,
  };
}
