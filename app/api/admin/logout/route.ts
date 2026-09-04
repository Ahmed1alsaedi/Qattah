import { cookieName } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const response = Response.json({ success: true });
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  response.headers.append('Set-Cookie', `${cookieName}=; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=0`);
  return response;
}
