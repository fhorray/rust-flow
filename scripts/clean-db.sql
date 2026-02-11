-- Disable foreign key constraints to avoid order errors
PRAGMA foreign_keys = OFF;

-- Remove Registry tables
DROP TABLE IF EXISTS registries_downloads;
DROP TABLE IF EXISTS registries_versions;
DROP TABLE IF EXISTS registries_packages;

-- Remove Core tables
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS verifications;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS courses_progress;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- Remove control table
DROP TABLE IF EXISTS __drizzle_migrations;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;