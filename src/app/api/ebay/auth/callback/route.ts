import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { executeQuery } from "@/config/database"; // ✅ Import your DB connection

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI;
const EBAY_API_URL = process.env.EBAY_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("user_id"); // ✅ Fetch user_id from query params

  // ✅ Check for missing values
  if (!code) {
    return NextResponse.json({ error: "Authorization code missing" }, { status: 400 });
  }
  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET || !EBAY_REDIRECT_URI || !EBAY_API_URL) {
    console.error("❌ Missing eBay API environment variables.");
    return NextResponse.json({ error: "Server misconfiguration: Missing eBay credentials." }, { status: 500 });
  }
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // ✅ Exchange authorization code for an access token
    const EBAY_TOKEN_URL = `${EBAY_API_URL}/identity/v1/oauth2/token`;
    const response = await axios.post(
      EBAY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: EBAY_REDIRECT_URI, // ✅ Ensure this matches eBay Developer settings
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log("✅ eBay Access Token:", access_token);

    // ✅ Store tokens in the database
    await executeQuery(
      `INSERT INTO ebay_accounts (user_id, access_token, refresh_token, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE access_token=VALUES(access_token), refresh_token=VALUES(refresh_token), expires_at=VALUES(expires_at)`,
      [userId, access_token, refresh_token, Date.now() + expires_in * 1000]
    );

    // ✅ Close the popup and notify the parent window
    return new NextResponse(
      `<html>
        <body>
          <script>
            window.opener.postMessage({ status: "success" }, "*");
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );

  } catch (error: any) {
    console.error("❌ Error fetching eBay token:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to get access token", details: error.response?.data }, { status: 500 });
  }
}
