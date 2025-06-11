import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

// ✅ MySQL connection
const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "resale",
});

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // 🔎 Step 1: Check if user exists
    const [userRows] = await db.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (userRows.length === 0) {
      return NextResponse.json({ message: "This email is not registered" }, { status: 404 });
    }

    const userId = userRows[0].id;

    // 🔎 Step 2: Get user's latest license key
    const [licenseRows] = await db.query(
      `SELECT * FROM license_key WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (licenseRows.length === 0) {
      return NextResponse.json({ message: "No license key found for this user." }, { status: 404 });
    }

    const license = licenseRows[0];
    const allowedStatuses = ["Not Activated", "De-Activate", "Expired"];

    if (!allowedStatuses.includes(license.status)) {
      return NextResponse.json({ message: "License key is already activated." }, { status: 200 });
    }

    // ✅ Update status and extend expiration date by 30 days
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await db.query(
      `UPDATE license_key SET status = 'Activated', expires_at = ? WHERE id = ?`,
      [newExpiresAt, license.id]
    );

    // 📧 Send email
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "License Key Activated",
      text: `Your License Key is Activated: ${license.license_key} and Expiration Time is Extended by 30 Days.`,
    });

    return NextResponse.json({
      message: "License key activated and email sent.",
    });

  } catch (error) {
    console.error("Error in license update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
