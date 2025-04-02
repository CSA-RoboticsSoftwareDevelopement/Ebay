const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const ebayRoutes = require("./ebayOperations"); // ✅ Import eBay API routes
const ebayProducts = require("./ebayProducts");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ MySQL Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "resale",
});

// ✅ CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'https://ebay.csaappstore.com',  'http://127.0.0.1:3000','https://resale.csaappstore.com'];
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
      "SELECT id, email, password, IFNULL(is_admin, 0) AS is_admin FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Login failed: User ${email} not found`);
      return res.status(400).json({ message: "User does not exist" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password attempt for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`✅ User logged in: ${email} (Admin: ${user.is_admin})`);

    const auth_token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Insert or Update session to prevent duplicates
    await db.query(
      `INSERT INTO sessions (user_id, auth_token, expires_at)
       VALUES (?, ?, NOW() + INTERVAL 7 DAY)
       ON DUPLICATE KEY UPDATE auth_token = VALUES(auth_token), expires_at = VALUES(expires_at)`,
      [user.id, auth_token]
    );


    return res.json({ message: "Login successful", auth_token, user });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.toString() });
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
    const auth_token = req.cookies.auth_token; // Get token from cookies

    if (!auth_token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Retrieve user session from the database
    const [session] = await db.query(
      "SELECT users.id, users.email, users.is_admin,users.username FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.auth_token = ?",
      [auth_token]
    );

    if (session.length === 0) {
      return res.status(401).json({ message: "Invalid session" });
    }

    return res.json({ user: session[0] });
  } catch (err) {
    console.error("❌ Session Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
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
      "SELECT user_id FROM admin_keys WHERE key_value = ?",
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

app.post("/api/signup", async (req, res) => {
  try {
    console.log(req.body); // Debugging: Check if request body is received
    console.log("Signup Request:", req.body);
    const { signupKey } = req.body;
    if (!signupKey) {
      return res.status(400).json({ message: "Signup key is required" });
    }

    // Check if signupKey exists in the database
    const [rows] = await db.execute(
      "SELECT user_id, created_by FROM admin_keys WHERE key_value = ?",
      [signupKey]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Invalid Signup Key" });
    }

    // If key is found, return user_id and created_by
    return res.status(200).json({
      message: "Signup key valid",
      user_id: rows[0].user_id,
      created_by: rows[0].created_by,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Logout API
app.post("/api/auth/logout", async (req, res) => {
  try {
    const auth_token = req.cookies.auth_token; // ✅ Get the auth token from cookies

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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
