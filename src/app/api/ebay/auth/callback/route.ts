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
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }
  if (
    !EBAY_CLIENT_ID ||
    !EBAY_CLIENT_SECRET ||
    !EBAY_REDIRECT_URI ||
    !EBAY_API_URL
  ) {
    console.error("❌ Missing eBay API environment variables.");
    return NextResponse.json(
      { error: "Server misconfiguration: Missing eBay credentials." },
      { status: 500 }
    );
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
          Authorization: `Basic ${Buffer.from(
            `${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_token_expires_in,
    } = response.data;
    console.log("✅ eBay Access Token:", access_token);
    console.log("✅ eBay Refresh Token:", refresh_token);

    // ✅ Calculate expiration timestamps
    const now = Date.now(); // Current timestamp in milliseconds
    const access_token_expires_at = now + expires_in * 1000;
    const refresh_token_expires_at = now + refresh_token_expires_in * 1000;

    // ✅ Store tokens in the database
    await executeQuery(
      `INSERT INTO ebay_accounts (user_id, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       access_token=VALUES(access_token), 
       refresh_token=VALUES(refresh_token), 
       access_token_expires_at=VALUES(access_token_expires_at), 
       refresh_token_expires_at=VALUES(refresh_token_expires_at)`,
      [
        userId,
        access_token,
        refresh_token,
        access_token_expires_at,
        refresh_token_expires_at,
      ]
    );

    //  ✅ Close the popup and notify the parent window
    return new NextResponse(
  `<html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background-color: #fefefe;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .message {
          max-width: 400px;
          background: #ffffff;
          padding: 24px 32px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          text-align: center;
          animation: fadeIn 0.6s ease-in-out;
        }
        .message h2 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #22bb33;
        }
        .message p {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="message">
        <h2>✅ Successfully Authenticated!</h2>
        <p>This window will close automatically in 5 seconds...</p>
      </div>
      <script>
        window.opener.postMessage({ status: "success" }, "*");
        setTimeout(() => window.close(), 5000);
      </script>
    </body>
  </html>`,
  { headers: { "Content-Type": "text/html; charset=UTF-8" } }
);

  } catch (error) {
    const apiError = error as { response?: { data?: unknown } };
    console.error(
      "❌ Error fetching eBay token:",
      apiError.response?.data || (error as Error).message
    );
    return NextResponse.json(
      {
        error: "Failed to get access token",
        details: apiError.response?.data,
      },
      { status: 500 }
    );
  }
}
