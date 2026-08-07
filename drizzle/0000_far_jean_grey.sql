CREATE TABLE `media_likes` (
	`media_key` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`media_key`, `visitor_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_media_likes_media_key` ON `media_likes` (`media_key`);