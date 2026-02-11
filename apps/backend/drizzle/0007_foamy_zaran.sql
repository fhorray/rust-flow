ALTER TABLE `registry_packages` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `registry_versions` ADD `engine_version` text;