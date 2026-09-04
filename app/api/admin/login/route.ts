import { env } from 'cloudflare:workers';
import { cookieName, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: 'الرقم السري غير صحيح.' }, { status: 401 });
  }
  const response = Response.json({ success: true });
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  response.headers.append('Set-Cookie', `${cookieName}=${await createAdminSession()}; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=604800`);
  return response;
}
