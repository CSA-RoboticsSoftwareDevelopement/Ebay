import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise'; // ✅ MySQL (Change this for PostgreSQL)

const dbConfig = {
  host: process.env.DB_HOST, // ✅ Ensure these are set in your .env file
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export async function GET(request: NextRequest) {
  console.log("🔹 Received GET request for eBay profile...");

  try {
    const userId = request.nextUrl.searchParams.get('userId');
    console.log("📌 Extracted userId:", userId);

    if (!userId) {
      console.warn("⚠️ Unauthorized request: No userId provided.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Connect to database
    console.log("⏳ Connecting to database...");
    const connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database.");

    // ✅ Fetch eBay account details from `ebay_accounts` table
    console.log("🔎 Fetching eBay account details for userId:", userId);
    const [rows] = await connection.execute(
      'SELECT username, email, access_token FROM ebay_accounts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    console.log("📊 Query result:", rows);

    await connection.end(); // ✅ Close connection
    console.log("🔒 Database connection closed.");

    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn("⚠️ No eBay account found for userId:", userId);
      return NextResponse.json({ error: 'eBay not connected' }, { status: 404 });
    }

    const ebayAccount = rows[0];

    const response = {
      username: (ebayAccount as any).username,
      email: (ebayAccount as any).email,
      isConnected: true,
      token: (ebayAccount as any).access_token, // ✅ Fetching token from DB
    };

    console.log("✅ Sending response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching eBay profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
