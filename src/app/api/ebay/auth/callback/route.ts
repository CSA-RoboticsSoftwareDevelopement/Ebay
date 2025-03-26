import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { executeQuery } from '@/config/database'; // ✅ Import your DB connection

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID!;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI!;
const EBAY_TOKEN_URL = process.env.EBAY_API_URL + "/identity/v1/oauth2/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Authorization code missing" }, { status: 400 });
  }

  try {
    // ✅ Exchange authorization code for an access token
    const response = await axios.post(
      EBAY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: EBAY_REDIRECT_URI,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    console.log("✅ eBay Access Token:", access_token);

    // ✅ Store tokens in database
    await executeQuery(
      "INSERT INTO ebay_accounts (user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_token=?, refresh_token=?, expires_at=?",
      [1, access_token, refresh_token, Date.now() + expires_in * 1000, access_token, refresh_token, Date.now() + expires_in * 1000]
    );

    return NextResponse.json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error("❌ Error fetching eBay token:", error);
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }
}
