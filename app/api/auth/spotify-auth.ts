import type { NextApiRequest, NextApiResponse } from 'next'
import querystring from 'querystring'

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const redirect_uri = 'http://localhost:3000/api/callback'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private playlist-modify-public playlist-modify-private user-read-playback-state user-modify-playback-state'

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    }))
}