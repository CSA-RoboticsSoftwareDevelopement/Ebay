const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const router = express.Router();

// eBay Token Exchange API
router.get('/ebay/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: 'Authorization code is missing' });

  try {
    // ✅ Exchange Authorization Code for Access Token
    const tokenResponse = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.EBAY_REDIRECT_URI
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // ✅ Save token to DB (assuming user is logged in)
    const userId = req.user.id; // Ensure user is authenticated
    await prisma.ebayAccount.upsert({
      where: { userId },
      update: { accessToken: access_token, refreshToken: refresh_token, tokenExpiresAt: new Date(Date.now() + expires_in * 1000) },
      create: { userId, accessToken: access_token, refreshToken: refresh_token, tokenExpiresAt: new Date(Date.now() + expires_in * 1000) }
    });

    console.log(`✅ eBay token saved for User ID: ${userId}`);
    res.redirect('/dashboard'); // Redirect back to frontend

  } catch (error) {
    console.error('eBay OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error getting eBay token' });
  }
});

module.exports = router;
