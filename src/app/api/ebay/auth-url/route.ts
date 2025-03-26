import { NextResponse } from 'next/server';

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID!;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI!;
const EBAY_AUTH_URL = process.env.EBAY_AUTH_URL!;

export async function GET() {
  try {
    const params = new URLSearchParams({
      client_id: EBAY_CLIENT_ID,
      response_type: "code",
      redirect_uri: EBAY_REDIRECT_URI, // ✅ Must match eBay Developer settings
      scope: "https://api.ebay.com/oauth/api_scope",
      state: "randomState123", // ✅ Optional CSRF protection
    });

    return NextResponse.json({ url: `${EBAY_AUTH_URL}/oauth2/authorize?${params.toString()}` });
  } catch (error) {
    console.error("❌ Error generating eBay auth URL:", error);
    return NextResponse.json({ error: "Failed to generate eBay auth URL" }, { status: 500 });
  }
}
