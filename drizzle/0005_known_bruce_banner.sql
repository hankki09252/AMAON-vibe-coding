ALTER TABLE `player_profile_overrides` ADD `roster_year` integer DEFAULT 2026 NOT NULL;--> statement-breakpoint
ALTER TABLE `player_profile_overrides` ADD `jersey_number` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `player_profile_overrides` ADD `grade` text DEFAULT '' NOT NULL;