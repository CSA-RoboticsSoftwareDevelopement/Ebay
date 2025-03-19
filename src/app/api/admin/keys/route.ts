import { NextRequest, NextResponse } from 'next/server';
import { generateSignupKey } from '@/services/auth/authService';
import { prisma } from '@/lib/prisma';

// Get all signup keys (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all signup keys
    const keys = await prisma.signupKey.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Get keys error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while fetching keys' },
      { status: 500 }
    );
  }
}

// Create a new signup key (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-user-email');
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { expiresInDays } = body;

    // Calculate expiry date if provided
    let expiresAt = undefined;
    if (expiresInDays && !isNaN(expiresInDays)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    // Generate key
    const key = await generateSignupKey(userEmail || 'admin', expiresAt);

    return NextResponse.json({
      key,
      message: 'Signup key generated successfully',
    });
  } catch (error) {
    console.error('Generate key error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while generating key' },
      { status: 500 }
    );
  }
}

// Delete a signup key (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    // Delete key
    await prisma.signupKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({
      message: 'Signup key deleted successfully',
    });
  } catch (error) {
    console.error('Delete key error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while deleting key' },
      { status: 500 }
    );
  }
} 