import { getBindings, ensureInitialData } from '@/lib/site-data';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const memberId = Number(form.get('memberId'));
    const receipt = form.get('receipt');
    const replace = form.get('replace') === 'true';

    if (!Number.isInteger(memberId) || !(receipt instanceof File) || receipt.size === 0) {
      return Response.json({ error: 'اختر اسمك وإيصال التحويل.' }, { status: 400 });
    }
    if (!allowedTypes.has(receipt.type)) {
      return Response.json({ error: 'صيغة الإيصال غير مدعومة.' }, { status: 400 });
    }
    if (receipt.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'حجم الإيصال يجب ألا يتجاوز 10 ميجابايت.' }, { status: 400 });
    }

    const { db, files } = getBindings();
    await ensureInitialData(db);
    const member = await db.prepare('SELECT id FROM members WHERE id = ? AND active = 1').bind(memberId).first();
    const settings = await db.prepare('SELECT cycle_label AS cycleLabel, cycle_number AS cycleNumber FROM settings WHERE id = 1').first<{ cycleLabel: string; cycleNumber: number }>();
    if (!member || !settings) return Response.json({ error: 'العضو غير موجود.' }, { status: 404 });

    const existing = await db.prepare('SELECT id, receipt_key AS receiptKey FROM payments WHERE member_id = ? AND cycle_number = ?').bind(memberId, settings.cycleNumber).first<{ id: number; receiptKey: string }>();
    if (existing && !replace) return Response.json({ duplicate: true }, { status: 409 });

    const extension = receipt.type === 'application/pdf' ? 'pdf' : receipt.type === 'image/png' ? 'png' : 'jpg';
    const receiptKey = `receipts/${settings.cycleLabel}/${memberId}-${crypto.randomUUID()}.${extension}`;
    await files.put(receiptKey, receipt.stream(), { httpMetadata: { contentType: receipt.type } });
    const submittedAt = new Date().toISOString();

    if (existing) {
      await db.prepare('UPDATE payments SET receipt_key = ?, receipt_name = ?, receipt_type = ?, submitted_at = ? WHERE id = ?').bind(receiptKey, receipt.name, receipt.type, submittedAt, existing.id).run();
      await files.delete(existing.receiptKey);
    } else {
      await db.prepare('INSERT INTO payments (member_id, cycle_label, cycle_number, receipt_key, receipt_name, receipt_type, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(memberId, settings.cycleLabel, settings.cycleNumber, receiptKey, receipt.name, receipt.type, submittedAt).run();
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'تعذر حفظ التحويل. حاول مرة أخرى.' }, { status: 500 });
  }
}
