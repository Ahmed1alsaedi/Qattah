CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_members_name` ON `members` (`name`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`cycle_label` text NOT NULL,
	`receipt_key` text NOT NULL,
	`receipt_name` text NOT NULL,
	`receipt_type` text NOT NULL,
	`submitted_at` text NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payments_member_cycle` ON `payments` (`member_id`,`cycle_label`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`amount` integer DEFAULT 170 NOT NULL,
	`cycle_label` text DEFAULT 'سبتمبر 2026' NOT NULL
);
