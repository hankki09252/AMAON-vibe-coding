CREATE TABLE `player_origin_schools` (
	`team_id` text NOT NULL,
	`player_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`region` text NOT NULL,
	`school` text NOT NULL,
	`year` integer NOT NULL,
	`position` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	PRIMARY KEY(`team_id`, `player_id`, `sequence`)
);
