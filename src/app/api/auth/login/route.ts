import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginUser } from '@/services/auth/authService';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('Login API route called');
  
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`Login attempt for email: ${email}`);

    // Validate request data
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // Authenticate user
      const { user, token } = await loginUser(email, password);
      console.log(`User authenticated successfully: ${user.id}`);

      // Set auth cookie and prepare response
      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        message: 'Login successful'
      }, { status: 200 });

      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    } catch (error: any) {
      console.error('Login authentication error:', error.message);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login request parsing error:', error);
    return NextResponse.json(
      { message: 'Invalid request' },
      { status: 400 }
    );
  }
} 