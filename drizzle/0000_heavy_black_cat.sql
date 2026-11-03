CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`revision` integer NOT NULL,
	`state` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`mode` text DEFAULT 'demo' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `interests` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interest_member_listing` ON `interests` (`member_id`,`listing_id`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`model_id` text,
	`authenticity` text DEFAULT 'not_assessed' NOT NULL,
	`custody` text DEFAULT 'not_received' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`submission_id` text,
	`state` text DEFAULT 'draft' NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_item_id_unique` ON `listings` (`item_id`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`object_key` text,
	`derivative_key` text,
	`mime` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`slot` text NOT NULL,
	`fixture` text,
	`rights` text NOT NULL,
	`public_permission` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recognition` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`reason` text NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`revision` integer NOT NULL,
	`reviewer_id` text NOT NULL,
	`decision` text NOT NULL,
	`reason` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`item_id` text NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`reviewed_revision` integer,
	`data` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);