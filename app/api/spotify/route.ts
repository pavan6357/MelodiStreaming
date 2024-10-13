import { NextRequest, NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';

async function refreshAccessToken(refreshToken: string) {
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    return data.body['access_token'];
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;

  if (!accessToken || !refreshToken) {
    console.error('Missing tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  spotifyApi.setAccessToken(accessToken);

  try {
    let data;
    switch (endpoint) {
      case 'me':
        data = await spotifyApi.getMe();
        break;
      case 'user-playlists':
        data = await spotifyApi.getUserPlaylists();
        break;
      case 'featured-playlists':
        data = await spotifyApi.getFeaturedPlaylists();
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    return NextResponse.json(data.body);
  } catch (error: any) {
    if (error.statusCode === 401) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        spotifyApi.setAccessToken(newAccessToken);
        try {
          const retryData = await spotifyApi[endpoint]();
          const response = NextResponse.json(retryData.body);
          response.cookies.set('spotify_access_token', newAccessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 // 1 hour
          });
          return response;
        } catch (retryError) {
          console.error('Error after token refresh:', retryError);
        }
      }
    }
    console.error('Spotify API error:', error);
    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}