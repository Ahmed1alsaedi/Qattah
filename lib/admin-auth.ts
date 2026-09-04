import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';

const cookieName = 'qattah_admin';

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function signature(value: string) {
  if (!env.ADMIN_SESSION_SECRET) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.ADMIN_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export async function createAdminSession() {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return `${expires}.${await signature(String(expires))}`;
}

export async function verifyAdminSession(value?: string) {
  if (!value) return false;
  const [expires, provided] = value.split('.');
  if (!expires || !provided || Number(expires) < Date.now()) return false;
  return provided === await signature(expires);
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(cookieName)?.value);
}

export { cookieName };
