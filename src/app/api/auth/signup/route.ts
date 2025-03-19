import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/services/auth/authService';
import { prisma } from '@/lib/prisma';

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
    const keyRecord = await prisma.signupKey.findUnique({
      where: { key: signupKey, isUsed: false },
    });

    if (!keyRecord) {
      return NextResponse.json(
        { error: 'Invalid or already used signup key' },
        { status: 400 }
      );
    }

    // Check if key is expired
    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Signup key has expired' },
        { status: 400 }
      );
    }

    // Register user
    const { user, token } = await registerUser(email, password, name, keyRecord.id);

    // Set cookie with JWT token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Registration successful',
    });

    // Set the cookie on the response
    response.cookies.set({
      name: 'auth_token',
      value: token,
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