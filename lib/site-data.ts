import { env } from 'cloudflare:workers';

export const defaultMembers = [
  'أحمد خالد', 'أحمد عبدالعزيز', 'جواد', 'محمد الشريف', 'نواف فيصل', 'أحمد محمد',
  'عبدالعزيز المحمادي', 'فهد', 'زياد', 'مشاري', 'محمد علي', 'نايف',
  'نواف ضيف الله', 'عبدالرحمن', 'نواف حامد', 'محمد ناصر',
];

export function getBindings() {
  if (!env.DB || !env.FILES) throw new Error('تعذر الوصول إلى مساحة حفظ البيانات.');
  return { db: env.DB, files: env.FILES };
}

export async function ensureInitialData(db: D1Database) {
  const memberCount = await db.prepare('SELECT COUNT(*) AS count FROM members').first<{ count: number }>();
  if (!memberCount?.count) {
    const createdAt = new Date().toISOString();
    await db.batch(defaultMembers.map((name) => db.prepare('INSERT INTO members (name, active, created_at) VALUES (?, 1, ?)').bind(name, createdAt)));
  }
  await db.prepare("INSERT OR IGNORE INTO settings (id, amount, cycle_label, cycle_number) VALUES (1, 170, 'سبتمبر 2026', 1)").run();
}

export async function getPublicSiteData() {
  const { db } = getBindings();
  await ensureInitialData(db);
  const [settings, members] = await Promise.all([
    db.prepare('SELECT amount, cycle_label AS cycleLabel FROM settings WHERE id = 1').first<{ amount: number; cycleLabel: string }>(),
    db.prepare('SELECT id, name FROM members WHERE active = 1 ORDER BY id').all<{ id: number; name: string }>(),
  ]);
  return { amount: settings?.amount ?? 170, cycleLabel: settings?.cycleLabel ?? 'سبتمبر 2026', members: members.results };
}
