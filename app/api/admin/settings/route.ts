import { isAdmin } from '@/lib/admin-auth';
import { getBindings } from '@/lib/site-data';

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { amount?: number };
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0 || amount > 100000) return Response.json({ error: 'أدخل مبلغًا صحيحًا.' }, { status: 400 });
  const { db } = getBindings();
  await db.prepare('UPDATE settings SET amount = ? WHERE id = 1').bind(amount).run();
  return Response.json({ success: true });
}
