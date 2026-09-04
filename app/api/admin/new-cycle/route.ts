import { isAdmin } from '@/lib/admin-auth';
import { getBindings } from '@/lib/site-data';

export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const cycleLabel = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric' }).format(new Date());
  const { db } = getBindings();
  await db.prepare('UPDATE settings SET cycle_number = cycle_number + 1, cycle_label = ? WHERE id = 1').bind(cycleLabel).run();
  return Response.json({ success: true, cycleLabel });
}
