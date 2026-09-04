import { isAdmin } from '@/lib/admin-auth';
import { getBindings } from '@/lib/site-data';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'غير مصرح.' }, { status: 401 });
  const { id } = await context.params;
  const { db, files } = getBindings();
  const payment = await db.prepare('SELECT receipt_key AS receiptKey, receipt_name AS receiptName, receipt_type AS receiptType FROM payments WHERE id = ?').bind(Number(id)).first<{ receiptKey: string; receiptName: string; receiptType: string }>();
  if (!payment) return Response.json({ error: 'الإيصال غير موجود.' }, { status: 404 });
  const object = await files.get(payment.receiptKey);
  if (!object) return Response.json({ error: 'ملف الإيصال غير موجود.' }, { status: 404 });
  return new Response(object.body, { headers: { 'Content-Type': payment.receiptType, 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(payment.receiptName)}`, 'Cache-Control': 'private, no-store' } });
}
