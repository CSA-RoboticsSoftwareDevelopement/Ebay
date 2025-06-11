import { NextResponse } from "next/server";
import { pool } from "@/config/database"; // Import database connection

function formatDateToMySQL(datetime) {
  return datetime.toISOString().slice(0, 19).replace("T", " ");
}

// Generate a random signup key
const generateRandomKey = () => {
  return `${Math.random().toString(36).substr(2, 15).toUpperCase()}`;
};

// ✅ Handle POST request (Generate Key)
export async function POST(req) {
  try {
    const { expiresInDays, payment_mode, payment_date } = await req.json();

    if (!expiresInDays || !payment_mode || !payment_date) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const key = generateRandomKey();
    const createdAt = formatDateToMySQL(new Date());
    const expiresAt = formatDateToMySQL(
      new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000)
    );

    const [result] = await pool.execute(
      `INSERT INTO license_key (license_key, status, payment_mode, payment_date, created_at, expires_at)
       VALUES (?, 'Not Activated', ?, ?,  ?, ?)`,
      [key, payment_mode, payment_date, createdAt, expiresAt]
    );

    return NextResponse.json({
      success: true,
      key: {
        id: result.insertId,
        key,
        status: "Not Activated",
        payment_mode,
        payment_date,
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
    // ✅ Automatically mark expired keys as "Expired"
    await pool.execute(
      "UPDATE license_key SET status = 'Expired' WHERE expires_at < NOW() AND status != 'Expired'"
    );

    // ✅ Fetch all keys after updating their status
    const [keys] = await pool.execute(
      "SELECT * FROM license_key ORDER BY created_at DESC"
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
    const [result] = await pool.execute(
      "DELETE FROM license_key WHERE id = ?",
      [id]
    );

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
