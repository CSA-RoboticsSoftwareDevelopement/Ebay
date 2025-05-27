import axios from 'axios';
import { executeQuery } from '@/config/database';

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID!;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!;
const EBAY_TOKEN_URL = process.env.EBAY_API_URL + "/identity/v1/oauth2/token";

export const refreshEbayToken = async (userId: number): Promise<string> => {
  try {
    const result = await executeQuery<{ refresh_token: string }>(
      "SELECT refresh_token FROM ebay_accounts WHERE user_id = ?",
      [userId]
    );

    const user = result.length > 0 ? result[0] : null;

    if (!user || !user.refresh_token) {
      throw new Error("No refresh token found.");
    }

    console.log("🔄 Refreshing eBay token for user:", userId);

    const response = await axios.post(
      EBAY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.refresh_token, // ✅ Now safely accessing refresh_token
        scope: "https://api.ebay.com/oauth/api_scope",
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    console.log("✅ Refreshed eBay Access Token:", access_token);

    await executeQuery(
      "UPDATE ebay_accounts SET access_token=?, expires_at=? WHERE user_id=?",
      [access_token, new Date(Date.now() + expires_in * 1000), userId]
    );

    return access_token;
  } catch (error) {
    console.error("❌ Error refreshing eBay token:", error);
    throw new Error("Failed to refresh eBay token.");
  }
};
