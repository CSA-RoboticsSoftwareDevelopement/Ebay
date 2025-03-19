import { User } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// User registration
export async function registerUser(email: string, password: string, name: string, signupKeyId: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Check if signup key exists and is not used
  const signupKey = await prisma.signupKey.findUnique({
    where: { id: signupKeyId, isUsed: false },
  });

  if (!signupKey) {
    throw new Error('Invalid or already used signup key');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      signupKeyId,
    },
  });

  // Mark signup key as used
  await prisma.signupKey.update({
    where: { id: signupKeyId },
    data: { isUsed: true },
  });

  // Generate token
  const token = generateToken(user);

  return { user, token };
}

// User login
export async function loginUser(email: string, password: string) {
  console.log(`Attempting to login with email: ${email}`);
  
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`No user found with email: ${email}`);
    throw new Error('User not found');
  }
  
  console.log(`User found: ${user.id}`);

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    console.log('Password comparison failed');
    throw new Error('Invalid password');
  }
  
  console.log('Password validation successful');

  // Generate token
  const token = generateToken(user);
  console.log('Token generated successfully');

  return { user, token };
}

// Generate JWT token
export function generateToken(user: User) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
}

// Generate signup key (admin only)
export async function generateSignupKey(createdBy: string, expiresAt?: Date) {
  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return prisma.signupKey.create({
    data: {
      key,
      expiresAt,
      createdBy,
    },
  });
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  // Find user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
} 