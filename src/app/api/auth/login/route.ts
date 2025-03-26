import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/config/auth';

export async function POST(request: NextRequest) {
  console.log('🔹 Login API route called');

  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`🔹 Login attempt for email: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { message: '❌ Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // ✅ Authenticate user
      const { user, token } = await loginUser(email, password) as unknown as { user: { id: string; email: string; is_admin: boolean }; token: string };

      if (!user) {
        console.error('❌ User not found.');
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      console.log(`✅ User authenticated successfully: ${user.id}`);

      // ✅ Create a response with user data (excluding sensitive information)
      const response = NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin
          },
          message: '✅ Login successful'
        },
        { status: 200 }
      );

      // ✅ Set authentication token as HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      // ✅ Set user data in session cookie
      response.cookies.set({
        name: 'user',
        value: JSON.stringify({
          id: user.id,
          email: user.email,
          is_admin: user.is_admin
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } catch (error: any) {
      console.error('❌ Login authentication error:', error.message);
      return NextResponse.json(
        { message: '❌ Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Login request parsing error:', error);
    return NextResponse.json(
      { message: '❌ Invalid request' },
      { status: 400 }
    );
  }
}
