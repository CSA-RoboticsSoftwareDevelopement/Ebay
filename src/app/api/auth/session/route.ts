import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/services/auth/authService';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Session API route called');
    
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token) as { id: string; email: string; role: string };
    console.log(`Token verified for user: ${decoded.id}`);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log(`User not found with id: ${decoded.id}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`User fetched successfully: ${user.id}`);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
} 