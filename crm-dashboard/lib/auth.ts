'use client';

import { createBrowserClient } from '@/lib/supabase-client';

// â”€â”€ Login with email + password â”€â”€
export async function login(email: string, password: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Use the same generic message for all auth errors to prevent user enumeration.
    // An attacker must not be able to distinguish "email not found" from "wrong password".
    return { error: 'Credenziali non valide. Controlla email e password.' };
  }

  // Check CRM access
  const { data: crmUser, error: crmError } = await supabase
    .from('crm_users')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  if (crmError || !crmUser) {
    await supabase.auth.signOut();
    return { error: 'Accesso non autorizzato. Contatta l\'amministratore.' };
  }

  return { success: true, user: { ...crmUser, id: data.user.id } };
}

// â”€â”€ Google OAuth â”€â”€
export async function signInWithGoogle() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/sito-sergio/admin/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}

// â”€â”€ GitHub OAuth â”€â”€
export async function signInWithGitHub() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/sito-sergio/admin/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}

// â”€â”€ Logout â”€â”€
export async function logout() {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}

// â”€â”€ Get current user (client-side) â”€â”€
export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
