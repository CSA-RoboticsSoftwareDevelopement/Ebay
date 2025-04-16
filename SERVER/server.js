const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const ebayRoutes = require("./ebayOperations"); // ✅ Import eBay API routes
const ebayProducts = require("./ebayProducts");
const ebayPlugin  = require("./plugin");
const ebayPlans =  require("./plans");
const productFinder = require('./productFinder');
const path = require("path");
const fs = require("fs"); // ✅ Add this line

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

    // Fetch user info (without licence column)
    const [users] = await db.query(
      `SELECT id, email, password, IFNULL(is_admin, 0) AS is_admin FROM users WHERE email = ?`,
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
      return res.status(403).json({ message: `Your license is ${licenseStatus}` });
    }

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



// ✅ Logout API
app.post("/api/signup", async (req, res) => {
  try {
    console.log("Signup Request:", req.body);
    const { signupKey, email, password, name } = req.body;

    if (!signupKey || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Validate key
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

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    const [insertResult] = await db.execute(
      "INSERT INTO users (email, password, username, created_at) VALUES (?, ?, ?, NOW())",
      [email, hashedPassword, name]
    );

    const userId = insertResult.insertId;

    // 4. Link user to the admin_key and activate it
    await db.execute(
      "UPDATE license_key SET user_id = ?, status = 'Activated' WHERE id = ?",
      [userId, keyData.id]
    );

    return res.status(201).json({
      message: "User created and key activated successfully",
      userId,
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
app.use("/api/plugin",ebayPlugin(db));
app.use("/api/plans", ebayPlans(db));



// Get all product details from JSON files in productfinder/<category> folders
app.get('/api/product-finder/all-products', async (req, res) => {
  try {
    const baseDir = path.join(__dirname, "productfinder");
    const allProducts = [];

    if (!fs.existsSync(baseDir)) {
      return res.status(404).json({ success: false, message: "productfinder directory not found" });
    }

    const categories = fs.readdirSync(baseDir).filter(folder =>
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
              productDetails: parsed.productDetails || []
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
      data: allProducts
    });
  } catch (error) {
    console.error("❌ Failed to load product details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Start product finder after server starts
    productFinder.main().catch(error => {
        console.error('Product Finder Error:', error);
    });
});

