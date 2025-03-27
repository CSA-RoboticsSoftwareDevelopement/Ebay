const express = require('express');
const db = require('../../config/db'); // ✅ Ensure correct DB path
const jwt = require('jsonwebtoken');

const router = express.Router();

// ✅ Handle GET /api/auth/session
router.get('/session', async (req, res) => {
  try {
    const auth_token = req.cookies.auth_token;
    if (!auth_token) {
      return res.status(401).json({ message: 'Unauthorized. No session found.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const [session] = await db.query(
      "SELECT users.id, users.email, users.is_admin FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.auth_token = ? AND sessions.expires_at > NOW()",
      [auth_token]
    );

    if (session.length === 0) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    return res.json({ user: session[0] });

  } catch (err) {
    console.error("❌ Session Error:", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
