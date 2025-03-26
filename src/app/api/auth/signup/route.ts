import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/config/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, signupKey } = body;

    // Validate input
    if (!email || !password || !name || !signupKey) {
      return NextResponse.json(
        { error: 'Email, password, name, and signup key are required' },
        { status: 400 }
      );
    }

    // Find signup key in database
    const [keyRecord] = await executeQuery(
      "SELECT id, is_used, expires_at FROM signup_keys WHERE `key` = ?",
      [signupKey]
    );

    if (!keyRecord || keyRecord.is_used || (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date())) {
      return NextResponse.json(
        { error: 'Signup key has expired' },
        { status: 400 }
      );
    }

    // ✅ Create user
    const [result] = await executeQuery(
      "INSERT INTO users (id, email, password, signup_key_id) VALUES (UUID(), ?, ?, ?)",
      [email, await bcrypt.hash(password, 10), keyRecord.id]
    );

    // ✅ Get the created user
    const [user] = await executeQuery(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );

    // ✅ Mark signup key as used
    await executeQuery(
      "UPDATE signup_keys SET is_used = true WHERE id = ?",
      [keyRecord.id]
    );

    // Set cookie with JWT token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin
      },
      message: 'Registration successful',
    });

    // Set the cookie on the response
    response.cookies.set({
      name: 'auth_token',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      // 7 days expiry
      maxAge: 60 * 60 * 24 * 7,
    });
    
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User already exists with this email') {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 409 }
        );
      }
      
      if (error.message === 'Invalid or already used signup key') {
        return NextResponse.json(
          { error: 'Invalid or already used signup key' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}