import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/services/auth/authService';

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Change password
    await changePassword(userId, currentPassword, newPassword);

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (error.message === 'Current password is incorrect') {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
} 