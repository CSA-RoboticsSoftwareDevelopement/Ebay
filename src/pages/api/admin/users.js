// src/pages/api/admin/users.js

import { pool } from "../../../config"; // Ensure this imports the correct database connection

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Query the database to fetch users
      const [rows] = await pool.execute("SELECT id, username FROM users");
      res.status(200).json({ users: rows });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" }); // Handle other HTTP methods
  }
}
