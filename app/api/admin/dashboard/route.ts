import { isAdmin } from '@/lib/admin-auth';
import { ensureInitialData, getBindings } from '@/lib/site-data';

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const { db } = getBindings();
  await ensureInitialData(db);
  const settings = await db.prepare('SELECT amount, cycle_label AS cycleLabel, cycle_number AS cycleNumber FROM settings WHERE id = 1').first<{ amount: number; cycleLabel: string; cycleNumber: number }>();
  if (!settings) return Response.json({ error: 'تعذر تحميل الإعدادات.' }, { status: 500 });
  const members = await db.prepare(`
    SELECT m.id, m.name, p.id AS paymentId, p.receipt_type AS receiptType, p.submitted_at AS submittedAt
    FROM members m
    LEFT JOIN payments p ON p.member_id = m.id AND p.cycle_number = ?
    WHERE m.active = 1
    ORDER BY m.id
  `).bind(settings.cycleNumber).all<{ id: number; name: string; paymentId: number | null; receiptType: string | null; submittedAt: string | null }>();
  const paidCount = members.results.filter((member) => member.paymentId !== null).length;
  return Response.json({ ...settings, members: members.results, paidCount, unpaidCount: members.results.length - paidCount });
}
