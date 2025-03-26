import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/config/database';

// ✅ Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ User Type Definition
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  is_admin: number;
}

// ✅ Response Type
interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>; // ✅ Exclude password from response
}

// ✅ Verify JWT Token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// ✅ Login User Function
export async function loginUser(email: string, password: string) {
  try {
    const [user] = await executeQuery<any[]>(`
      SELECT id, username, email, password, IFNULL(is_admin, 0) AS is_admin 
      FROM users 
      WHERE email = ?`, [email]);

    if (!user) throw new Error('User not found');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error('Invalid credentials');

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // ✅ Store session (optional)
    await executeQuery(`
      INSERT INTO user_sessions (user_id, token, created_at) 
      VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE token=?`, 
      [user.id, token, token]);

    console.log(`🔹 User Logged In: ${JSON.stringify(user, null, 2)}`); // ✅ Log User Info

    return { token, user };
  } catch (error) {
    console.error('❌ Login Error:', error);
    throw new Error(error.message || 'Failed to log in');
  }
}

