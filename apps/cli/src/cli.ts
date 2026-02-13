#!/usr/bin/env bun
import { Command } from "commander";
import { login, logout, whoami } from "./commands/auth";
import { setConfig, listConfig } from "./commands/config";
import { init, validate, pack, dev, start } from "./commands/course";
import { publish } from "./commands/publish";
import { save, sync, reset } from "./commands/sync";
import { patch, minor, major } from "./commands/version";
import pkg from "../package.json";

const program = new Command();

program
  .name("progy")
  .description("The interactive CLI and learning platform for Progy courses.")
  .version(pkg.version);

// --- Auth ---
program
  .command("login")
  .description("Login to your Progy account")
  .action(login);

program
  .command("logout")
  .description("Log out of your Progy account")
  .action(logout);

program
  .command("whoami")
  .description("Show the currently logged-in user")
  .action(whoami);

// --- Config ---
const config = program.command("config").description("Manage Progy configuration");

config
  .command("set")
  .description("Set a configuration value (e.g., config set ai.provider openai)")
  .argument("<path>", "Config path (e.g., ai.provider)")
  .argument("<value>", "Value to set")
  .action(setConfig);

config
  .command("list")
  .description("List all configuration values")
  .action(listConfig);

// --- Course Lifecycle (Instructor) ---
// Note: 'create' command moved to Studio
program
  .command("create")
  .description("Moved to Studio")
  .argument("[args...]")
  .action(() => {
    console.log("The 'create' command has been moved to Progy Studio.");
    process.exit(1);
  });

program
  .command("add")
  .description("Moved to Studio")
  .argument("[args...]")
  .action(() => {
    console.log("The 'add' command has been moved to Progy Studio.");
    process.exit(1);
  });

program
  .command("test")
  .description("Moved to Studio")
  .argument("[args...]")
  .action(() => {
    console.log("The 'test' command has been moved to Progy Studio.");
    process.exit(1);
  }); program
    .command("dev")
    .description("Test course locally as GUEST (no progress saved)")
    .option("--bypass", "Unlock all lessons for testing")
    .action(dev);

program
  .command("validate")
  .description("Validate a course's structure and configuration")
  .argument("[path]", "Path to course directory", ".")
  .action(validate);

program
  .command("pack")
  .description("Pack a course into a .progy file for distribution")
  .option("-o, --out <filename>", "Output filename")
  .action(pack);



program
  .command("publish")
  .description("Publish course to Progy registry")
  .option("--patch", "Increment patch version before publishing")
  .option("--minor", "Increment minor version before publishing")
  .option("--major", "Increment major version before publishing")
  .action(publish);

// --- Versioning ---
program
  .command("patch")
  .description("Increment course version (patch)")
  .action(patch);

program
  .command("minor")
  .description("Increment course version (minor)")
  .action(minor);

program
  .command("major")
  .description("Increment course version (major)")
  .action(major);

// --- Scaffolding (Instructor) ---
// Note: 'add' commands moved to Studio


// --- Student Commands ---
program
  .command("start", { isDefault: true })
  .description("Start learning a course")
  .option("--offline", "Run in offline mode (no cloud sync)")
  .argument("[file]", "Specific .progy file to open")
  .action(start);

// --- Deprecated/Legacy (kept for backwards compatibility) ---
program
  .command("init")
  .description("Initialize a new course from registry or Git")
  .argument("[package]", "Registry package (e.g. sql-basics) or Git URL")
  .option("-c, --course <id>", "Course ID (legacy)")
  .option("--offline", "Force offline mode")
  .action((pkg, options) => init({ ...options, course: pkg || options.course }));

program
  .command("save")
  .description("[Deprecated] Progress is auto-saved. Use UI instead.")
  .option("-m, --message <message>", "Commit message", "update progress")
  .action(save);

program
  .command("sync")
  .description("[Deprecated] Use UI sync instead.")
  .action(sync);

program
  .command("kill-port")
  .description("Kill a process running on a specific port")
  .argument("<port>", "Port number (e.g., 3001)")
  .action(async (port) => {
    const { killPort } = await import("./commands/utils");
    await killPort(port);
  });

program
  .command("reset")
  .description("Reset a specific file to its original state")
  .argument("<path>", "Path to the file")
  .action(reset);

program.parse();
