import { NextResponse } from 'next/server';

export async function GET() {
  const state = crypto.randomUUID();
  
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/github/callback`);
  authUrl.searchParams.set('scope', 'user:email');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());
  
  // Configuración robusta de la cookie
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}