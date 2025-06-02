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
  const stateParam = searchParams.get("state");

  let userId;
  // ✅ Extract userId from state parameter
  if (stateParam) {
    try {
      const stateObj = JSON.parse(stateParam);
      userId = stateObj.userId;
    } catch (error) {
      console.error("❌ Error parsing state parameter:", error);
    }
  }

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

    const { access_token, refresh_token, expires_in, refresh_token_expires_in } = response.data;
    console.log("✅ eBay Access Token:", access_token);
    console.log("✅ eBay Refresh Token:", refresh_token);

    // ✅ Calculate expiration timestamps
    const access_token_expires_at =  expires_in ; // Convert to milliseconds
    const refresh_token_expires_at = refresh_token_expires_in ; // Convert to milliseconds

    // ✅ Store tokens in the database
    await executeQuery(
      `INSERT INTO ebay_accounts (user_id, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       access_token=VALUES(access_token), 
       refresh_token=VALUES(refresh_token), 
       access_token_expires_at=VALUES(access_token_expires_at), 
       refresh_token_expires_at=VALUES(refresh_token_expires_at)`,
      [userId, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at]
    );

  //  ✅ Close the popup and notify the parent window
    // return new NextResponse(
    //   `<html>
    //     <body>
    //       <script>
    //         window.opener.postMessage({ status: "success" }, "*");
    //         window.close();
    //       </script>
    //     </body>
    //   </html>`,
    //   { headers: { "Content-Type": "text/html" } }
    // );

  } catch (error) {
    const apiError = error as { response?: { data?: unknown } };
    console.error("❌ Error fetching eBay token:", apiError.response?.data || (error as Error).message);
    return NextResponse.json({ 
      error: "Failed to get access token", 
      details: apiError.response?.data 
    }, { status: 500 });
  }
}
