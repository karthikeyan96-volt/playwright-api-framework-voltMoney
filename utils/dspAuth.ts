/**
 * DSP Authentication Utility
 * 
 * Generates dynamic X-Timestamp and X-Signature headers for DSP API requests
 * HMAC Format: ${bodyString}.${timestamp}
 */

import * as crypto from 'crypto';

/**
 * Generate current timestamp in UTC format: yyyyMMddHHmmss
 */
export function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate HMAC-SHA256 signature in Base64 format
 * Canonical string format: 
 * - POST: ${bodyString}.${timestamp}
 * - GET: ${timestamp}
 */
export function generateSignature(
  timestamp: string,
  secretKey: string,
  requestBody?: any
): string {
  const bodyString = requestBody && Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : '';
  
  // For GET requests (empty body), use only timestamp
  // For POST requests (with body), use bodyString.timestamp
  const canonicalString = bodyString ? `${bodyString}.${timestamp}` : timestamp;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(canonicalString, 'utf8');
  return hmac.digest('base64');
}

/**
 * Generate DSP authentication headers (X-Timestamp and X-Signature)
 */
export function generateDspAuthHeaders(
  secretKey: string,
  requestBody?: any
): { 'X-Timestamp': string; 'X-Signature': string } {
  const timestamp = getCurrentTimestamp();
  const signature = generateSignature(timestamp, secretKey, requestBody);
  
  return {
    'X-Timestamp': timestamp,
    'X-Signature': signature
  };
}
