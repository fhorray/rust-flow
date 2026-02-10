-- Clean registry data
DELETE FROM registry_downloads;
DELETE FROM registry_versions;
DELETE FROM registry_packages;

-- Clean core application data
DELETE FROM session;
DELETE FROM account;
DELETE FROM verification;
DELETE FROM subscription;
DELETE FROM device;
DELETE FROM course_progress;
DELETE FROM courses;
DELETE FROM user;
