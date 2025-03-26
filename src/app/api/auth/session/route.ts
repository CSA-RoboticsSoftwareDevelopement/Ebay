import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/config/auth';
import { executeQuery } from '@/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Session API route called');

    // ✅ Get token from cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_token')?.value;
    
    if (!token) {
      console.log('❌ No auth token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Verify token
    const decoded = verifyToken(token) as { id: string; email: string; is_admin: number };
    console.log(`🔹 Token verified for user: ${decoded.id}`);

    // Store userId in session
    const session = await cookies();
    session.set('userId', decoded.id);

    // Get user from database
    const [user] = await executeQuery(
      "SELECT id, email, username, is_admin as isAdmin, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!user) {
      console.log(`❌ User not found with ID: ${decoded.id}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`✅ User session valid: ${user.id}`);
    return NextResponse.json({ user });

  } catch (error) {
    console.error('❌ Session error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
