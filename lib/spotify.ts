// lib/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';
import crypto from 'crypto';

const scopes = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-library-read',
  'user-top-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played',
].join(' ');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

function generateCodeVerifier(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(codeVerifier: string) {
  const base64Digest = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64');
  return base64Digest
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateAuthURL() {
  const codeVerifier = generateCodeVerifier(128);
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authURL = spotifyApi.createAuthorizeURL(
    scopes.split(' '),
    codeVerifier,
    codeChallenge
  );

  return { authURL, codeVerifier };
}

export default spotifyApi;