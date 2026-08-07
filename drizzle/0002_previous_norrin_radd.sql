CREATE TABLE `player_profile_overrides` (
	`team_id` text NOT NULL,
	`player_id` text NOT NULL,
	`position` text NOT NULL,
	`height` integer NOT NULL,
	`weight` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	PRIMARY KEY(`team_id`, `player_id`)
);
