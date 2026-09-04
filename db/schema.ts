import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
}, (table) => [uniqueIndex('idx_members_name').on(table.name)]);

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  amount: integer('amount').notNull().default(170),
  cycleLabel: text('cycle_label').notNull().default('سبتمبر 2026'),
  cycleNumber: integer('cycle_number').notNull().default(1),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memberId: integer('member_id').notNull().references(() => members.id),
  cycleLabel: text('cycle_label').notNull(),
  cycleNumber: integer('cycle_number').notNull().default(1),
  receiptKey: text('receipt_key').notNull(),
  receiptName: text('receipt_name').notNull(),
  receiptType: text('receipt_type').notNull(),
  submittedAt: text('submitted_at').notNull(),
}, (table) => [uniqueIndex('idx_payments_member_cycle').on(table.memberId, table.cycleNumber)]);
