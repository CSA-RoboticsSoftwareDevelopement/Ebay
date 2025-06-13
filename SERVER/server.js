const express = require("express");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const mysql = require("mysql2/promise");
const ebayRoutes = require("./ebayOperations"); // ✅ Import eBay API routes
const ebayProducts = require("./ebayProducts");
const ebayPlugin = require("./plugin");
const ebayPlans = require("./plans");
const productFinder = require("./productFinder");
const path = require("path");
const fs = require("fs"); // ✅ Add this line
const ebayAnalytics = require("./ebayAnalytics");
const dashboardService = require("./dashboardService");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
// MySQL DB Setup
const {
  NEXT_PUBLIC_COGNITO_DOMAIN,
  NEXT_PUBLIC_COGNITO_CLIENT_ID,
  NEXT_PUBLIC_COGNITO_REDIRECT_URI,
  NEXT_PUBLIC_COGNITO_LOGOUT_URI,
  NEXT_PUBLIC_COGNITO_CLIENT_SECRET,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;
// Helper
const getBasicAuthHeader = () => {
  if (!NEXT_PUBLIC_COGNITO_CLIENT_SECRET) return null;
  return (
    "Basic " +
    Buffer.from(
      `${NEXT_PUBLIC_COGNITO_CLIENT_ID}:${NEXT_PUBLIC_COGNITO_CLIENT_SECRET}`
    ).toString("base64")
  );
};

// ✅ MySQL Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "resale",
});

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://ebay.csaappstore.com",
  "http://127.0.0.1:3000",
  "https://resale.csaappstore.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ JWT Token Verification
const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return null;
  }
};

// ✅ Check Database Connection
app.get("/api/db-status", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1"); // ✅ MySQL equivalent of checking DB status
    res.status(200).json({ status: "Database connected", result: rows });
  } catch (error) {
    console.error("❌ Database connection error:", error);
    res
      .status(500)
      .json({ status: "Database connection failed", error: error.message });
  }
});

// ✅ User Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const [users] = await db.query(
      `SELECT id, username, email, password, IFNULL(is_admin, 0) AS is_admin FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Login failed: User ${email} not found`);
      return res.status(400).json({ message: "User does not exist" });
    }

    const user = users[0];

    // Now check license status based on user_id from license_key
    const [licenseRows] = await db.query(
      `SELECT status FROM license_key WHERE user_id = ?`,
      [user.id]
    );

    const licenseStatus = licenseRows[0]?.status || "Not Found";

    if (licenseStatus !== "Activated") {
      console.log(`❌ Login blocked: License not activated for ${email}`);
      return res
        .status(403)
        .json({ message: `Your license is ${licenseStatus}` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password attempt for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`✅ User logged in: ${email} (Admin: ${user.is_admin})`);

    const auth_token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await db.query(
      `INSERT INTO sessions (user_id, auth_token, expires_at)
       VALUES (?, ?, NOW() + INTERVAL 7 DAY)
       ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
      [user.id, auth_token]
    );

    console.log("auth_token data from backend", user);
    return res.json({ message: "Login successful", auth_token, user });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.toString() });
  }
});

// 2) Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility to generate 6-digit OTP
function generateOtp() {
  return "" + Math.floor(100000 + Math.random() * 900000);
}

// POST /login → generate & send OTP
app.post("/post_login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    // Check user exists
    const [users] = await db.query(
      "SELECT username FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "No user with that email." });
    }

    // Create OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save to user_otps
    await db.query(
      `INSERT INTO user_otps (email, otp, expires_at) VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    // Send email
    await transporter.sendMail({
      from: `"Resale" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Login Code",
      text: `Hello,\n\nYour OTP is: ${otp}\nIt will expire in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    });

    res.json({ message: "OTP sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// POST /verify → check OTP
app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required." });

  try {
    const [rows] = await db.query(
      `SELECT id, expires_at, used FROM user_otps
       WHERE email = ? AND otp = ? LIMIT 1`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const record = rows[0];
    if (record.used) {
      return res.status(400).json({ error: "OTP already used." });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP expired." });
    }

    // Mark OTP as used
    await db.query(`UPDATE user_otps SET used = 1 WHERE id = ?`, [record.id]);

    // Fetch user data
    const [users] = await db.query(
      "SELECT id, username, email, is_admin FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[0];

    // Generate token
    const auth_token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Save session
    await db.query(
      `INSERT INTO sessions (user_id, auth_token, expires_at)
       VALUES (?, ?, NOW() + INTERVAL 7 DAY)
       ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
      [user.id, auth_token]
    );

    return res.json({
      message: "OTP verified. Login successful.",
      auth_token,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// 🔁 Callback route: Cognito redirects here after login
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const rawState = req.query.state;
  let state = "";
  let signupKeyFromCognito = null;

  if (rawState) {
    const parts = rawState.split("|");
    state = parts[0]; // "signup" or "login"
    if (parts.length > 1) {
      signupKeyFromCognito = parts[1];
    }
  }

  if (!code) {
    console.log("❌ Authorization code not found in callback.");
    return res.status(400).send("Authorization code not found");
  }

  try {
    const tokenResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`,
      querystring.stringify({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(getBasicAuthHeader() && { Authorization: getBasicAuthHeader() }),
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/userInfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const user = userInfoResponse.data;
    const email = user.email;

    const [rows] = await db.query(
      "SELECT id, username, email, is_admin, name FROM users WHERE email = ?",
      [email]
    );

    if (state === "login") {
      if (rows.length === 0) {
        console.log(`❌ Cognito Login failed: User ${email} not found in DB.`);
        return res.send(`
          <script>
            alert("User not registered. Please signup first.");
            window.location.href = "${process.env.FRONTEND_URL}/signup";
          </script>
        `);
      }

      const dbUser = rows[0];

      const [licenseRows] = await db.query(
        "SELECT status FROM license_key WHERE user_id = ?",
        [dbUser.id]
      );

      const licenseStatus = licenseRows[0]?.status || "Not Found";

      if (licenseStatus !== "Activated") {
        console.log(
          `❌ Cognito Login blocked: License not activated for ${email}. Status: ${licenseStatus}`
        );
        return res.send(`
          <script>
            alert("Your license is ${licenseStatus}. Please activate it to proceed.");
            window.location.href = "${process.env.FRONTEND_URL}/license-activation";
          </script>
        `);
      }

      const auth_token = jwt.sign(
        {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          is_admin: dbUser.is_admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      await db.query(
        `INSERT INTO sessions (user_id, auth_token, expires_at)
         VALUES (?, ?, NOW() + INTERVAL 7 DAY)
         ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
        [dbUser.id, auth_token]
      );

      console.log(
        `✅ Cognito User logged in: ${email} (Admin: ${dbUser.is_admin})`
      );
      return res.redirect(
        `${process.env.FRONTEND_URL}/verify-otp?email=${email}`
      );
    }

    if (state === "signup") {
      if (!signupKeyFromCognito) {
        console.log(
          "❌ Signup key missing from state parameter for Cognito signup."
        );
        return res.status(400).send("Signup key missing for social signup.");
      }

      let dbUser;

      if (rows.length === 0) {
        const username = user.nickname || user.email.split("@")[0];
        const provider_name =
          user.identities?.[0]?.providerName || "OAuthProvider";
        const provider_type = "OAuth2";
        const cognito_user_id = user.sub;
        const name = user.name || username;

        const query = `
          INSERT INTO users
          (username, email, password, is_admin, created_at, updated_at, provider_name, provider_type, user_id, name)
          VALUES (?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?)
        `;

        const values = [
          username,
          email,
          "", // No password for OAuth
          0,
          provider_name,
          provider_type,
          cognito_user_id,
          name,
        ];

        const [insertResult] = await db.query(query, values);

        const [newRows] = await db.query(
          "SELECT id, username, email, is_admin, name FROM users WHERE id = ?",
          [insertResult.insertId]
        );

        dbUser = newRows[0];

        console.log(
          `✅ New user ${email} created via Cognito signup (ID: ${dbUser.id})`
        );
      } else {
        dbUser = rows[0];

        await db.query(
          `UPDATE users SET updated_at = NOW(), provider_name = ?, provider_type = ?, user_id = ?, name = ? WHERE id = ?`,
          [
            user.identities?.[0]?.providerName || "OAuthProvider",
            "OAuth2",
            user.sub,
            user.name || user.nickname || user.email.split("@")[0],
            dbUser.id,
          ]
        );

        console.log(
          `ℹ️ Existing user ${email} logged in/signed up via Cognito.`
        );
      }

      const [keyRows] = await db.execute(
        "SELECT id, status FROM license_key WHERE license_key = ?",
        [signupKeyFromCognito]
      );

      if (keyRows.length === 0) {
        console.log(
          `❌ Cognito Signup blocked: Invalid signup key provided: ${signupKeyFromCognito}`
        );
        return res.send(`
          <script>
            alert("Invalid signup key. Please try again or contact support.");
            window.location.href = "${process.env.FRONTEND_URL}/signup";
          </script>
        `);
      }

      const keyData = keyRows[0];

      if (keyData.status !== "Not Activated") {
        console.log(
          `❌ Cognito Signup blocked: Signup key ${signupKeyFromCognito} already used or expired. Status: ${keyData.status}`
        );
        return res.send(`
          <script>
            alert("Signup key is already used or expired. Please try again or contact support.");
            window.location.href = "${process.env.FRONTEND_URL}/signup";
          </script>
        `);
      }

      console.log(
        `ℹ️ Attempting to activate license key ${keyData.id} for user ${dbUser.id}`
      );

      try {
        await db.execute(
          "UPDATE license_key SET user_id = ?, status = 'Activated' WHERE id = ?",
          [dbUser.id, keyData.id]
        );
        console.log(
          `✅ License key ${signupKeyFromCognito} activated for user ${email} (ID: ${dbUser.id})`
        );
      } catch (licenseUpdateError) {
        console.error(
          `❌ Error activating license key ${signupKeyFromCognito} for user ${email}:`,
          licenseUpdateError
        );
        return res.send(`
          <script>
            alert("Failed to activate license. Please contact support.");
            window.location.href = "${process.env.FRONTEND_URL}/signup";
          </script>
        `);
      }

      const auth_token = jwt.sign(
        {
          id: dbUser.id,
          email: dbUser.email,
          is_admin: dbUser.is_admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      await db.query(
        `INSERT INTO sessions (user_id, auth_token, expires_at)
         VALUES (?, ?, NOW() + INTERVAL 7 DAY)
         ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
        [dbUser.id, auth_token]
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard#auth_token=${auth_token}`
      );
    }

    console.log(`❌ Invalid state parameter in callback: ${state}`);
    return res.status(400).send("Invalid state parameter");
  } catch (error) {
    console.error("❌ Callback Error:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// ✅ Get All Logged-in Users (Debugging)
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, email, username, is_admin, created_at FROM users"
    );
    console.log("📢 All Users Data:", users);
    return res.json({ users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Session API
// ✅ Get Current Session
app.get("/api/auth/session", async (req, res) => {
  try {
    const auth_token =
      req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    if (!auth_token) {
      console.log("No auth token found in request");
      return res.status(401).json({
        message: "No authentication token found",
        isAuthenticated: false,
      });
    }

    // Verify the token first
    const decoded = verifyToken(auth_token);
    if (!decoded) {
      console.log("Invalid or expired token");
      return res.status(401).json({
        message: "Invalid or expired token",
        isAuthenticated: false,
      });
    }

    // Retrieve user session from the database
    const [session] = await db.query(
      "SELECT users.id, users.email, users.is_admin, users.username FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.auth_token = ? AND sessions.expires_at > NOW()",
      [auth_token]
    );

    if (session.length === 0) {
      console.log("No valid session found in database");
      return res.status(401).json({
        message: "Session expired or not found",
        isAuthenticated: false,
      });
    }

    return res.json({
      user: session[0],
      isAuthenticated: true,
    });
  } catch (err) {
    console.error("❌ Session Error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      isAuthenticated: false,
    });
  }
});

// ✅ User Signup API
app.post("/api/validate-key", async (req, res) => {
  try {
    console.log("Validate Key Request:", req.body);
    const { signupKey } = req.body;
    if (!signupKey) {
      return res.status(400).json({ message: "Signup key is required" });
    }

    const [rows] = await db.execute(
      "SELECT user_id FROM license_key WHERE license_key = ?",
      [signupKey]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ valid: false, message: "Invalid Signup Key" });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error("Signup Key Validation Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.patch("/api/renew-key", async (req, res) => {
  try {
    const { keyId, paymentMode, paymentDate, newExpiryDate } = req.body;

    if (!keyId || !paymentMode || !paymentDate || !newExpiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update the key's expiration and payment info
    await db.execute(
      `UPDATE license_key
       SET status = 'Activated',
           expires_at = ?,
           payment_mode = ?,
           payment_date = ?
       WHERE id = ?`,
      [newExpiryDate, paymentMode, paymentDate, keyId]
    );

    return res.status(200).json({ message: "Key renewed successfully." });
  } catch (err) {
    console.error("Renew Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ SignUp API
app.post("/api/signup", async (req, res) => {
  try {
    console.log("Signup Request:", req.body);
    const { signupKey, email, password, name } = req.body;

    if (!signupKey || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [keyRows] = await db.execute(
      "SELECT id, status FROM license_key WHERE license_key = ?",
      [signupKey]
    );

    if (keyRows.length === 0) {
      return res.status(404).json({ message: "Invalid signup key." });
    }

    const keyData = keyRows[0];

    if (keyData.status !== "Not Activated") {
      return res
        .status(403)
        .json({ message: "Signup key is already used or expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await db.execute(
      "INSERT INTO users (email, password, username, created_at) VALUES (?, ?, ?, NOW())",
      [email, hashedPassword, name]
    );

    const userId = insertResult.insertId;

    await db.execute(
      "UPDATE license_key SET user_id = ?, status = 'Activated' WHERE id = ?",
      [userId, keyData.id]
    );

    // ✅ Generate token immediately after signup
    const user = { id: userId, email, username: name, is_admin: 0 };
    const auth_token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await db.query(
      `INSERT INTO sessions (user_id, auth_token, expires_at)
       VALUES (?, ?, NOW() + INTERVAL 7 DAY)
       ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
      [userId, auth_token]
    );

    return res.status(201).json({
      message: "User created, key activated, and logged in successfully",
      auth_token,
      user,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const auth_token =
      req.cookies.auth_token || req.headers.authorization?.split(" ")[1]; // ✅ Get the auth token from cookies or Authorization header

    if (!auth_token) {
      return res.status(400).json({ message: "No active session found" });
    }

    // ✅ Delete session from the database
    await db.query("DELETE FROM sessions WHERE auth_token = ?", [auth_token]);

    // ✅ Clear the auth_token cookie
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Use eBay API Routes
app.use("/api/ebay", ebayRoutes(db));
// ✅ Use eBay Products API Routes
app.use("/api/ebay/products", ebayProducts(db));
app.use("/api/plugin", ebayPlugin(db));
app.use("/api/plans", ebayPlans(db));
// ✅ Use eBay Analytics API Routes
app.use("/api/ebay/analytics", ebayAnalytics(db));
// ✅ Use Dashboard Service API Routes
app.use("/api/dashboard", dashboardService(db));

// Get all product details from JSON files in productfinder/<category> folders
app.get("/api/product-finder/all-products", async (req, res) => {
  try {
    const baseDir = path.join(__dirname, "productfinder");
    const allProducts = [];

    if (!fs.existsSync(baseDir)) {
      return res
        .status(404)
        .json({ success: false, message: "productfinder directory not found" });
    }

    const categories = fs
      .readdirSync(baseDir)
      .filter((folder) =>
        fs.statSync(path.join(baseDir, folder)).isDirectory()
      );

    for (const category of categories) {
      const categoryPath = path.join(baseDir, category);
      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        if (file.endsWith("_product_details.json")) {
          const filePath = path.join(categoryPath, file);
          try {
            const data = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(data);
            allProducts.push({
              category,
              fileName: file,
              productDetails: parsed.productDetails || [],
            });
          } catch (err) {
            console.error(`❌ Error parsing JSON from ${file}:`, err.message);
          }
        }
      }
    }

    res.json({
      success: true,
      totalFiles: allProducts.length,
      data: allProducts,
    });
  } catch (error) {
    console.error("❌ Failed to load product details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Start product finder after server starts
  productFinder.main().catch((error) => {
    console.error("Product Finder Error:", error);
  });
});
