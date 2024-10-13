import { NextRequest, NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const codeVerifier = request.cookies.get('spotify_code_verifier')?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url));
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    const response = NextResponse.redirect(new URL('/', request.url));
    
    response.cookies.set('spotify_access_token', access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in
    });
    response.cookies.set('spotify_refresh_token', refresh_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.redirect(new URL('/login?error=token_error', request.url));
  }
}