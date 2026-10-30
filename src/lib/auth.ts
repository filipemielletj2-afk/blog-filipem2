import crypto from 'node:crypto';
import { cookies } from 'next/headers';

let cachedSecret: string | null = null;

// Securely retrieve the JWT secret from environment or auto-generate a persistent 256-bit secret in SQLite
export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    cachedSecret = process.env.JWT_SECRET.trim();
    return cachedSecret;
  }

  try {
    const { getDb } = require('./db');
    const db = getDb();
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('dynamic_jwt_secret') as any;
    if (row && row.value && row.value.length >= 32) {
      cachedSecret = row.value;
      return cachedSecret;
    }
    const newSecret = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run('dynamic_jwt_secret', newSecret);
    cachedSecret = newSecret;
    return cachedSecret;
  } catch {
    if (!cachedSecret) {
      cachedSecret = crypto.randomBytes(32).toString('hex');
    }
    return cachedSecret;
  }
}

const COOKIE_NAME = 'filipem2_admin_token';

// Hash password with scrypt + salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

// Verify password
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch (err) {
    return false;
  }
}

// Simple base64url encode/decode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

// Sign JWT
export function signJwt(payload: Record<string, any>, expiresInSeconds: number = 86400 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const secret = getJwtSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

// Verify JWT
export function verifyJwt<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const secret = getJwtSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload as T;
  } catch (err) {
    return null;
  }
}

// Get authenticated user from request cookies
export async function getCurrentUser(): Promise<{ id: number; email: string; name: string; role: string } | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwt(token);
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
