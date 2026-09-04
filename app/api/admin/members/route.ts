import { isAdmin } from '@/lib/admin-auth';
import { ensureInitialData, getBindings } from '@/lib/site-data';

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = body.name?.trim();
  if (!name || name.length > 80) return Response.json({ error: 'اكتب اسمًا صحيحًا.' }, { status: 400 });
  const { db } = getBindings();
  await ensureInitialData(db);
  const existing = await db.prepare('SELECT id, active FROM members WHERE name = ?').bind(name).first<{ id: number; active: number }>();
  if (existing?.active) return Response.json({ error: 'هذا الاسم موجود مسبقًا.' }, { status: 409 });
  if (existing) await db.prepare('UPDATE members SET active = 1 WHERE id = ?').bind(existing.id).run();
  else await db.prepare('INSERT INTO members (name, active, created_at) VALUES (?, 1, ?)').bind(name, new Date().toISOString()).run();
  return Response.json({ success: true });
}
