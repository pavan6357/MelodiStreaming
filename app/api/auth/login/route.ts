import { NextResponse } from 'next/server';
import { generateAuthURL } from '@/lib/spotify';

export async function GET() {
  const { authURL, codeVerifier } = generateAuthURL();
  
  const response = NextResponse.redirect(authURL);
  response.cookies.set('spotify_code_verifier', codeVerifier, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  });

  return response;
}