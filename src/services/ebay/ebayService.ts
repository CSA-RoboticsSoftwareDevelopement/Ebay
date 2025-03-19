import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// eBay API configuration from environment variables
const EBAY_APP_ID = process.env.EBAY_APP_ID || '';
const EBAY_CERT_ID = process.env.EBAY_CERT_ID || '';
const EBAY_DEV_ID = process.env.EBAY_DEV_ID || '';
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI || 'http://localhost:3000/api/ebay/auth/callback';
const EBAY_ENVIRONMENT = process.env.EBAY_ENVIRONMENT || 'sandbox';

// eBay API URLs (sandbox and production)
const API_ENDPOINTS = {
  sandbox: {
    auth: 'https://auth.sandbox.ebay.com/oauth2/authorize',
    token: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
    api: 'https://api.sandbox.ebay.com',
  },
  production: {
    auth: 'https://auth.ebay.com/oauth2/authorize',
    token: 'https://api.ebay.com/identity/v1/oauth2/token',
    api: 'https://api.ebay.com',
  },
};

// Get eBay environment
const getEndpoints = () => {
  return EBAY_ENVIRONMENT === 'production' ? API_ENDPOINTS.production : API_ENDPOINTS.sandbox;
};

// Generate OAuth authorization URL
export function getAuthorizationUrl(state: string) {
  const endpoints = getEndpoints();
  
  const params = new URLSearchParams({
    client_id: EBAY_APP_ID,
    response_type: 'code',
    redirect_uri: EBAY_REDIRECT_URI,
    scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory',
    state,
  });
  
  return `${endpoints.auth}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function getAccessToken(code: string) {
  const endpoints = getEndpoints();
  
  const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');
  
  try {
    const response = await axios.post(
      endpoints.token,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: EBAY_REDIRECT_URI,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error getting eBay access token:', error);
    throw new Error('Failed to get eBay access token');
  }
}

// Refresh access token
export async function refreshToken(refreshToken: string) {
  const endpoints = getEndpoints();
  
  const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');
  
  try {
    const response = await axios.post(
      endpoints.token,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing eBay token:', error);
    throw new Error('Failed to refresh eBay token');
  }
}

// Save eBay account to database
export async function saveEbayAccount(userId: string, ebayUserId: string, accessToken: string, refreshToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  // Check if account already exists
  const existingAccount = await prisma.ebayAccount.findFirst({
    where: {
      userId,
      ebayUserId,
    },
  });
  
  if (existingAccount) {
    // Update existing account
    return prisma.ebayAccount.update({
      where: { id: existingAccount.id },
      data: {
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      },
    });
  } else {
    // Create new account
    return prisma.ebayAccount.create({
      data: {
        userId,
        ebayUserId,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      },
    });
  }
}

// Get user's eBay accounts
export async function getUserEbayAccounts(userId: string) {
  return prisma.ebayAccount.findMany({
    where: { userId, isActive: true },
  });
}

// Disconnect eBay account
export async function disconnectEbayAccount(userId: string, accountId: string) {
  return prisma.ebayAccount.update({
    where: {
      id: accountId,
      userId, // Ensure the account belongs to the user
    },
    data: { isActive: false },
  });
}

// Fetch listings from eBay
export async function fetchEbayListings(accessToken: string) {
  const endpoints = getEndpoints();
  
  try {
    const response = await axios.get(`${endpoints.api}/sell/inventory/v1/inventory_item`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching eBay listings:', error);
    throw new Error('Failed to fetch eBay listings');
  }
}

// Synchronize eBay data
export async function synchronizeEbayData(accountId: string) {
  // Get eBay account
  const account = await prisma.ebayAccount.findUnique({
    where: { id: accountId },
  });
  
  if (!account) {
    throw new Error('eBay account not found');
  }
  
  // Check if token is expired
  if (account.tokenExpiresAt < new Date()) {
    // Refresh token
    const tokenData = await refreshToken(account.refreshToken);
    
    // Update account with new tokens
    await prisma.ebayAccount.update({
      where: { id: accountId },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || account.refreshToken,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });
  }
  
  // Fetch listings
  const listings = await fetchEbayListings(account.accessToken);
  
  // Process and store listings
  // This is a simplified implementation
  for (const listing of listings.inventoryItems || []) {
    // Update or create product
    await prisma.product.upsert({
      where: {
        ebayAccountId_ebayItemId: {
          ebayAccountId: accountId,
          ebayItemId: listing.sku,
        },
      },
      update: {
        title: listing.product.title,
        price: listing.offers[0]?.price?.value || 0,
        currency: listing.offers[0]?.price?.currency || 'USD',
        quantity: listing.availability?.quantity || 0,
        imageUrl: listing.product.imageUrls?.[0],
        listingStatus: listing.offers[0]?.status,
        updatedAt: new Date(),
      },
      create: {
        ebayAccountId: accountId,
        ebayItemId: listing.sku,
        title: listing.product.title,
        price: listing.offers[0]?.price?.value || 0,
        currency: listing.offers[0]?.price?.currency || 'USD',
        quantity: listing.availability?.quantity || 0,
        quantitySold: 0,
        imageUrl: listing.product.imageUrls?.[0],
        listingStatus: listing.offers[0]?.status,
      },
    });
  }
  
  return { success: true, message: 'eBay data synchronized successfully' };
}

// Search for competitor listings
export async function searchCompetitors(accessToken: string, keywords: string) {
  const endpoints = getEndpoints();
  
  try {
    const response = await axios.get(`${endpoints.api}/buy/browse/v1/item_summary/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        q: keywords,
        limit: 20,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching eBay competitors:', error);
    throw new Error('Failed to search eBay competitors');
  }
} 