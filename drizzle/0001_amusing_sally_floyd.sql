CREATE TABLE `site_members` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`joined_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
