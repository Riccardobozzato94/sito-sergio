import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type CookieItem = { name: string; value: string; options?: Record<string, unknown> };

/** Allow-listed internal paths for the post-auth redirect. */
function sanitizeRedirectPath(next: string | null): string {
  if (!next) return '/';
  // Only allow relative paths starting with '/' — block absolute URLs and
  // protocol-relative URLs that could redirect to attacker-controlled domains.
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  // Strip any embedded newlines or null bytes that could split the header.
  const clean = next.replace(/[\r\n\0]/g, '');
  return clean || '/';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Errore di autenticazione. Riprova.')}`
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Errore di autenticazione. Riprova.')}`
    );
  }

  // Verify user has CRM access
  const { data: crmUser } = await supabase
    .from('crm_users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (!crmUser) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Accesso non autorizzato. Contatta l'amministratore.")}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`, { status: 302 });
}
