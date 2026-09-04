DROP INDEX `idx_payments_member_cycle`;--> statement-breakpoint
ALTER TABLE `payments` ADD `cycle_number` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payments_member_cycle` ON `payments` (`member_id`,`cycle_number`);--> statement-breakpoint
ALTER TABLE `settings` ADD `cycle_number` integer DEFAULT 1 NOT NULL;