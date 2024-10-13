import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import querystring from 'querystring'

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const redirect_uri = 'http://localhost:3000/api/callback'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code || null

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const { access_token, refresh_token } = response.data

    // Here you would typically store these tokens securely, e.g., in a database
    // For this example, we'll just set them as cookies
    res.setHeader('Set-Cookie', [
      `access_token=${access_token}; HttpOnly; Path=/; Max-Age=3600`,
      `refresh_token=${refresh_token}; HttpOnly; Path=/; Max-Age=2592000`
    ])

    res.redirect('/')
  } catch (error) {
    console.error('Error during token exchange:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}