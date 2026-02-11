export * from './auth';
export * from './billing';
export * from './registry';
export * from './courses';

import { users, accounts, verifications, devices, sessions } from './auth';
import { courses, courseProgress } from './courses';
import { registryPackages, registryVersions, registryDownloads, registryStats } from './registry';

export const SelectUser = typeof users.$inferSelect;
export const InsertUser = typeof users.$inferInsert;

export const SelectAccount = typeof accounts.$inferSelect;
export const InsertAccount = typeof accounts.$inferInsert;

export const SelectVerification = typeof verifications.$inferSelect;
export const InsertVerification = typeof verifications.$inferInsert;

export const SelectCourse = typeof courses.$inferSelect;
export const InsertCourse = typeof courses.$inferInsert;

export const SelectDevice = typeof devices.$inferSelect;
export const InsertDevice = typeof devices.$inferInsert;

export const SelectCourseProgress = typeof courseProgress.$inferSelect;
export const InsertCourseProgress = typeof courseProgress.$inferInsert;

export const SelectRegistryPackage = typeof registryPackages.$inferSelect;
export const InsertRegistryPackage = typeof registryPackages.$inferInsert;

export const SelectRegistryVersion = typeof registryVersions.$inferSelect;
export const InsertRegistryVersion = typeof registryVersions.$inferInsert;

export const SelectRegistryDownload = typeof registryDownloads.$inferSelect;
export const InsertRegistryDownload = typeof registryDownloads.$inferInsert;

export const SelectRegistryStat = typeof registryStats.$inferSelect;
export const InsertRegistryStat = typeof registryStats.$inferInsert;
