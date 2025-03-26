import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/config/auth';
import { executeQuery } from '@/config/database';

// Get all signup keys (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const is_admin = request.headers.get('x-user-is_admin');
    
    if (is_admin !== '1') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // ✅ Get all signup keys
    const keys = await executeQuery(
      "SELECT id, `key`, is_used as isUsed, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt, created_by as createdBy FROM signup_keys ORDER BY created_at DESC"
    );

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
    const is_admin = request.headers.get('x-user-is_admin');
    const userEmail = request.headers.get('x-user-email');
    
    if (is_admin !== '1') {
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
    // Generate a random key
    const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Insert the key into database
    const [result] = await executeQuery(
      "INSERT INTO signup_keys (`key`, expires_at, created_by) VALUES (?, ?, ?)",
      [randomKey, expiresAt, userEmail || '1']
    );
    
    // Get the inserted key details
    const [key] = await executeQuery(
      "SELECT id, `key`, is_used as isUsed, expires_at as expiresAt, created_at as createdAt, updated_at as updatedAt, created_by as createdBy FROM signup_keys WHERE id = ?",
      [(result as any).insertId]
    );

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
    const is_admin = request.headers.get('x-user-is_admin');
    
    if (is_admin !== '1') {
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

    // ✅ Delete signup key
    await executeQuery(
      "DELETE FROM signup_keys WHERE id = ?",
      [keyId]
    );

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