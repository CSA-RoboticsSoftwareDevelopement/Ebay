// User-related interfaces
export interface User {
  id: number;
  email: string;
  password: string;
  is_admin: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// Custom error types
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenError extends AuthError {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'TokenError';
  }
}