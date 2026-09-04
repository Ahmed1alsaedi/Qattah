import { isAdmin } from '@/lib/admin-auth';
import { getBindings } from '@/lib/site-data';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const { id } = await context.params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) return Response.json({ error: 'عضو غير صالح.' }, { status: 400 });
  const { db } = getBindings();
  await db.prepare('UPDATE members SET active = 0 WHERE id = ?').bind(memberId).run();
  return Response.json({ success: true });
}
