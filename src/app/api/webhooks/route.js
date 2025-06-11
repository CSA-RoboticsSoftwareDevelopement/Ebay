import { NextResponse } from "next/server";
import Stripe from "stripe";
import { pool } from "@/config/database"; // Import database connection
import nodemailer from "nodemailer";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10", // Use your desired API version
});

// Get the Stripe webhook secret from environment variables
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Nodemailer transporter setup for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service
  auth: {
    user: process.env.MAIL_USER, // Your Gmail user
    pass: process.env.MAIL_PASS, // Your Gmail app password
  },
});

// IMPORTANT: Disable Next.js body parser for this specific route.
// Stripe webhooks require the raw body for signature verification.
export const config = {
  api: {
    bodyParser: false, // Ensure the raw body is available
  },
};

export async function POST(req) {
  // Get the raw body of the request for Stripe signature verification
  const body = await req.text();
  // Get the Stripe signature header
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    // Construct the Stripe event from the raw body and signature
    event = stripe.webhooks.constructEvent(
      body,
      sig || "", // Pass the signature, or an empty string if null
      STRIPE_WEBHOOK_SECRET || "" // Pass the webhook secret
    );
  } catch (err) {
    // If signature verification fails, log the error and return 400
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event based on its type
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent succeeded: ${paymentIntent.id}`);

      // Extract metadata from the payment intent
      const { plan_id, user_id, user_email, plan_name } =
        paymentIntent.metadata;

      // Validate required metadata fields
      if (!plan_id || !user_id || !user_email || !plan_name) {
        console.error(
          "Missing metadata in payment_intent.succeeded webhook. Required: plan_id, user_id, user_email, plan_name."
        );
        return NextResponse.json(
          { message: "Missing metadata" },
          { status: 400 }
        );
      }

      // Convert user_id and plan_id to integers
      const parsedUserId = Number(user_id);
      const parsedPlanId = Number(plan_id);

      // Add checks for valid integer conversion
      if (isNaN(parsedUserId) || isNaN(parsedPlanId)) {
        console.error(
          "Invalid user_id or plan_id in metadata. Cannot convert to integer."
        );
        return NextResponse.json(
          { message: "Invalid user_id or plan_id" },
          { status: 400 }
        );
      }

      console.log(
        `Debugging info: parsedUserId = ${parsedUserId} (type: ${typeof parsedUserId}), parsedPlanId = ${parsedPlanId} (type: ${typeof parsedPlanId})`
      );

      try {
        // Calculate new expiry date (30 days from now)
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30); // Extend by 30 days

        // --- MODIFIED LOGIC START ---
        // Check if a license already exists for the given user_id (regardless of plan_id)
        const [existingLicenseForUser] = await pool.query(
          `SELECT * FROM license_key WHERE user_id = ?`,
          [parsedUserId]
        );

        console.log(
          `Debugging info: Found ${existingLicenseForUser.length} existing licenses for user ${parsedUserId}.`
        );

        if (existingLicenseForUser.length > 0) {
          // If a license for this user already exists, update their existing plan
          // This will override their previous plan_id and extend the expiry
          await pool.query(
            `UPDATE license_key
             SET plan_id = ?, plan_status = 1, expires_at = ?
             WHERE user_id = ?`,
            [parsedPlanId, newExpiresAt, parsedUserId]
          );
          console.log(
            `License for user ${parsedUserId} updated to new plan ${parsedPlanId}.`
          );
        } else {
          // If no license exists for this user, create a new one
          const licenseKey =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          await pool.query(
            `INSERT INTO license_key (user_id, plan_id, license_key, plan_status, created_at, expires_at) VALUES (?, ?, ?, 1, NOW(), ?)`,
            [parsedUserId, parsedPlanId, licenseKey, newExpiresAt]
          );
          console.log(
            `New license created for user ${parsedUserId} with plan ${parsedPlanId}.`
          );
        }
        // --- MODIFIED LOGIC END ---

        // Send email confirmation to the user
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: user_email,
          subject: "Your Plan Purchase Confirmation!",
          html: `
            <h1>Thank you for your purchase!</h1>
            <p>You have successfully purchased the <strong>${plan_name}</strong> plan.</p>
            <p>Your plan is now active and will expire on: <strong>${newExpiresAt.toDateString()}</strong>.</p>
            <p>If you have any questions, please contact our support team.</p>
          `,
        });

        console.log(
          `User ${parsedUserId} (${user_email}) successfully processed for plan ${parsedPlanId} (${plan_name}).`
        );
      } catch (dbError) {
        console.error(
          "❌ Database or Email Error during post-payment processing:",
          dbError
        );
        return NextResponse.json(
          { error: "Internal Server Error during post-payment processing." },
          { status: 500 }
        );
      }
      break;
    default:
      // Log unhandled event types
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event to Stripe
  return NextResponse.json({ received: true });
}
