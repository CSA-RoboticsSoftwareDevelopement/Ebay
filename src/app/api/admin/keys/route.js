import { NextResponse } from "next/server";
import { pool } from "@/config/database"; // ✅ Import database connection
import { v4 as uuidv4 } from "uuid";

// Generate a random signup key
const generateRandomKey = () => {
  return `KEY-${Math.random().toString(36).substr(2, 15).toUpperCase()}`;
};

// ✅ Handle POST request (Generate Key)
export async function POST(req) {
  try {
    const { expiresInDays, createdBy } = await req.json();

    if (!expiresInDays || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const key = generateRandomKey();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000
    ).toISOString();

    // ✅ Insert into database
    const [result] = await pool.execute(
      `INSERT INTO admin_keys (key_value, status, created_by, created_at, expires_at) 
         VALUES (?, 'Available', ?, ?, ?)`,
      [key, createdBy, createdAt, expiresAt]
    );

    return NextResponse.json({
      success: true,
      key: {
        id: result.insertId,
        key,
        status: "Available",
        createdBy,
        createdAt,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error generating key:", error);
    return NextResponse.json(
      { error: "Failed to generate key." },
      { status: 500 }
    );
  }
}

// ✅ Handle GET request (Fetch Keys)
export async function GET() {
  try {
    const [keys] = await pool.execute(
      "SELECT * FROM admin_keys ORDER BY created_at DESC"
    );

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch keys." },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID." }, { status: 400 });
    }

    // ✅ Delete from database
    const [result] = await pool.execute("DELETE FROM admin_keys WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Key not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting key:", error);
    return NextResponse.json(
      { error: "Failed to delete key." },
      { status: 500 }
    );
  }
}
