import { NextResponse } from "next/server";

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI;
const EBAY_AUTH_URL = process.env.EBAY_AUTH_URL;

export async function GET(request: Request) {
  try {
    // Get user_id from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // ✅ Check for missing environment variables
    if (!EBAY_CLIENT_ID || !EBAY_REDIRECT_URI || !EBAY_AUTH_URL) {
      console.error("❌ Missing required eBay environment variables.");
      return NextResponse.json(
        { error: "Server misconfiguration: Missing eBay API credentials." },
        { status: 500 }
      );
    }

    // ✅ Format scope correctly
    const scopes = [
      "https://api.ebay.com/oauth/api_scope",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
    ].join(" "); // ✅ Ensures correct formatting

    // Include userId in the state parameter to pass it back to the callback
    const state = JSON.stringify({ userId, csrf: "randomState123" });
    
    const params = new URLSearchParams({
      client_id: EBAY_CLIENT_ID,
      response_type: "code",
      redirect_uri: EBAY_REDIRECT_URI, // ✅ Must match eBay Developer settings
      scope: scopes,
      state: state, // ✅ Pass userId in state parameter
    });

    const authUrl = `${EBAY_AUTH_URL}/oauth2/authorize?${params.toString()}`;

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("❌ Error generating eBay auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate eBay auth URL" },
      { status: 500 }
    );
  }
}
