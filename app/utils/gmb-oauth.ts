/**
 * Google My Business OAuth utilities for business claim verification
 */

// OAuth configuration
export const GMB_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GMB_OAUTH_REDIRECT_URI || '',
  scopes: (process.env.GMB_OAUTH_SCOPES || 'https://www.googleapis.com/auth/business.manage').split(','),
  stateSecret: process.env.OAUTH_STATE_SECRET || '',
};

// OAuth endpoints
const OAUTH_ENDPOINTS = {
  authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  gmbAccounts: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
  gmbLocations: (accountId: string) => 
    `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
  gmbReviews: (accountId: string, locationId: string) => 
    `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/${accountId}/locations/${locationId}/reviews`,
};

/**
 * Interface definitions for GMB API responses
 */
export interface GMBAccount {
  name: string;
  accountName: string;
  type: string;
  state?: {
    status: string;
  };
}

export interface GMBLocation {
  name: string;
  languageCode?: string;
  storeCode?: string;
  locationName?: string;
  primaryPhone?: string;
  additionalPhones?: string[];
  address?: {
    regionCode: string;
    languageCode?: string;
    postalCode?: string;
    administrativeArea?: string;
    locality?: string;
    addressLines?: string[];
  };
  primaryCategory?: {
    name: string;
    displayName: string;
  };
  websiteUri?: string;
  regularHours?: any;
  specialHours?: any;
  serviceItems?: any[];
  labels?: string[];
  adWordsLocationExtensions?: any;
  latlng?: {
    latitude: number;
    longitude: number;
  };
  openInfo?: {
    status: string;
    canReopen?: boolean;
    openingDate?: string;
  };
  locationKey?: {
    placeId?: string;
    plusPageId?: string;
    requestId?: string;
  };
  profile?: {
    description?: string;
  };
  relationshipData?: {
    parentChain?: any;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

export interface GMBReview {
  reviewId?: string;
  reviewer?: {
    profilePhotoUrl?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  starRating?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime?: string; // RFC3339 timestamp
  updateTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
  };
}

export interface GMBReviewsResponse {
  reviews?: GMBReview[];
  nextPageToken?: string;
  totalReviewCount?: number;
  averageRating?: number;
}

export interface GMBVerificationResult {
  verified: boolean;
  matchedLocation?: GMBLocation;
  confidence: number; // 0-100
  requiresManualReview: boolean;
  matchDetails: {
    name_match: number;
    address_match: number;
    phone_match: boolean;
  };
  failureReason?: string;
  allLocations?: GMBLocation[];
}

/**
 * Generate a secure state parameter for OAuth flow
 */
export function generateOAuthState(claimId: string, userId: string): string {
  const timestamp = Date.now().toString();
  const data = `${claimId}:${userId}:${timestamp}`;
  
  // In a real implementation, you'd use crypto.createHmac with the state secret
  // For now, we'll use a simple base64 encoding with timestamp
  return Buffer.from(data).toString('base64url');
}

/**
 * Validate and parse OAuth state parameter
 */
export function validateOAuthState(state: string): { claimId: string; userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString();
    const [claimId, userId, timestamp] = decoded.split(':');
    
    if (!claimId || !userId || !timestamp) {
      return null;
    }
    
    const ts = parseInt(timestamp);
    const now = Date.now();
    
    // State expires after 30 minutes
    if (now - ts > 30 * 60 * 1000) {
      return null;
    }
    
    return { claimId, userId, timestamp: ts };
  } catch {
    return null;
  }
}

/**
 * Generate Google OAuth authorization URL
 */
export function generateOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GMB_OAUTH_CONFIG.clientId,
    redirect_uri: GMB_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GMB_OAUTH_CONFIG.scopes.join(' '),
    state: state,
    access_type: 'offline', // For refresh tokens
    prompt: 'consent', // Force consent screen to get refresh token
  });
  
  return `${OAUTH_ENDPOINTS.authorize}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}> {
  const response = await fetch(OAUTH_ENDPOINTS.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GMB_OAUTH_CONFIG.clientId,
      client_secret: GMB_OAUTH_CONFIG.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: GMB_OAUTH_CONFIG.redirectUri,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Get user's Google account information
 */
export async function getUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}> {
  const response = await fetch(OAUTH_ENDPOINTS.userInfo, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get user's GMB accounts
 */
export async function getGMBAccounts(accessToken: string): Promise<GMBAccount[]> {
  const response = await fetch(OAUTH_ENDPOINTS.gmbAccounts, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get GMB accounts: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.accounts || [];
}

/**
 * Get all locations for a GMB account
 */
export async function getGMBLocations(accessToken: string, accountId: string): Promise<GMBLocation[]> {
  const response = await fetch(OAUTH_ENDPOINTS.gmbLocations(accountId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get GMB locations: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.locations || [];
}

/**
 * Get reviews for a specific GMB location
 */
export async function getGMBReviews(
  accessToken: string, 
  accountId: string, 
  locationId: string,
  pageToken?: string
): Promise<GMBReviewsResponse> {
  const url = new URL(OAUTH_ENDPOINTS.gmbReviews(accountId, locationId));
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get GMB reviews: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    reviews: data.reviews || [],
    nextPageToken: data.nextPageToken,
    totalReviewCount: data.totalReviewCount || 0,
    averageRating: data.averageRating || 0,
  };
}

/**
 * Convert GMB star rating to numeric value
 */
export function convertGMBRating(starRating: string): number {
  const ratingMap: Record<string, number> = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
  };
  return ratingMap[starRating] || 0;
}

/**
 * Parse GMB timestamp to JavaScript Date
 */
export function parseGMBTimestamp(timestamp?: string): number {
  if (!timestamp) return Date.now();
  return new Date(timestamp).getTime();
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const substitutionCost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Calculate address similarity with normalization
 */
function calculateAddressSimilarity(addr1: string, addr2?: { addressLines?: string[]; locality?: string; administrativeArea?: string; postalCode?: string }): number {
  if (!addr1 || !addr2) return 0;
  
  const normalizeAddress = (addr: string) => {
    return addr.toLowerCase()
      .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|place|pl|way|wy|circle|cir|trail|trl)\b/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const addr1Normalized = normalizeAddress(addr1);
  
  // Combine GMB address parts
  const addr2Parts = [
    ...(addr2.addressLines || []),
    addr2.locality || '',
    addr2.administrativeArea || '',
    addr2.postalCode || ''
  ].filter(Boolean);
  
  const addr2Combined = addr2Parts.join(' ');
  const addr2Normalized = normalizeAddress(addr2Combined);
  
  return calculateStringSimilarity(addr1Normalized, addr2Normalized);
}

/**
 * Compare phone numbers (normalize and check for match)
 */
function comparePhoneNumbers(phone1?: string, phone2?: string): boolean {
  if (!phone1 || !phone2) return false;
  
  const normalize = (phone: string) => phone.replace(/\D/g, '');
  
  const normalized1 = normalize(phone1);
  const normalized2 = normalize(phone2);
  
  // Check exact match or if one contains the other (for country codes)
  return normalized1 === normalized2 || 
         normalized1.includes(normalized2) || 
         normalized2.includes(normalized1);
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(scores: { name_match: number; address_match: number; phone_match: boolean }): number {
  const weights = {
    name: 0.5,      // 50% weight for name matching
    address: 0.35,  // 35% weight for address matching
    phone: 0.15     // 15% weight for phone matching
  };
  
  const phoneScore = scores.phone_match ? 100 : 0;
  
  return Math.round(
    scores.name_match * weights.name +
    scores.address_match * weights.address +
    phoneScore * weights.phone
  );
}

/**
 * Match business claim data with GMB locations
 */
export async function matchBusinessWithGMB(
  claimData: {
    businessName: string;
    address: string;
    phone?: string;
  },
  gmbLocations: GMBLocation[]
): Promise<GMBVerificationResult> {
  
  if (!gmbLocations || gmbLocations.length === 0) {
    return {
      verified: false,
      confidence: 0,
      requiresManualReview: false,
      matchDetails: { name_match: 0, address_match: 0, phone_match: false },
      failureReason: "No GMB locations found in user's account",
      allLocations: []
    };
  }
  
  // Calculate match scores for each location
  const matches = gmbLocations.map(location => {
    const locationName = location.locationName || location.name || '';
    const nameMatch = calculateStringSimilarity(claimData.businessName, locationName);
    const addressMatch = calculateAddressSimilarity(claimData.address, location.address);
    const phoneMatch = comparePhoneNumbers(claimData.phone, location.primaryPhone);
    
    const scores = {
      name_match: nameMatch,
      address_match: addressMatch,
      phone_match: phoneMatch
    };
    
    return {
      location,
      scores,
      confidence: calculateOverallConfidence(scores)
    };
  });
  
  // Find the best match
  const bestMatch = matches.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  const confidence = bestMatch.confidence;
  
  // Auto-approval thresholds
  const AUTO_APPROVE_THRESHOLD = 85;
  const MANUAL_REVIEW_THRESHOLD = 60;
  
  return {
    verified: confidence >= AUTO_APPROVE_THRESHOLD,
    matchedLocation: bestMatch.location,
    confidence,
    requiresManualReview: confidence >= MANUAL_REVIEW_THRESHOLD && confidence < AUTO_APPROVE_THRESHOLD,
    matchDetails: bestMatch.scores,
    allLocations: gmbLocations,
    failureReason: confidence < MANUAL_REVIEW_THRESHOLD ? 
      `Low confidence match (${confidence}%). Business details don't closely match any GMB locations.` : 
      undefined
  };
}

/**
 * Hash token for secure storage (simplified - use proper crypto in production)
 */
export function hashToken(token: string): string {
  // In production, use crypto.createHash('sha256').update(token).digest('hex')
  return Buffer.from(token).toString('base64url').slice(0, 32);
}

/**
 * Error types for GMB OAuth flow
 */
export const GMB_ERROR_TYPES = {
  NO_GMB_ACCOUNT: 'NO_GMB_ACCOUNT',
  BUSINESS_NOT_FOUND: 'BUSINESS_NOT_FOUND',
  LOW_CONFIDENCE_MATCH: 'LOW_CONFIDENCE_MATCH',
  OAUTH_DENIED: 'OAUTH_DENIED',
  API_ERROR: 'API_ERROR',
  INVALID_STATE: 'INVALID_STATE',
  TOKEN_EXCHANGE_FAILED: 'TOKEN_EXCHANGE_FAILED',
  REVIEW_SYNC_FAILED: 'REVIEW_SYNC_FAILED',
  RATE_LIMITED: 'RATE_LIMITED'
} as const;

export type GMBErrorType = typeof GMB_ERROR_TYPES[keyof typeof GMB_ERROR_TYPES];