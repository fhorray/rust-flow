ALTER TABLE `subscription` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `user` ADD `has_lifetime` integer DEFAULT false;