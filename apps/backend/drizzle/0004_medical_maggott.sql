CREATE TABLE `registry_downloads` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`version_id` text NOT NULL,
	`user_id` text,
	`ip_address` text,
	`downloaded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registry_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`latest_version` text,
	`is_public` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registry_packages_name_idx` ON `registry_packages` (`name`);--> statement-breakpoint
CREATE INDEX `registry_packages_user_id_idx` ON `registry_packages` (`user_id`);--> statement-breakpoint
CREATE TABLE `registry_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`version` text NOT NULL,
	`storage_key` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`checksum` text NOT NULL,
	`changelog` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `registry_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registry_versions_pkg_ver_idx` ON `registry_versions` (`package_id`,`version`);