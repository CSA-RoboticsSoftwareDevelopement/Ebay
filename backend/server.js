const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client'); // Prisma ORM
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser()); // Middleware to handle cookies
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Allow frontend access

const prisma = new PrismaClient(); // Instantiate Prisma client

// Utility function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    // Validate password
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const auth_token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store token in HTTP-only cookie
    res.cookie('auth_token', auth_token, { httpOnly: true, secure: true, sameSite: 'strict' });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Session verification endpoint
app.get('/api/session', async (req, res) => {
  try {
    console.log('Session API route called');
    
    // Get token from cookies
    const token = req.cookies.auth_token;
    if (!token) {
      console.log('No auth token found in cookies');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Invalid token');
      return res.status(401).json({ error: 'Invalid session' });
    }
    
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
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User fetched successfully: ${user.id}`);
    return res.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(401).json({ error: 'Invalid session' });
  }
});

// Utility function to generate the signup key
const generateSignupKey = () => {
  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return key;
};

// POST endpoint to generate a signup key (no admin check)
app.post('/api/generate-signup-key', async (req, res) => {
  try {
    const { expiresAt, userId } = req.body; // Now expecting userId in the request body

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const key = generateSignupKey(); // Generate a random key

    // Save the generated key in the database (assuming you have a SignupKey model)
    const signupKey = await prisma.signupKey.create({
      data: {
        key,
        createdBy: userId, // Use the provided userId from the request
        expiresAt: expiresAt ? new Date(expiresAt) : null, // Set the expiration date if provided
      },
    });

    res.status(200).json({ message: 'Signup key generated successfully', signupKey });
  } catch (err) {
    console.error('Error generating signup key:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE endpoint to delete a signup key
app.delete('/api/delete-signup-key', async (req, res) => {
  try {
    const { id } = req.body; // Expecting the ID of the key to delete

    if (!id) {
      return res.status(400).json({ message: 'Key ID is required' });
    }

    // Check if the signup key exists before attempting to delete
    const keyToDelete = await prisma.signupKey.findUnique({
      where: { id },
    });

    if (!keyToDelete) {
      return res.status(404).json({ message: 'Key not found' });
    }

    // If the key exists, delete it
    const deletedKey = await prisma.signupKey.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Signup key deleted successfully', deletedKey });
  } catch (err) {
    console.error('Error deleting signup key:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/signup', async (req, res) => {
  const { signupKey, email, password, name } = req.body;

  // Validate the request
  if (!signupKey || !email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Validate signup key (simulating with a simple check for now)
    const validSignupKey = await prisma.signupKey.findUnique({
      where: {
        key: signupKey, // Check if the key exists in the database
      },
    });

    if (!validSignupKey || validSignupKey.isUsed) {
      return res.status(400).json({ message: 'Invalid or already used signup key' });
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email, // Check if the email already exists in the database
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database, correctly linking the signup key
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        signupKey: {
          connect: { key: signupKey }, // Correctly linking the signup key
        },
      },
    });

    // Mark the signup key as used
    await prisma.signupKey.update({
      where: {
        key: signupKey,
      },
      data: {
        isUsed: true, // Mark the key as used
      },
    });

    // Send success response
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error during signup process' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
